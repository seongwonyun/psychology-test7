"use client";

import React, { JSX, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PrescriptionActions } from "@/app/components/prescription/PrescriptionActions";

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

export default function ResultsPage(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [prescription, setPrescription] = useState<PrescriptionData | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [anxietyScore, setAnxietyScore] = useState<number>(0);
  const [depressionScore, setDepressionScore] = useState<number>(0);
  const [displayText, setDisplayText] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [connectionPhase, setConnectionPhase] = useState<string>("");
  const [connectionProgress, setConnectionProgress] = useState<number>(0);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [matrixRain, setMatrixRain] = useState<string[]>([]);
  const [selectedMission, setSelectedMission] = useState<number>(1);

  // ▼ 코멘트 입력/상태
  const [commentText, setCommentText] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);
  const [lastSentAt, setLastSentAt] = useState<Date | null>(null);

  // Matrix rain effect
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

  useEffect(() => {
    const code = searchParams.get("code");
    const anxiety = searchParams.get("anxiety");
    const depression = searchParams.get("depression");

    if (!code) {
      router.replace("/test");
      return;
    }

    setAnxietyScore(parseInt(anxiety ?? "0", 10));
    setDepressionScore(parseInt(depression ?? "0", 10));

    void fetchPrescription(code);
  }, [searchParams, router]);

  const fetchPrescription = async (code: string): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/prescriptions?code=${encodeURIComponent(code)}`
      );

      if (!response.ok) {
        throw new Error("MISSION DATA NOT FOUND");
      }

      const data: PrescriptionData = await response.json();

      try {
        const cached = localStorage.getItem(`result:${data.id}:comment`);
        if (cached) setCommentText(cached);
      } catch {
        // localStorage 접근 실패시 무시
      }

      await new Promise((resolve) => setTimeout(resolve, 5000));

      setPrescription(data);
      startTypewriter();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "SYSTEM ERROR DETECTED");
    } finally {
      setLoading(false);
    }
  };

  const startTypewriter = (): void => {
    // Step 1: Agent Profile 표시 후 첫 번째 연결
    setCurrentStep(1);
    setTimeout(() => startConnection("ESTABLISHING SECURE CHANNEL", 1), 2000);
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

          // 다음 연결 단계 스케줄링
          if (nextStep === 1) {
            setTimeout(
              () => startConnection("ACCESSING MISSION DATABASE", 2),
              1500
            );
          } else if (nextStep === 2) {
            setTimeout(
              () => startConnection("LOADING TACTICAL PROTOCOLS", 3),
              1500
            );
          } else if (nextStep === 3) {
            setTimeout(
              () => startConnection("ACTIVATING FIELD INTERFACE", 4),
              1500
            );
          }
        }, 800);
      }
    }, 150);
  };

  const handleRestart = (): void => {
    router.push("/test");
  };

  const handleSendComment = async (): Promise<void> => {
    if (!prescription) return;
    const tString = commentText.trim();
    if (!tString) {
      alert("MISSION REPORT REQUIRED");
      return;
    }

    try {
      setSending(true);

      const res = await fetch(`/api/results/${prescription.code}`, {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: tString }),
      });

      if (!res.ok) {
        localStorage.setItem(`result:${prescription.id}:comment`, tString);
        throw new Error("TRANSMISSION FAILED - DATA CACHED LOCALLY");
      }

      localStorage.removeItem(`result:${prescription.id}:comment`);
      setLastSentAt(new Date());
      alert("MISSION REPORT TRANSMITTED");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "UNKNOWN SYSTEM ERROR";
      alert(msg);
    } finally {
      setSending(false);
    }
  };

  const handleSave = async (): Promise<void> => {
    if (!prescription) return;

    const string = commentText.trim();
    if (!string) {
      alert("MISSION REPORT REQUIRED");
      return;
    }

    try {
      setSaving(true);

      const res = await fetch(`/api/results/${prescription.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: string }),
      });

      if (!res.ok) {
        localStorage.setItem(`result:${prescription.id}:comment`, string);
        throw new Error("SAVE FAILED - DATA CACHED LOCALLY");
      }

      localStorage.removeItem(`result:${prescription.id}:comment`);
      alert("MISSION DATA SAVED TO MAINFRAME");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "UNKNOWN SYSTEM ERROR";
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

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

  // Mission level mapping
  const getMissionLevels = (prescription: PrescriptionData): MissionLevel[] => [
    {
      level: 1,
      title: "ENTRY PROTOCOL",
      concept: prescription.challengeConcept,
      keyword: prescription.challengeKeyword,
      activity: prescription.challengeActivity,
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
      concept: prescription.maintainConcept,
      keyword: prescription.maintainKeyword,
      activity: prescription.maintainActivity,
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
      concept: prescription.reconcileConcept,
      keyword: prescription.reconcileKeyword,
      activity: prescription.reconcileActivity,
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

        <style jsx>{`
          /* HomePage와 동일한 로딩 화면 스타일 */
          .matrix-container {
            min-height: 100vh;
            background: radial-gradient(
              ellipse at center,
              rgba(0, 15, 8, 0.7),
              rgba(0, 0, 0, 0.85)
            );
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: "Courier New", ui-monospace, SFMono-Regular, Menlo,
              monospace;
          }

          .crt-flicker {
            animation: crt-flicker 4s infinite ease-in-out;
          }

          .crt-text-glow {
            text-shadow: 0 0 3px #00ffaa, 0 0 8px #00ff88,
              0 0 20px rgba(0, 255, 100, 0.6), 2px 2px 2px #000000,
              -1px -1px 1px #000000, 1px -1px 1px #000000, -1px 1px 1px #000000;
          }

          .matrix-rain {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
          }

          .rain-char {
            position: absolute;
            color: rgba(0, 255, 140, 0.3);
            font-size: 14px;
            animation: fall 3s linear infinite;
            font-family: "Courier New", monospace;
          }

          .crt-screen {
            background: rgba(0, 12, 6, 0.6);
            border: 2px solid rgba(0, 255, 140, 0.4);
            border-radius: 8px;
            min-height: 60vh;
            min-width: 80vw;
            max-width: 800px;
            position: relative;
            z-index: 2;
            backdrop-filter: blur(3px);
            box-shadow: 0 0 30px rgba(0, 255, 120, 0.2),
              inset 0 0 30px rgba(0, 60, 30, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.6);
          }

          .crt-content {
            padding: 40px;
            color: #bbffdd;
            text-shadow: 0 0 3px #00ffaa, 0 0 8px #00ff88,
              0 0 20px rgba(0, 255, 100, 0.6), 2px 2px 2px #000000,
              -1px -1px 1px #000000, 1px -1px 1px #000000, -1px 1px 1px #000000;
            font-weight: 600;
          }

          .loading-display {
            text-align: center;
          }

          .loading-icon {
            font-size: 48px;
            color: #bbffdd;
            animation: spin 2s linear infinite;
            margin-bottom: 20px;
          }

          .loading-text {
            font-size: 18px;
            color: #bbffdd;
            margin-bottom: 10px;
            letter-spacing: 2px;
          }

          .loading-subtext {
            font-size: 14px;
            color: #a7ffd8;
            opacity: 0.8;
          }

          @keyframes fall {
            to {
              transform: translateY(100vh);
            }
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }

          @keyframes crt-flicker {
            0%,
            95%,
            97%,
            99%,
            100% {
              opacity: 1;
            }
            96% {
              opacity: 0.98;
            }
            98% {
              opacity: 0.97;
            }
          }
        `}</style>
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

        <style jsx>{`
          /* HomePage와 동일한 에러 화면 스타일 */
          .matrix-container {
            min-height: 100vh;
            background: radial-gradient(
              ellipse at center,
              rgba(0, 15, 8, 0.7),
              rgba(0, 0, 0, 0.85)
            );
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: "Courier New", ui-monospace, SFMono-Regular, Menlo,
              monospace;
          }

          .crt-text-glow {
            text-shadow: 0 0 3px #00ffaa, 0 0 8px #00ff88,
              0 0 20px rgba(0, 255, 100, 0.6), 2px 2px 2px #000000,
              -1px -1px 1px #000000, 1px -1px 1px #000000, -1px 1px 1px #000000;
          }

          .crt-screen {
            background: rgba(0, 12, 6, 0.6);
            border: 2px solid rgba(0, 255, 140, 0.4);
            border-radius: 8px;
            min-height: 60vh;
            min-width: 80vw;
            max-width: 800px;
            position: relative;
            backdrop-filter: blur(3px);
            box-shadow: 0 0 30px rgba(0, 255, 120, 0.2),
              inset 0 0 30px rgba(0, 60, 30, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.6);
          }

          .crt-content {
            padding: 40px;
            color: #bbffdd;
            text-shadow: 0 0 3px #00ffaa, 0 0 8px #00ff88,
              0 0 20px rgba(0, 255, 100, 0.6), 2px 2px 2px #000000,
              -1px -1px 1px #000000, 1px -1px 1px #000000, -1px 1px 1px #000000;
            font-weight: 600;
          }

          .error-display {
            text-align: center;
          }

          .error-icon {
            font-size: 48px;
            color: #ff9d66;
            text-shadow: 0 0 10px #ff9d66;
            animation: pulse 1s infinite;
            margin-bottom: 20px;
          }

          .error-text {
            font-size: 16px;
            color: #bbffdd;
            margin-bottom: 20px;
          }

          .restart-btn {
            background: rgba(0, 12, 6, 0.6);
            border: 2px solid rgba(0, 255, 140, 0.4);
            color: #bbffdd;
            padding: 12px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-family: "Courier New", ui-monospace, SFMono-Regular, Menlo,
              monospace;
            font-weight: 600;
            font-size: 13px;
            letter-spacing: 1px;
            text-transform: uppercase;
            backdrop-filter: blur(3px);
            text-shadow: 0 0 3px #00ffaa, 0 0 8px #00ff88,
              0 0 20px rgba(0, 255, 100, 0.6), 2px 2px 2px #000000,
              -1px -1px 1px #000000, 1px -1px 1px #000000, -1px 1px 1px #000000;
            transition: all 0.3s ease;
          }

          .restart-btn:hover {
            border-color: rgba(0, 255, 140, 0.6);
            background: rgba(0, 12, 6, 0.8);
            box-shadow: 0 0 25px rgba(0, 255, 120, 0.4);
          }

          @keyframes pulse {
            0%,
            100% {
              opacity: 1;
            }
            50% {
              opacity: 0.7;
            }
          }
        `}</style>
      </div>
    );
  }

  if (!prescription) return null;

  const missions = getMissionLevels(prescription);
  const currentMission = missions[selectedMission - 1];

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
          {/* Terminal Header */}
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

          {/* Agent Profile Section */}
          {currentStep >= 1 && (
            <div className="section">
              <div className="section-header crt-text-glow">
                [AGENT PROFILE] - CLEARANCE LEVEL: CLASSIFIED
              </div>
              <div className="agent-profile">
                <div className="agent-name crt-text-glow">
                  {prescription.name}
                </div>
                <div className="agent-message">{prescription.dear}</div>
              </div>
            </div>
          )}

          {/* Connection Screen */}
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

          {/* Mission Briefing */}
          {currentStep >= 2 && (
            <div className="section">
              <div className="section-header crt-text-glow">
                [MISSION BRIEFING] - OPERATION: NEURAL ENHANCEMENT
              </div>
              <div className="briefing-content">
                <div className="concept-text">{prescription.concept}</div>
                <div className="inspiration-section">
                  <div className="inspiration-label crt-text-glow">
                    INSPIRATION PROTOCOL:
                  </div>
                  <div className="inspiration-text">"{prescription.movie}"</div>
                </div>
              </div>
            </div>
          )}

          {/* Mission Levels */}
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
                    LEVEL {mission.level}: {mission.title}
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
                    <span className="info-value">{currentMission.concept}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">KEYWORD:</span>
                    <span className="info-value crt-text-glow">
                      {currentMission.keyword}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">ACTIVITY:</span>
                    <span className="info-value">
                      {currentMission.activity}
                    </span>
                  </div>
                </div>

                <div className="requirements-rewards">
                  <div className="requirements">
                    <div className="req-header crt-text-glow">
                      REQUIRED ACTIONS:
                    </div>
                    {currentMission.requiredActions.map((action, idx) => (
                      <div key={idx} className="req-item">
                        ▸ {action}
                      </div>
                    ))}
                  </div>
                  <div className="rewards">
                    <div className="reward-header crt-text-glow">
                      MISSION REWARDS:
                    </div>
                    {currentMission.rewards.map((reward, idx) => (
                      <div key={idx} className="reward-item">
                        ◆ {reward}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mission Report */}
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
                    Ctrl+Enter: Quick Transmission
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
                    disabled={saving || !commentText.trim()}
                  >
                    {saving ? "SAVING..." : "SAVE TO MAINFRAME"}
                  </button>
                  <button
                    className="action-btn send-btn"
                    onClick={handleSendComment}
                    disabled={sending || !commentText.trim()}
                  >
                    {sending ? "TRANSMITTING..." : "SEND REPORT"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Control Actions */}
          <div className="control-section">
            <div className="control-actions">
              <button className="restart-btn" onClick={handleRestart}>
                ↻ NEW MISSION
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* HomePage와 정확히 동일한 메인 스타일 */
        .matrix-container {
          min-height: 100vh;
          background: radial-gradient(
            ellipse at center,
            rgba(0, 15, 8, 0.7),
            rgba(0, 0, 0, 0.85)
          );
          position: relative;
          padding: 20px;
          font-family: "Courier New", ui-monospace, SFMono-Regular, Menlo,
            monospace;
          /* Safe area 지원 */
          padding-top: max(20px, env(safe-area-inset-top, 0));
          padding-bottom: max(20px, env(safe-area-inset-bottom, 0));
          padding-left: max(20px, env(safe-area-inset-left, 0));
          padding-right: max(20px, env(safe-area-inset-right, 0));
        }

        /* HomePage와 동일한 CRT 효과 클래스들 */
        .crt-flicker {
          animation: crt-flicker 4s infinite ease-in-out;
        }

        .crt-text-glow {
          text-shadow: 0 0 3px #00ffaa, 0 0 8px #00ff88,
            0 0 20px rgba(0, 255, 100, 0.6), 2px 2px 2px #000000,
            -1px -1px 1px #000000, 1px -1px 1px #000000, -1px 1px 1px #000000;
        }

        .matrix-rain {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        .rain-char {
          position: absolute;
          color: rgba(0, 255, 140, 0.3);
          font-size: 14px;
          animation: fall 3s linear infinite;
          font-family: "Courier New", monospace;
        }

        /* HomePage와 정확히 동일한 스크린 스타일 */
        .crt-screen {
          background: rgba(0, 12, 6, 0.6);
          border: 2px solid rgba(0, 255, 140, 0.4);
          border-radius: 8px;
          min-height: 90vh;
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
          position: relative;
          z-index: 2;
          backdrop-filter: blur(3px);
          box-shadow: 0 0 30px rgba(0, 255, 120, 0.2),
            inset 0 0 30px rgba(0, 60, 30, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.6);
        }

        .crt-content {
          padding: 30px;
          color: #bbffdd;
          font-weight: 600;
          text-shadow: 0 0 3px #00ffaa, 0 0 8px #00ff88,
            0 0 20px rgba(0, 255, 100, 0.6), 2px 2px 2px #000000,
            -1px -1px 1px #000000, 1px -1px 1px #000000, -1px 1px 1px #000000;
        }

        /* Terminal Header */
        .terminal-header {
          background: rgba(0, 12, 6, 0.4);
          border: 1px solid rgba(0, 255, 140, 0.2);
          border-radius: 4px;
          padding: 15px;
          margin-bottom: 20px;
          backdrop-filter: blur(3px);
        }

        .status-line {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
        }

        .prompt {
          color: #bbffdd;
        }

        .status {
          color: #a7ffd8;
        }

        .timestamp {
          color: #a7ffd8;
          opacity: 0.8;
        }

        /* Section Styles */
        .section {
          background: rgba(0, 12, 6, 0.4);
          border: 1px solid rgba(0, 255, 140, 0.2);
          border-radius: 4px;
          padding: 20px;
          margin-bottom: 20px;
          backdrop-filter: blur(3px);
        }

        .section-header {
          color: #bbffdd;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 1px;
          margin-bottom: 15px;
          text-align: center;
          text-transform: uppercase;
        }

        /* Agent Profile */
        .agent-profile {
          text-align: center;
        }

        .agent-name {
          color: #bbffdd;
          font-size: 18px;
          font-weight: 900;
          margin-bottom: 10px;
          letter-spacing: 2px;
        }

        .agent-message {
          color: #a7ffd8;
          font-size: 14px;
          line-height: 1.6;
        }

        /* Connection Screen */
        .connection-screen {
          background: rgba(0, 12, 6, 0.6);
          border: 2px solid rgba(0, 255, 140, 0.4);
          border-radius: 8px;
          padding: 30px;
          margin: 20px 0;
          text-align: center;
          backdrop-filter: blur(3px);
        }

        .connection-title {
          color: #bbffdd;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 2px;
          margin-bottom: 20px;
        }

        .connection-animation {
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 30px 0;
          gap: 5px;
        }

        .connection-nodes {
          display: flex;
          gap: 8px;
        }

        .node {
          color: #bbffdd;
          font-size: 20px;
          animation: pulse 1.5s infinite;
        }

        .connection-lines {
          display: flex;
          flex-direction: column;
          margin: 0 10px;
          gap: 3px;
        }

        .line {
          color: #a7ffd8;
          font-size: 12px;
          opacity: 0.7;
        }

        .status-text {
          color: #bbffdd;
          font-size: 14px;
          margin-bottom: 20px;
        }

        .progress-container {
          display: flex;
          align-items: center;
          gap: 15px;
          margin: 20px 0;
        }

        .progress-bar {
          flex: 1;
          height: 12px;
          background: rgba(0, 12, 6, 0.6);
          border: 1px solid rgba(0, 255, 140, 0.3);
          border-radius: 6px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(
            90deg,
            rgba(0, 255, 140, 0.4) 0%,
            rgba(0, 255, 140, 0.8) 50%,
            rgba(0, 255, 140, 0.4) 100%
          );
          transition: width 0.3s ease;
          box-shadow: 0 0 10px rgba(0, 255, 140, 0.4);
        }

        .progress-percent {
          color: #bbffdd;
          font-size: 14px;
          font-weight: 700;
          min-width: 40px;
        }

        /* Briefing Content */
        .briefing-content {
          line-height: 1.6;
        }

        .concept-text {
          color: #bbffdd;
          font-size: 14px;
          margin-bottom: 15px;
        }

        .inspiration-section {
          border-top: 1px solid rgba(0, 255, 140, 0.2);
          padding-top: 15px;
        }

        .inspiration-label {
          color: #bbffdd;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .inspiration-text {
          color: #a7ffd8;
          font-size: 14px;
          font-style: italic;
        }

        /* Level Selector */
        .level-selector {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .level-tab {
          background: rgba(0, 12, 6, 0.4);
          border: 1px solid rgba(0, 255, 140, 0.3);
          color: #bbffdd;
          padding: 8px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-family: "Courier New", ui-monospace, SFMono-Regular, Menlo,
            monospace;
          font-weight: 600;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
          min-width: 120px;
          backdrop-filter: blur(2px);
          transition: all 0.3s ease;
          text-shadow: 0 0 3px #00ffaa, 0 0 8px #00ff88,
            0 0 20px rgba(0, 255, 100, 0.6), 2px 2px 2px #000000,
            -1px -1px 1px #000000, 1px -1px 1px #000000, -1px 1px 1px #000000;
        }

        .level-tab:hover,
        .level-tab.active {
          border-color: rgba(0, 255, 140, 0.6);
          background: rgba(0, 12, 6, 0.7);
          box-shadow: 0 0 15px rgba(0, 255, 120, 0.3);
        }

        /* Mission Details */
        .mission-details {
          border-top: 1px solid rgba(0, 255, 140, 0.2);
          padding-top: 20px;
        }

        .mission-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .mission-title {
          color: #bbffdd;
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .difficulty-badge {
          background: rgba(0, 255, 140, 0.2);
          border: 1px solid rgba(0, 255, 140, 0.4);
          color: #bbffdd;
          padding: 4px 8px;
          border-radius: 3px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .mission-info {
          margin-bottom: 20px;
        }

        .info-row {
          display: flex;
          margin-bottom: 8px;
          align-items: flex-start;
        }

        .info-label {
          color: #a7ffd8;
          font-size: 12px;
          font-weight: 700;
          min-width: 80px;
          margin-right: 10px;
        }

        .info-value {
          color: #bbffdd;
          font-size: 12px;
          flex: 1;
        }

        .requirements-rewards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .requirements,
        .rewards {
          background: rgba(0, 12, 6, 0.3);
          border: 1px solid rgba(0, 255, 140, 0.2);
          border-radius: 4px;
          padding: 15px;
          backdrop-filter: blur(2px);
        }

        .req-header,
        .reward-header {
          color: #bbffdd;
          font-size: 11px;
          font-weight: 700;
          margin-bottom: 10px;
          letter-spacing: 1px;
        }

        .req-item,
        .reward-item {
          color: #a7ffd8;
          font-size: 11px;
          margin-bottom: 5px;
        }

        /* Report Section */
        .report-section {
          border-top: 1px solid rgba(0, 255, 140, 0.2);
          padding-top: 20px;
        }

        .report-textarea {
          width: 100%;
          min-height: 120px;
          background: rgba(0, 12, 6, 0.4);
          border: 1px solid rgba(0, 255, 140, 0.3);
          border-radius: 4px;
          padding: 15px;
          color: #bbffdd;
          font-family: "Courier New", ui-monospace, SFMono-Regular, Menlo,
            monospace;
          font-weight: 600;
          font-size: 12px;
          line-height: 1.5;
          resize: vertical;
          backdrop-filter: blur(2px);
          text-shadow: 0 0 3px #00ffaa, 0 0 8px #00ff88,
            0 0 20px rgba(0, 255, 100, 0.6), 2px 2px 2px #000000,
            -1px -1px 1px #000000, 1px -1px 1px #000000, -1px 1px 1px #000000;
        }

        .report-textarea::placeholder {
          color: rgba(187, 255, 221, 0.5);
        }

        .report-textarea:focus {
          outline: none;
          border-color: rgba(0, 255, 140, 0.6);
          box-shadow: 0 0 15px rgba(0, 255, 120, 0.3);
        }

        .report-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 10px 0;
          flex-wrap: wrap;
          gap: 10px;
        }

        .quick-hint {
          color: #a7ffd8;
          font-size: 10px;
          opacity: 0.8;
        }

        .transmission-status {
          color: #a7ffd8;
          font-size: 10px;
          opacity: 0.8;
        }

        /* Action Buttons */
        .action-buttons {
          display: flex;
          gap: 15px;
          justify-content: center;
          margin-top: 20px;
        }

        .action-btn {
          background: rgba(0, 12, 6, 0.6);
          border: 2px solid rgba(0, 255, 140, 0.4);
          color: #bbffdd;
          padding: 12px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-family: "Courier New", ui-monospace, SFMono-Regular, Menlo,
            monospace;
          font-weight: 600;
          font-size: 11px;
          letter-spacing: 1px;
          text-transform: uppercase;
          min-width: 140px;
          backdrop-filter: blur(3px);
          transition: all 0.3s ease;
          text-shadow: 0 0 3px #00ffaa, 0 0 8px #00ff88,
            0 0 20px rgba(0, 255, 100, 0.6), 2px 2px 2px #000000,
            -1px -1px 1px #000000, 1px -1px 1px #000000, -1px 1px 1px #000000;
        }

        .action-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          border-color: rgba(0, 255, 140, 0.2);
          background: rgba(0, 12, 6, 0.3);
        }

        .action-btn:not(:disabled):hover {
          border-color: rgba(0, 255, 140, 0.6);
          background: rgba(0, 12, 6, 0.8);
          box-shadow: 0 0 25px rgba(0, 255, 120, 0.4);
          transform: scale(1.02);
        }

        /* Control Section */
        .control-section {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid rgba(0, 255, 140, 0.2);
        }

        .control-actions {
          display: flex;
          justify-content: center;
          gap: 20px;
        }

        .restart-btn {
          background: rgba(0, 12, 6, 0.6);
          border: 2px solid rgba(0, 255, 140, 0.4);
          color: #bbffdd;
          padding: 15px 25px;
          border-radius: 4px;
          cursor: pointer;
          font-family: "Courier New", ui-monospace, SFMono-Regular, Menlo,
            monospace;
          font-weight: 600;
          font-size: 13px;
          letter-spacing: 1px;
          text-transform: uppercase;
          min-width: 180px;
          backdrop-filter: blur(3px);
          transition: all 0.3s ease;
          text-shadow: 0 0 3px #00ffaa, 0 0 8px #00ff88,
            0 0 20px rgba(0, 255, 100, 0.6), 2px 2px 2px #000000,
            -1px -1px 1px #000000, 1px -1px 1px #000000, -1px 1px 1px #000000;
        }

        .restart-btn:hover {
          border-color: rgba(0, 255, 140, 0.6);
          background: rgba(0, 12, 6, 0.8);
          box-shadow: 0 0 25px rgba(0, 255, 120, 0.4);
          transform: scale(1.02);
        }

        /* 애니메이션들 */
        @keyframes fall {
          to {
            transform: translateY(100vh);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.1);
          }
        }

        @keyframes crt-flicker {
          0%,
          95%,
          97%,
          99%,
          100% {
            opacity: 1;
          }
          96% {
            opacity: 0.98;
          }
          98% {
            opacity: 0.97;
          }
        }

        /* 모바일 최적화 */
        @media (max-width: 767px) {
          .matrix-container {
            padding: 10px;
          }

          .crt-screen {
            border: 4px solid rgba(0, 255, 140, 0.4);
            border-radius: 8px;
            min-height: 95vh;
          }

          .crt-content {
            padding: 15px;
            font-size: 15px;
          }

          .terminal-header {
            font-size: 10px;
            padding: 12px;
          }

          .section-header {
            font-size: 13px;
            padding: 10px;
          }

          .agent-name {
            font-size: 16px;
          }

          .agent-message {
            font-size: 12px;
          }

          .briefing-content {
            font-size: 12px;
          }

          .concept-text,
          .inspiration-text {
            font-size: 12px;
          }

          .level-selector {
            flex-direction: column;
          }

          .level-tab {
            min-width: auto;
            font-size: 10px;
          }

          .mission-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }

          .mission-title {
            font-size: 14px;
          }

          .requirements-rewards {
            grid-template-columns: 1fr;
          }

          .info-value {
            font-size: 11px;
          }

          .req-item,
          .reward-item {
            font-size: 10px;
          }

          .report-textarea {
            font-size: 11px;
            min-height: 100px;
          }

          .action-buttons {
            flex-direction: column;
          }

          .action-btn {
            font-size: 10px;
            padding: 12px 16px;
          }

          .control-actions {
            gap: 10px;
          }

          .restart-btn {
            font-size: 11px;
            padding: 12px 16px;
            min-width: 160px;
          }

          .quick-hint {
            font-size: 9px;
          }

          .transmission-status {
            font-size: 9px;
          }

          .connection-screen {
            padding: 20px 15px;
            margin: 15px 0;
          }

          .connection-title {
            font-size: 10px;
          }

          .connection-animation {
            margin: 20px 0;
            gap: 3px;
          }

          .connection-nodes {
            gap: 4px;
          }

          .node {
            font-size: 16px;
          }

          .line {
            font-size: 10px;
          }

          .connection-lines {
            margin: 0 5px;
            gap: 2px;
          }

          .status-text {
            font-size: 11px;
          }

          .progress-container {
            gap: 10px;
          }

          .progress-percent {
            font-size: 11px;
            min-width: 35px;
          }
        }

        /* 태블릿 이상 */
        @media (min-width: 768px) {
          .crt-screen {
            max-width: 1200px;
            border: 12px solid rgba(0, 255, 140, 0.4);
            border-radius: 15px;
          }

          .crt-content {
            padding: 30px;
            font-size: 16px;
          }

          .terminal-header {
            font-size: 13px;
          }

          .section-header {
            font-size: 16px;
          }

          .agent-name {
            font-size: 20px;
          }

          .agent-message {
            font-size: 15px;
          }

          .briefing-content {
            font-size: 15px;
          }

          .concept-text,
          .inspiration-text {
            font-size: 15px;
          }

          .action-buttons {
            flex-direction: row;
          }

          .control-actions {
            flex-direction: row;
            justify-content: center;
          }

          .action-btn {
            min-width: 160px;
          }

          .restart-btn {
            min-width: 200px;
          }

          .report-footer {
            flex-wrap: nowrap;
          }

          .connection-screen {
            padding: 40px 30px;
            margin: 30px 0;
          }

          .connection-title {
            font-size: 14px;
          }

          .connection-animation {
            margin: 40px 0;
            gap: 8px;
          }

          .connection-nodes {
            gap: 10px;
          }

          .node {
            font-size: 24px;
          }

          .line {
            font-size: 14px;
          }

          .connection-lines {
            margin: 0 15px;
            gap: 5px;
          }

          .status-text {
            font-size: 16px;
          }

          .progress-container {
            gap: 20px;
            margin: 25px 0;
          }

          .progress-bar {
            height: 18px;
          }

          .progress-percent {
            font-size: 16px;
            min-width: 50px;
          }
        }

        /* HomePage와 동일한 접근성 지원 */
        @media (prefers-contrast: high) {
          .crt-screen {
            border-color: #00ffaa;
            background: #000;
          }

          .crt-content,
          .terminal-header,
          .section,
          .connection-screen,
          .requirements,
          .rewards {
            text-shadow: none;
            background: #000;
          }

          .action-btn,
          .restart-btn,
          .level-tab {
            border-width: 3px;
          }
        }

        /* HomePage와 동일한 모션 감소 설정 */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }

          .crt-flicker,
          .rain-char,
          .node {
            animation: none !important;
            opacity: 1 !important;
          }

          .action-btn:hover,
          .restart-btn:hover {
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}
