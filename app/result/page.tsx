"use client";

import React, { JSX, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/** zustand persist에 사용한 세션스토리지 키 */
const STORAGE_KEY = "mx:psych:v1:state";

interface PrescriptionData {
  id: number;
  code: string;
  name: string;
  dear: string;
  letter: string;
  concept: string;
  movie: string;
  challengeConcept: string;
  challengeKeyword: string;
  challengeActivity: string;
  maintainConcept: string;
  maintainKeyword: string;
  maintainActivity: string;
  reconcileConcept: string;
  reconcileKeyword: string;
  reconcileActivity: string;
}

interface MissionLevel {
  level: number;
  title: string;
  concept: string;
  keyword: string;
  activity: string;
  difficulty: "ROOKIE" | "VETERAN" | "MASTER";
  requiredActions: string[];
  rewards: string[];
}

export default function RefinedResultsPage(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [prescription, setPrescription] = useState<PrescriptionData | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 연출/상태
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [connectionPhase, setConnectionPhase] = useState<string>("");
  const [connectionProgress, setConnectionProgress] = useState<number>(0);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [matrixRain, setMatrixRain] = useState<string[]>([]);
  const [selectedMission, setSelectedMission] = useState<number>(1);

  // 코멘트 & 저장
  const [commentText, setCommentText] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);
  const [lastSentAt, setLastSentAt] = useState<Date | null>(null);

  // 1차 저장 후 받은 result id
  const [resultId, setResultId] = useState<number | null>(null);

  // answers는 재수화 타이밍 이슈를 고려해 state로 관리
  const [answers, setAnswers] = useState<any>({});

  // 중복 POST 방지 플래그
  const isPostingRef = useRef(false);

  // 매트릭스 레인
  useEffect(() => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
    const interval = setInterval(() => {
      const newRain = Array.from(
        { length: 50 },
        () => characters[Math.floor(Math.random() * characters.length)]
      );
      setMatrixRain(newRain);
    }, 150);
    return () => clearInterval(interval);
  }, []);

  // code, nickname 파싱
  const code = useMemo(
    () => (searchParams.get("code") || "").trim().toUpperCase(),
    [searchParams]
  );

  // ✅ sessionStorage 닉네임도 함께 확인
  const nickname = useMemo(() => {
    const fromQuery = (
      searchParams.get("nickname") ||
      searchParams.get("name") ||
      ""
    ).trim();
    if (fromQuery) return fromQuery;

    try {
      const fromLocal = localStorage.getItem("nickname");
      if (fromLocal && fromLocal.trim()) return fromLocal.trim();
    } catch {}

    try {
      const fromSession = sessionStorage.getItem("nickname");
      if (fromSession && fromSession.trim()) return fromSession.trim();
    } catch {}

    return "anonymous";
  }, [searchParams]);

  // ✅ answers 재수화: zustand persist 구조 + 재시도 + 보조키
  function readAnswersFromSession(): any | null {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.state?.answers ?? parsed?.answers ?? null;
    } catch {
      return null;
    }
  }

  useEffect(() => {
    const first = readAnswersFromSession();
    if (first && Object.keys(first).length > 0) {
      setAnswers(first);
    } else {
      // rehydrate 대기 후 한 번 더 시도
      const t = setTimeout(() => {
        const second = readAnswersFromSession();
        if (second && Object.keys(second).length > 0) {
          setAnswers(second);
          return;
        }
        // 보조 키
        try {
          const fallback = sessionStorage.getItem("answers");
          if (fallback) {
            const parsed = JSON.parse(fallback);
            if (parsed && Object.keys(parsed).length > 0) setAnswers(parsed);
          }
        } catch {}
      }, 120);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    if (!code) {
      router.replace("/test");
      return;
    }
    void bootstrap(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  /** 초기: 처방전 조회 → resultId 캐시 확인/생성(POST) → 연출 시작 */
  const bootstrap = async (missionCode: string) => {
    try {
      setLoading(true);

      // 1) 처방전 조회
      const res = await fetch(
        `/api/prescriptions?code=${encodeURIComponent(missionCode)}`
      );
      if (!res.ok) throw new Error("MISSION DATA NOT FOUND");
      const data: PrescriptionData = await res.json();
      setPrescription(data);

      // 2) code별 resultId 캐시 조회
      const cachedId = getCachedResultId(missionCode);
      if (cachedId) {
        setResultId(cachedId);
        tryRestoreDraft(cachedId);
      } else {
        // answers가 아직 비어있으면 당장 POST하지 않고 잠깐 유예
        if (!answers || Object.keys(answers).length === 0) {
          await new Promise((r) => setTimeout(r, 120));
        }
        if (answers && Object.keys(answers).length > 0) {
          await createInitialResult(missionCode);
        } else {
          console.warn("[bootstrap] answers empty → skip POST this time.");
        }
      }

      // 3) 연출 시작
      startTypewriter();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "SYSTEM ERROR DETECTED");
    } finally {
      setLoading(false);
    }
  };

  /** answers 준비 후 아직 resultId가 없다면 1차 저장을 보장 */
  useEffect(() => {
    if (!code) return;
    if (resultId) return;
    if (isPostingRef.current) return;
    if (!answers || Object.keys(answers).length === 0) return;
    // 캐시도 다시 한 번 확인
    const cached = getCachedResultId(code);
    if (cached) {
      setResultId(cached);
      tryRestoreDraft(cached);
      return;
    }
    void createInitialResult(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, code]);

  /** 세션스토리지에서 code별 resultId 복구 */
  const getCachedResultId = (missionCode: string): number | null => {
    try {
      const key = `mx:resultIdByCode:${missionCode}`;
      const v = sessionStorage.getItem(key);
      if (!v) return null;
      const n = Number.parseInt(v, 10);
      return Number.isFinite(n) ? n : null;
    } catch {
      return null;
    }
  };

  /** code별 resultId 캐시 저장 */
  const setCachedResultId = (missionCode: string, id: number) => {
    try {
      sessionStorage.setItem(`mx:resultIdByCode:${missionCode}`, String(id));
    } catch {}
  };

  /** 1차 저장: POST /api/results (answers, code, nickname) */
  const createInitialResult = async (missionCode: string) => {
    if (isPostingRef.current) return;

    // ✅ 빈 answers 방지: 빈 객체면 POST 스킵
    if (!answers || Object.keys(answers).length === 0) {
      console.warn("[createInitialResult] answers is empty. Skip POST.");
      return;
    }

    isPostingRef.current = true;
    try {
      // ✅ 서버가 name 컬럼을 쓰는 경우까지 대비해서 둘 다 보냄
      const payload: Record<string, any> = {
        answers,
        code: missionCode,
        nickname,
        name: nickname,
      };
      const resp = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        throw new Error("FAILED TO CREATE RESULT");
      }

      const json = await resp.json();
      const id = json?.data?.id as number | undefined;
      if (!id) throw new Error("INVALID RESULT ID");

      setResultId(id);
      setCachedResultId(missionCode, id);

      // 로컬 임시 코멘트 복원
      tryRestoreDraft(id);
    } finally {
      isPostingRef.current = false;
    }
  };

  /** 로컬 임시 코멘트 복원 */
  const tryRestoreDraft = (rid: number) => {
    try {
      const cached = localStorage.getItem(`result:${rid}:comment`);
      if (cached) setCommentText(cached);
    } catch {}
  };

  /** 시퀀스 연출 */
  const startTypewriter = (): void => {
    setCurrentStep(1);
    setTimeout(() => startConnection("ESTABLISHING SECURE CHANNEL", 1), 1000);
  };

  const startConnection = (phase: string, nextStep: number): void => {
    setIsConnecting(true);
    setConnectionPhase(phase);
    setConnectionProgress(0);

    const connectionSteps = [
      "INITIALIZING QUANTUM ENCRYPTION...",
      "VERIFYING NEURAL SIGNATURE...",
      "AUTHENTICATING CLEARANCE LEVEL...",
      "ESTABLISHING SECURE TUNNEL...",
      "SYNCHRONIZING MATRIX DATA...",
      "CONNECTION ESTABLISHED",
    ];

    let stepIndex = 0;
    let progress = 0;

    const connectionInterval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      setConnectionProgress(Math.min(progress, 100));

      if (
        stepIndex < connectionSteps.length &&
        progress > (stepIndex + 1) * 16
      ) {
        setConnectionPhase(connectionSteps[stepIndex]);
        stepIndex++;
      }

      if (progress >= 100) {
        clearInterval(connectionInterval);
        setTimeout(() => {
          setIsConnecting(false);
          setCurrentStep(nextStep + 1);

          if (nextStep === 1) {
            setTimeout(
              () => startConnection("ACCESSING MISSION DATABASE", 2),
              1000
            );
          } else if (nextStep === 2) {
            setTimeout(
              () => startConnection("LOADING TACTICAL PROTOCOLS", 3),
              1000
            );
          } else if (nextStep === 3) {
            setTimeout(
              () => startConnection("ACTIVATING FIELD INTERFACE", 4),
              1000
            );
          }
        }, 600);
      }
    }, 120);
  };

  const handleRestart = (): void => {
    router.push("/test");
  };

  /** 공통 PATCH 함수 */
  const patchComment = async (rid: number, text: string) => {
    const res = await fetch(`/api/results/${rid}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment: text }),
    });
    return res;
  };

  /** SEND REPORT: 코멘트 2차 저장(PATCH) */
  const handleSendComment = async (): Promise<void> => {
    if (!resultId) {
      alert("RESULT ID NOT READY");
      return;
    }
    const tString = commentText.trim();
    if (!tString) {
      alert("MISSION REPORT REQUIRED");
      return;
    }

    try {
      setSending(true);
      const res = await patchComment(resultId, tString);

      if (!res.ok) {
        localStorage.setItem(`result:${resultId}:comment`, tString);
        throw new Error("TRANSMISSION FAILED - DATA CACHED LOCALLY");
      }

      localStorage.removeItem(`result:${resultId}:comment`);
      setLastSentAt(new Date());
      alert("MISSION REPORT TRANSMITTED");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "UNKNOWN SYSTEM ERROR";
      alert(msg);
    } finally {
      setSending(false);
    }
  };

  /** SAVE 버튼: 동일 PATCH(로컬 캐시 로직 동일) */
  const handleSave = async (): Promise<void> => {
    if (!resultId) {
      alert("RESULT ID NOT READY");
      return;
    }
    const tString = commentText.trim();
    if (!tString) {
      alert("MISSION REPORT REQUIRED");
      return;
    }

    try {
      setSaving(true);
      const res = await patchComment(resultId, tString);

      if (!res.ok) {
        localStorage.setItem(`result:${resultId}:comment`, tString);
        throw new Error("SAVE FAILED - DATA CACHED LOCALLY");
      }

      localStorage.removeItem(`result:${resultId}:comment`);
      alert("MISSION DATA SAVED TO MAINFRAME");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "UNKNOWN SYSTEM ERROR";
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  /** Ctrl/Cmd + Enter 전송 */
  const onCommentKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (
    e
  ) => {
    const isMac =
      typeof navigator !== "undefined" &&
      /Mac|iPhone|iPad/.test(navigator.platform);
    const meta = isMac ? e.metaKey : e.ctrlKey;
    if (meta && e.key === "Enter") {
      e.preventDefault();
      void handleSendComment();
    }
  };

  const getMissionLevels = (p: PrescriptionData): MissionLevel[] => [
    {
      level: 1,
      title: "ENTRY PROTOCOL",
      concept: p.challengeConcept,
      keyword: p.challengeKeyword,
      activity: p.challengeActivity,
      difficulty: "ROOKIE",
      requiredActions: [
        "COMPLETE PRIMARY OBJECTIVE",
        "DOCUMENT EXPERIENCE",
        "REPORT STATUS",
      ],
      rewards: [
        "ACCESS TO LEVEL 2",
        "BASIC NEURAL UPGRADE",
        "+10 CONFIDENCE POINTS",
      ],
    },
    {
      level: 2,
      title: "STABILIZATION MODE",
      concept: p.maintainConcept,
      keyword: p.maintainKeyword,
      activity: p.maintainActivity,
      difficulty: "VETERAN",
      requiredActions: [
        "MAINTAIN PROTOCOL FOR 48H",
        "ANALYZE FEEDBACK LOOPS",
        "OPTIMIZE PERFORMANCE",
      ],
      rewards: [
        "ACCESS TO LEVEL 3",
        "ENHANCED NEURAL PATHWAYS",
        "+25 STABILITY POINTS",
      ],
    },
    {
      level: 3,
      title: "INTEGRATION MATRIX",
      concept: p.reconcileConcept,
      keyword: p.reconcileKeyword,
      activity: p.reconcileActivity,
      difficulty: "MASTER",
      requiredActions: [
        "SYNCHRONIZE ALL SYSTEMS",
        "ACHIEVE EQUILIBRIUM STATE",
        "COMPLETE FULL INTEGRATION",
      ],
      rewards: ["SYSTEM MASTERY", "NEURAL MATRIX UNLOCK", "+50 WISDOM POINTS"],
    },
  ];

  if (loading) {
    return (
      <div className="matrix-container crt-flicker">
        <div className="matrix-rain">
          {matrixRain.map((char, i) => (
            <span
              key={i}
              className="rain-char"
              style={{ left: `${i * 2}%`, animationDelay: `${i * 0.1}s` }}
            >
              {char}
            </span>
          ))}
        </div>

        <div className="crt-screen">
          <div className="crt-content">
            <div className="loading-display">
              <div className="loading-icon">◐</div>
              <div className="loading-text crt-text-glow">
                ACCESSING NEURAL MATRIX...
              </div>
              <div className="loading-subtext">PLEASE MAINTAIN CONNECTION</div>
            </div>
          </div>
        </div>

        <style jsx>{styles}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="matrix-container">
        <div className="crt-screen">
          <div className="crt-content">
            <div className="error-display">
              <div className="error-icon">⚠</div>
              <div className="error-text crt-text-glow">{error}</div>
              <button className="restart-btn" onClick={handleRestart}>
                RETRY CONNECTION
              </button>
            </div>
          </div>
        </div>
        <style jsx>{styles}</style>
      </div>
    );
  }

  if (!prescription) return <></>;

  const missions = getMissionLevels(prescription);
  const currentMission = missions[selectedMission - 1];

  return (
    <div className="matrix-container crt-flicker">
      {/* Background Matrix Rain */}
      <div className="matrix-rain">
        {matrixRain.map((char, i) => (
          <span
            key={i}
            className="rain-char"
            style={{ left: `${i * 2}%`, animationDelay: `${i * 0.1}s` }}
          >
            {char}
          </span>
        ))}
      </div>

      <div className="crt-screen">
        <div className="crt-content">
          {/* Header */}
          <div className="terminal-header">
            <div className="status-line">
              <span className="prompt crt-text-glow">
                NEURAL-LINK@MATRIX:~$
              </span>
              <span className="status crt-text-glow">CONNECTED</span>
              <span className="timestamp">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>

          {/* 처방전 요약 */}
          <div className="section">
            <div className="section-header crt-text-glow">
              [PRESCRIPTION SUMMARY] - CODE: {prescription.code}
            </div>
            <div className="mission-details">
              <div className="mission-header">
                <div className="mission-title crt-text-glow">
                  {prescription.name || prescription.code}
                </div>
                <div className="difficulty-badge">PROFILE</div>
              </div>
              <div className="mission-info">
                <div className="info-row">
                  <span className="info-label">DEAR:</span>
                  <span className="info-value crt-text-glow">
                    {prescription.dear || "-"}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">CONCEPT:</span>
                  <span className="info-value crt-text-glow">
                    {prescription.concept || "-"}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">MOVIE:</span>
                  <span className="info-value crt-text-glow">
                    {prescription.movie || "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Letter */}
          {currentStep >= 1 && (
            <div className="letter-section">
              <div className="letter-title crt-text-glow">
                📧 PERSONAL MESSAGE
              </div>
              <div className="letter-content">
                <div className="agent-profile-inline">
                  <div className="profile-label crt-text-glow">
                    [AGENT PROFILE] - CLEARANCE LEVEL: CLASSIFIED
                  </div>
                  <div className="agent-name crt-text-glow">
                    {prescription.name}
                  </div>
                </div>
                {prescription.letter && (
                  <div className="letter-body crt-text-glow">
                    {prescription.letter}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 연결 애니메이션 */}
          {isConnecting && (
            <div className="connection-screen">
              <div className="connection-title crt-text-glow">
                {connectionPhase}
              </div>
              <div className="connection-animation">
                <div className="connection-nodes">
                  <span className="node">◉</span>
                  <span className="node">○</span>
                  <span className="node">○</span>
                </div>
                <div className="connection-lines">
                  <span className="line">━━━</span>
                  <span className="line">━━━</span>
                </div>
                <div className="connection-nodes">
                  <span className="node">○</span>
                  <span className="node">○</span>
                  <span className="node">◉</span>
                </div>
              </div>
              <div className="status-text crt-text-glow">
                ESTABLISHING QUANTUM TUNNEL...
              </div>
              <div className="progress-container">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${connectionProgress}%` }}
                  />
                </div>
                <span className="progress-percent crt-text-glow">
                  {Math.round(connectionProgress)}%
                </span>
              </div>
            </div>
          )}

          {/* Briefing */}
          {currentStep >= 2 && (
            <div className="section">
              <div className="section-header crt-text-glow">
                [MISSION BRIEFING] - OPERATION: NEURAL ENHANCEMENT
              </div>
              <div className="briefing-content">
                <div className="concept-text crt-text-glow">
                  {prescription.concept}
                </div>
                {prescription.movie && (
                  <div className="inspiration-section">
                    <div className="inspiration-label crt-text-glow">
                      INSPIRATION PROTOCOL:
                    </div>
                    <div className="inspiration-text">
                      "{prescription.movie}"
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Levels */}
          {currentStep >= 3 && (
            <div className="section">
              <div className="section-header crt-text-glow">
                [TACTICAL PROTOCOLS] - SELECT MISSION LEVEL
              </div>

              <div className="level-selector">
                {missions.map((mission) => (
                  <button
                    key={mission.level}
                    className={`level-tab ${
                      selectedMission === mission.level ? "active" : ""
                    }`}
                    onClick={() => setSelectedMission(mission.level)}
                  >
                    <span className="level-number">LV.{mission.level}</span>
                    <span className="level-name">{mission.title}</span>
                  </button>
                ))}
              </div>

              <div className="mission-details">
                <div className="mission-header">
                  <div className="mission-title crt-text-glow">
                    {currentMission.title}
                  </div>
                  <div className="difficulty-badge">
                    {currentMission.difficulty}
                  </div>
                </div>

                <div className="mission-info">
                  <div className="info-row">
                    <span className="info-label">CONCEPT:</span>
                    <span className="info-value crt-text-glow">
                      {currentMission.concept}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">KEYWORD:</span>
                    <span className="info-value highlight crt-text-glow">
                      {currentMission.keyword}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">ACTIVITY:</span>
                    <span className="info-value crt-text-glow">
                      {currentMission.activity}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Report(코멘트 작성 → PATCH) */}
          {currentStep >= 4 && (
            <div className="section">
              <div className="section-header crt-text-glow">
                [MISSION REPORT] - FIELD TRANSMISSION
              </div>

              <div className="report-section">
                <textarea
                  className="report-textarea"
                  placeholder="ENTER MISSION STATUS REPORT..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={onCommentKeyDown}
                />

                <div className="report-footer">
                  <div className="quick-hint">
                    💡 Ctrl+Enter: Quick Transmission
                  </div>
                  {lastSentAt && (
                    <div className="transmission-status">
                      Last transmission: {lastSentAt.toLocaleTimeString()}
                    </div>
                  )}
                </div>

                <div className="action-buttons">
                  <button
                    className="action-btn save-btn"
                    onClick={handleSave}
                    disabled={saving || !commentText.trim() || !resultId}
                  >
                    {saving ? "💾 SAVING..." : "💾 SAVE"}
                  </button>
                  <button
                    className="action-btn send-btn"
                    onClick={handleSendComment}
                    disabled={sending || !commentText.trim() || !resultId}
                  >
                    {sending ? "📡 SENDING..." : "📡 SEND REPORT"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="control-section">
            <div className="control-actions">
              <button className="restart-btn" onClick={handleRestart}>
                🔄 NEW MISSION
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{styles}</style>
    </div>
  );
}

/** 최종 스타일 */
const styles = `
/* (생략 없이 기존 styles 그대로) */
.matrix-container {
  min-height: 100vh;
  background: radial-gradient(ellipse at center, rgba(0, 15, 8, 0.7), rgba(0, 0, 0, 0.85));
  position: relative;
  padding: 20px;
  font-family: "Courier New", ui-monospace, SFMono-Regular, Menlo, monospace;
  padding-top: max(20px, env(safe-area-inset-top, 0));
  padding-bottom: max(20px, env(safe-area-inset-bottom, 0));
  padding-left: max(20px, env(safe-area-inset-left, 0));
  padding-right: max(20px, env(safe-area-inset-right, 0));
}
.crt-flicker { animation: crt-flicker 4s infinite ease-in-out; }
.crt-text-glow { text-shadow: 0 0 3px #00ffaa, 0 0 8px #00ff88, 0 0 20px rgba(0, 255, 100, 0.6),2px 2px 2px #000000, -1px -1px 1px #000000, 1px -1px 1px #000000, -1px 1px 1px #000000; }
.matrix-rain { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; }
.rain-char { position: absolute; color: rgba(0, 255, 140, 0.3); font-size: 14px; animation: fall 3s linear infinite; font-family: "Courier New", monospace; }
.crt-screen { background: rgba(0, 12, 6, 0.6); border: 2px solid rgba(0, 255, 140, 0.4); border-radius: 8px; min-height: 90vh; max-width: 1200px; width: 100%; margin: 0 auto; position: relative; z-index: 2; backdrop-filter: blur(3px); box-shadow: 0 0 30px rgba(0, 255, 120, 0.2), inset 0 0 30px rgba(0, 60, 30, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.6); }
.crt-content { padding: 30px; color: #bbffdd; font-weight: 600; }
.terminal-header { background: rgba(0, 12, 6, 0.4); border: 1px solid rgba(0, 255, 140, 0.2); border-radius: 4px; padding: 15px; margin-bottom: 20px; backdrop-filter: blur(3px); }
.status-line { display: flex; justify-content: space-between; align-items: center; font-size: 12px; }
.prompt { color: #bbffdd; }
.status { color: #a7ffd8; }
.timestamp { color: #a7ffd8; opacity: 0.8; }
.letter-section { background: rgba(0, 12, 6, 0.8); border: 2px solid rgba(0, 255, 140, 0.5); border-radius: 8px; padding: 25px; margin-bottom: 20px; backdrop-filter: blur(3px); box-shadow: 0 0 35px rgba(0, 255, 120, 0.25), inset 0 0 35px rgba(0, 60, 30, 0.25); }
.letter-title { color: #bbffdd; font-size: 16px; font-weight: 700; margin: 0 0 20px 0; letter-spacing: 2px; text-transform: uppercase; text-align: center; border-bottom: 1px solid rgba(0, 255, 140, 0.3); padding-bottom: 12px; }
.letter-content { line-height: 1.8; font-size: 15px; }
.agent-profile-inline { background: rgba(0, 12, 6, 0.4); border: 1px solid rgba(0, 255, 140, 0.3); border-radius: 6px; padding: 16px; margin-bottom: 20px; backdrop-filter: blur(2px); text-align: center; }
.profile-label { color: #bbffdd; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; margin-bottom: 10px; text-transform: uppercase; }
.agent-name { color: #bbffdd; font-size: 20px; font-weight: 900; letter-spacing: 2px; }
.letter-body { color: #bbffdd; margin-bottom: 16px; line-height: 1.8; font-size: 15px; }
.connection-screen { background: rgba(0, 12, 6, 0.6); border: 2px solid rgba(0, 255, 140, 0.4); border-radius: 8px; padding: 30px; margin: 20px 0; text-align: center; backdrop-filter: blur(3px); }
.connection-title { color: #bbffdd; font-size: 12px; font-weight: 700; letter-spacing: 2px; margin-bottom: 20px; }
.connection-animation { display: flex; justify-content: center; align-items: center; margin: 30px 0; gap: 5px; }
.connection-nodes { display: flex; gap: 8px; }
.node { color: #bbffdd; font-size: 20px; animation: pulse 1.5s infinite; }
.connection-lines { display: flex; flex-direction: column; margin: 0 10px; gap: 3px; }
.line { color: #a7ffd8; font-size: 12px; opacity: 0.7; }
.status-text { color: #bbffdd; font-size: 14px; margin-bottom: 20px; }
.progress-container { display: flex; align-items: center; gap: 15px; margin: 20px 0; }
.progress-bar { flex: 1; height: 12px; background: rgba(0, 12, 6, 0.6); border: 1px solid rgba(0, 255, 140, 0.3); border-radius: 6px; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, rgba(0, 255, 140, 0.4) 0%, rgba(0, 255, 140, 0.8) 50%, rgba(0, 255, 140, 0.4) 100%); transition: width 0.3s ease; box-shadow: 0 0 10px rgba(0, 255, 140, 0.4); }
.progress-percent { color: #bbffdd; font-size: 14px; font-weight: 700; min-width: 40px; }
.section { background: rgba(0, 12, 6, 0.4); border: 1px solid rgba(0, 255, 140, 0.2); border-radius: 4px; padding: 20px; margin-bottom: 20px; backdrop-filter: blur(3px); }
.section-header { color: #bbffdd; font-size: 14px; font-weight: 700; letter-spacing: 1px; margin-bottom: 15px; text-align: center; text-transform: uppercase; }
.level-selector { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
.level-tab { background: rgba(0, 12, 6, 0.4); border: 1px solid rgba(0, 255, 140, 0.3); color: #bbffdd; padding: 10px 14px; border-radius: 4px; cursor: pointer; font-family: inherit; font-weight: 600; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; min-width: 110px; display: flex; flex-direction: column; align-items: center; gap: 3px; backdrop-filter: blur(2px); transition: all 0.3s ease; text-shadow: 0 0 3px #00ffaa, 0 0 8px #00ff88, 0 0 20px rgba(0, 255, 100, 0.6), 2px 2px 2px #000000, -1px -1px 1px #000000, 1px -1px 1px #000000, -1px 1px 1px #000000; }
.level-tab:hover, .level-tab.active { border-color: rgba(0, 255, 140, 0.6); background: rgba(0, 12, 6, 0.7); box-shadow: 0 0 15px rgba(0, 255, 120, 0.3); }
.level-number { color: #bbffdd; font-size: 12px; font-weight: 800; }
.level-name { color: #a7ffd8; font-size: 9px; }
.mission-details { border-top: 1px solid rgba(0, 255, 140, 0.2); padding-top: 20px; }
.mission-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.mission-title { color: #bbffdd; font-size: 16px; font-weight: 700; letter-spacing: 1px; }
.difficulty-badge { background: rgba(0, 255, 140, 0.2); border: 1px solid rgba(0, 255, 140, 0.4); color: #bbffdd; padding: 4px 8px; border-radius: 3px; font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
.mission-info { margin-bottom: 20px; }
.info-row { display: flex; flex-direction: column; margin-bottom: 12px; gap: 4px; }
.info-label { color: #a7ffd8; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
.info-value { color: #bbffdd; font-size: 14px; line-height: 1.5; }
.info-value.highlight { color: #bbffdd; font-weight: 700; }
.report-section { border-top: 1px solid rgba(0, 255, 140, 0.2); padding-top: 20px; }
.report-textarea { width: 100%; min-height: 120px; background: rgba(0, 12, 6, 0.4); border: 1px solid rgba(0, 255, 140, 0.3); border-radius: 4px; padding: 15px; color: #bbffdd; font-family: inherit; font-weight: 600; font-size: 13px; line-height: 1.6; resize: vertical; margin-bottom: 16px; backdrop-filter: blur(2px); text-shadow: 0 0 3px #00ffaa, 0 0 8px #00ff88, 0 0 20px rgba(0, 255, 100, 0.6), 2px 2px 2px #000000, -1px -1px 1px #000000, 1px -1px 1px #000000, -1px 1px 1px #000000; }
.report-textarea::placeholder { color: rgba(187, 255, 221, 0.5); }
.report-textarea:focus { outline: none; border-color: rgba(0, 255, 140, 0.6); box-shadow: 0 0 15px rgba(0, 255, 120, 0.3); }
.report-footer { display: flex; justify-content: space-between; align-items: center; margin: 10px 0; flex-wrap: wrap; gap: 10px; }
.quick-hint, .transmission-status { color: #a7ffd8; font-size: 10px; opacity: 0.8; }
.action-buttons { display: flex; gap: 10px; justify-content: center; margin-top: 20px; }
.action-btn { background: rgba(0, 12, 6, 0.6); border: 2px solid rgba(0, 255, 140, 0.4); color: #bbffdd; padding: 10px 16px; border-radius: 4px; cursor: pointer; font-family: inherit; font-weight: 600; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; min-width: 100px; backdrop-filter: blur(3px); transition: all 0.3s ease; text-shadow: 0 0 3px #00ffaa, 0 0 8px #00ff88, 0 0 20px rgba(0, 255, 100, 0.6), 2px 2px 2px #000000, -1px -1px 1px #000000, 1px -1px 1px #000000, -1px 1px 1px #000000; }
.action-btn:disabled { opacity: 0.4; cursor: not-allowed; border-color: rgba(0, 255, 140, 0.2); background: rgba(0, 12, 6, 0.3); }
.action-btn:not(:disabled):hover { border-color: rgba(0, 255, 140, 0.6); background: rgba(0, 12, 6, 0.8); box-shadow: 0 0 20px rgba(0, 255, 120, 0.4); }
.control-section { margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(0, 255, 140, 0.2); }
.control-actions { display: flex; justify-content: center; gap: 20px; }
.restart-btn { background: rgba(0, 12, 6, 0.6); border: 2px solid rgba(0, 255, 140, 0.4); color: #bbffdd; padding: 12px 20px; border-radius: 4px; cursor: pointer; font-family: inherit; font-weight: 600; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; min-width: 150px; backdrop-filter: blur(3px); transition: all 0.3s ease; text-shadow: 0 0 3px #00ffaa, 0 0 8px #00ff88, 0 0 20px rgba(0, 255, 100, 0.6), 2px 2px 2px #000000, -1px -1px 1px #000000, 1px -1px 1px #000000, -1px 1px 1px #000000; }
.restart-btn:hover { border-color: rgba(0, 255, 140, 0.6); background: rgba(0, 12, 6, 0.8); box-shadow: 0 0 25px rgba(0, 255, 120, 0.4); }
.loading-display { text-align: center; }
.loading-icon { font-size: 48px; color: #bbffdd; animation: spin 2s linear infinite; margin-bottom: 20px; }
.loading-text { font-size: 18px; color: #bbffdd; margin-bottom: 10px; letter-spacing: 2px; }
.loading-subtext { font-size: 14px; color: #a7ffd8; opacity: 0.8; }
.error-display { text-align: center; }
.error-icon { font-size: 48px; color: #ff9d66; text-shadow: 0 0 10px #ff9d66; animation: pulse 1s infinite; margin-bottom: 20px; }
.error-text { font-size: 16px; color: #bbffdd; margin-bottom: 20px; }
@keyframes fall { to { transform: translateY(100vh); } }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
@keyframes crt-flicker { 0%, 95%, 97%, 99%, 100% { opacity: 1; } 96% { opacity: .98; } 98% { opacity: .97; } }
@media (max-width: 768px) { .matrix-container { padding: 10px; } .crt-screen { border: 4px solid rgba(0, 255, 140, 0.4); border-radius: 8px; min-height: 95vh; } .crt-content { padding: 15px; font-size: 15px; } .terminal-header { font-size: 10px; padding: 12px; } .section-header { font-size: 13px; } .letter-section { padding: 16px; } .letter-title { font-size: 14px; } .letter-content { font-size: 13px; } .agent-name { font-size: 16px; } .concept-text { font-size: 13px; } .level-selector { flex-direction: column; } .level-tab { min-width: auto; padding: 8px 12px; } .mission-header { flex-direction: column; align-items: flex-start; gap: 8px; } .mission-title { font-size: 14px; } .info-value { font-size: 12px; } .report-textarea { font-size: 11px; min-height: 100px; } .action-buttons { flex-direction: column; } .action-btn { font-size: 9px; padding: 8px 12px; } .restart-btn { font-size: 10px; padding: 10px 16px; min-width: 120px; } .quick-hint, .transmission-status { font-size: 9px; } .connection-screen { padding: 20px 15px; margin: 15px 0; } .connection-title { font-size: 10px; } .connection-animation { margin: 20px 0; gap: 3px; } .connection-nodes { gap: 4px; } .node { font-size: 16px; } .line { font-size: 10px; } .connection-lines { margin: 0 5px; gap: 2px; } .status-text { font-size: 11px; } .progress-container { gap: 10px; } .progress-percent { font-size: 11px; min-width: 35px; } }
@media (max-width: 480px) { .status-line { flex-direction: column; gap: 8px; font-size: 10px; } .action-buttons { flex-direction: column; } }
@media (prefers-contrast: high) { .crt-screen { border-color: #00ffaa; background: #000; } .section, .letter-section { text-shadow: none; background: #000; } .action-btn, .restart-btn, .level-tab { border-width: 3px; } }
@media (prefers-reduced-motion: reduce) { * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; } .crt-flicker, .rain-char, .loading-icon { animation: none !important; opacity: 1 !important; } }
`;
