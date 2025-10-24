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
  const [displayText, setDisplayText] = useState<string>(""); // (필요시 활용)
  const [currentStep, setCurrentStep] = useState<number>(0);

  // ▼ 코멘트 입력/상태
  const [commentText, setCommentText] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false); // 전체 SAVE 로딩
  const [sending, setSending] = useState<boolean>(false); // 코멘트 전송 로딩
  const [lastSentAt, setLastSentAt] = useState<Date | null>(null);

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
        // `/api/results?code=${encodeURIComponent(code)}`
      );

      if (!response.ok) {
        throw new Error("PRESCRIPTION DATA NOT FOUND");
      }

      const data: PrescriptionData = await response.json();
      setPrescription(data);

      // 로컬 백업 코멘트가 있으면 불러오기
      try {
        const cached = localStorage.getItem(`result:${data.id}:comment`);
        if (cached) setCommentText(cached);
      } catch {
        // localStorage 접근 실패시 무시
      }

      startTypewriter();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "UNKNOWN ERROR OCCURRED");
    } finally {
      setLoading(false);
    }
  };

  const startTypewriter = (): void => {
    setCurrentStep(1);
    setTimeout(() => setCurrentStep(2), 1000);
    setTimeout(() => setCurrentStep(3), 2000);
    setTimeout(() => setCurrentStep(4), 3000);
  };

  const handleRestart = (): void => {
    router.push("/test");
  };

  // ▼ 코멘트만 보내기 (textarea 아래 버튼/단축키용)
  const handleSendComment = async (): Promise<void> => {
    if (!prescription) return;
    const trimmed = commentText.trim();
    if (!trimmed) {
      alert("코멘트를 입력해 주세요.");
      return;
    }

    try {
      setSending(true);

      const res = await fetch(`/api/results/${prescription.code}`, {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: trimmed }),
      });

      if (!res.ok) {
        // 실패 시 로컬 백업
        localStorage.setItem(`result:${prescription.id}:comment`, trimmed);
        throw new Error("서버 저장에 실패하여 로컬에 임시 저장했습니다.");
      }

      // 성공 시 로컬 백업 제거
      localStorage.removeItem(`result:${prescription.id}:comment`);
      setLastSentAt(new Date());
      alert("코멘트가 전송되었습니다.");
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "알 수 없는 오류가 발생했습니다.";
      alert(msg);
    } finally {
      setSending(false);
    }
  };

  // ▼ 전체 SAVE (이전 동작 유지: comment 포함하여 PATCH)
  const handleSave = async (): Promise<void> => {
    if (!prescription) return;

    const trimmed = commentText.trim();
    if (!trimmed) {
      alert("코멘트를 입력해 주세요.");
      return;
    }

    try {
      setSaving(true);

      const res = await fetch(`/api/results/${prescription.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: trimmed }),
      });

      if (!res.ok) {
        localStorage.setItem(`result:${prescription.id}:comment`, trimmed);
        throw new Error("서버 저장에 실패하여 로컬에 임시 저장했습니다.");
      }

      localStorage.removeItem(`result:${prescription.id}:comment`);
      alert("결과와 코멘트가 저장되었습니다.");
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "알 수 없는 오류가 발생했습니다.";
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  // ⌘/Ctrl + Enter 로 코멘트 전송
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

  if (loading) {
    return (
      <div className="crt-container">
        <div className="crt-screen">
          <div className="crt-content">
            <div className="terminal-header">
              ╔══════════════════════════════════════════════════════════════════════╗
              ║ PSYCHO-TRAVEL ANALYSIS SYSTEM v2.1 ║ ║ COPYRIGHT 1985 MINDTECH ║
              ╚══════════════════════════════════════════════════════════════════════╝
            </div>

            <div className="loading-animation">
              <div className="ascii-art">
                {`
    ██████╗ ██████╗  ██████╗  ██████╗███████╗███████╗███████╗██╗███╗   ██╗ ██████╗ 
    ██╔══██╗██╔══██╗██╔═══██╗██╔════╝██╔════╝██╔════╝██╔════╝██║████╗  ██║██╔════╝ 
    ██████╔╝██████╔╝██║   ██║██║     █████╗  ███████╗███████╗██║██╔██╗ ██║██║  ███╗
    ██╔═══╝ ██╔══██╗██║   ██║██║     ██╔══╝  ╚════██║╚════██║██║██║╚██╗██║██║   ██║
    ██║     ██║  ██║╚██████╔╝╚██████╗███████╗███████║███████║██║██║ ╚████║╚██████╔╝
    ╚═╝     ╚═╝  ╚═╝ ╚═════╝  ╚═════╝╚══════╝╚══════╝╚══════╝╚═╝╚═╝  ╚═══╝ ╚═════╝ 
                `}
              </div>

              <div className="status-line">
                &gt; ANALYZING NEURAL PATTERNS...
                <span className="blinking-cursor">█</span>
              </div>

              <div className="progress-bar">
                ████████████████████████████████████████████████████████████████
                100%
              </div>

              <div className="system-info">
                SYSTEM STATUS: OPERATIONAL
                <br />
                CPU USAGE: 98.7%
                <br />
                MEMORY: 640KB AVAILABLE
                <br />
                PROCESSING UNCONSCIOUS DATA...
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .crt-container {
            background: #000;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: "Courier New", monospace;
            padding: 20px;
          }

          .crt-screen {
            background: #001100;
            border: 20px solid #333;
            border-radius: 20px;
            width: 100%;
            max-width: 1000px;
            aspect-ratio: 4/3;
            position: relative;
            overflow: hidden;
            box-shadow: inset 0 0 50px rgba(0, 255, 0, 0.1),
              0 0 50px rgba(0, 0, 0, 0.8);
          }

          .crt-screen::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(0, 255, 0, 0.03) 2px,
              rgba(0, 255, 0, 0.03) 4px
            );
            pointer-events: none;
            z-index: 10;
          }

          .crt-content {
            padding: 40px;
            color: #00ff00;
            text-shadow: 0 0 5px #00ff00;
            line-height: 1.2;
            height: 100%;
            overflow-y: auto;
          }

          .terminal-header {
            text-align: center;
            margin-bottom: 30px;
            font-size: 12px;
            white-space: pre;
          }

          .ascii-art {
            font-size: 8px;
            text-align: center;
            margin: 20px 0;
            white-space: pre;
            line-height: 1;
          }

          .status-line {
            margin: 20px 0;
            font-size: 14px;
          }

          .blinking-cursor {
            animation: blink 1s infinite;
          }

          @keyframes blink {
            0%,
            50% {
              opacity: 1;
            }
            51%,
            100% {
              opacity: 0;
            }
          }

          .progress-bar {
            margin: 10px 0;
            font-family: monospace;
          }

          .system-info {
            margin-top: 30px;
            font-size: 12px;
            line-height: 1.5;
          }
        `}</style>
      </div>
    );
  }

  if (error || !prescription) {
    return (
      <div className="crt-container">
        <div className="crt-screen">
          <div className="crt-content">
            <div className="error-screen">
              ╔══════════════════════════════════════════════════════════════════════╗
              ║ SYSTEM ERROR ║
              ╚══════════════════════════════════════════════════════════════════════╝
              <div className="error-message">
                ⚠ FATAL ERROR DETECTED ⚠ ERROR CODE: 0x00FF0000 DESCRIPTION:{" "}
                {error ?? "PRESCRIPTION DATA CORRUPTED"}
                SYSTEM HALTED &gt; PRESS ANY KEY TO RESTART_
              </div>
              <div className="error-actions">
                <button onClick={handleRestart} className="crt-button">
                  [R] RESTART SYSTEM
                </button>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .crt-container {
            background: #000;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: "Courier New", monospace;
            padding: 20px;
          }

          .crt-screen {
            background: #110000;
            border: 20px solid #333;
            border-radius: 20px;
            width: 100%;
            max-width: 1000px;
            aspect-ratio: 4/3;
            position: relative;
            overflow: hidden;
            box-shadow: inset 0 0 50px rgba(255, 0, 0, 0.1),
              0 0 50px rgba(0, 0, 0, 0.8);
          }

          .crt-screen::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(255, 0, 0, 0.03) 2px,
              rgba(255, 0, 0, 0.03) 4px
            );
            pointer-events: none;
            z-index: 10;
          }

          .crt-content {
            padding: 40px;
            color: #ff0000;
            text-shadow: 0 0 5px #ff0000;
            line-height: 1.4;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }

          .error-screen {
            text-align: center;
            white-space: pre-line;
          }

          .error-message {
            margin: 30px 0;
            font-size: 14px;
            line-height: 1.6;
          }

          .crt-button {
            background: transparent;
            border: 2px solid #ff0000;
            color: #ff0000;
            padding: 10px 20px;
            font-family: "Courier New", monospace;
            font-size: 14px;
            cursor: pointer;
            text-shadow: 0 0 5px #ff0000;
            transition: all 0.3s;
            margin: 10px;
          }

          .crt-button:hover {
            background: #ff0000;
            color: #000;
            text-shadow: none;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="crt-container">
      <div className="crt-screen">
        <div className="crt-content">
          <div className="terminal-header">
            ╔══════════════════════════════════════════════════════════════════════╗
            ║ TRAVEL PRESCRIPTION GENERATED ║ ║ ANALYSIS COMPLETE ║
            ╚══════════════════════════════════════════════════════════════════════╝
          </div>

          <div className="prescription-display">
            {/* 처방전 헤더 */}
            <div className="section">
              <div className="section-title">
                ▓▓▓ PRESCRIPTION CODE: {prescription.code} ▓▓▓
              </div>
              <div className="prescription-name">
                &gt;&gt; {prescription.name.toUpperCase()}
              </div>
              <div className="prescription-dear">TO: {prescription.dear}</div>
            </div>

            {/* 점수 섹션 */}
            <div className="scores-section">
              ┌─────────────────────────────────────────────────────────────────────┐
              │ PSYCHOLOGICAL METRICS │
              ├─────────────────────────────────────────────────────────────────────┤
              │ ANXIETY LEVEL: [{anxietyScore.toString().padStart(2, "0")}]{" "}
              {"█".repeat(Math.floor(anxietyScore / 6)).padEnd(5, "░")} │ │
              DEPRESSION LEVEL: [{depressionScore.toString().padStart(2, "0")}]{" "}
              {"█".repeat(Math.floor(depressionScore / 6)).padEnd(5, "░")} │
              └─────────────────────────────────────────────────────────────────────┘
            </div>

            {/* 편지 내용 */}
            <div className="section">
              <div className="section-title">▓▓▓ PERSONAL MESSAGE ▓▓▓</div>
              <div className="letter-content">{prescription.letter}</div>
            </div>

            {/* 핵심 개념 */}
            <div className="section">
              <div className="section-title">▓▓▓ CORE CONCEPT ▓▓▓</div>
              <div className="concept-content">{prescription.concept}</div>
            </div>

            {/* 추천 영화 */}
            <div className="section">
              <div className="section-title">▓▓▓ RECOMMENDED FILM ▓▓▓</div>
              <div className="movie-content">🎬 {prescription.movie}</div>
            </div>

            {/* 활동 섹션들 */}
            <div className="activities-grid">
              {/* 도전 */}
              <div className="activity-box">
                <div className="activity-header">┌── CHALLENGE ──┐</div>
                <div className="activity-keyword">
                  [{prescription.challengeKeyword}]
                </div>
                <div className="activity-concept">
                  {prescription.challengeConcept}
                </div>
                <div className="activity-description">
                  {prescription.challengeActivity}
                </div>
              </div>

              {/* 유지 */}
              <div className="activity-box">
                <div className="activity-header">┌── MAINTAIN ───┐</div>
                <div className="activity-keyword">
                  [{prescription.maintainKeyword}]
                </div>
                <div className="activity-concept">
                  {prescription.maintainConcept}
                </div>
                <div className="activity-description">
                  {prescription.maintainActivity}
                </div>
              </div>

              {/* 화해 */}
              <div className="activity-box">
                <div className="activity-header">┌── RECONCILE ──┐</div>
                <div className="activity-keyword">
                  [{prescription.reconcileKeyword}]
                </div>
                <div className="activity-concept">
                  {prescription.reconcileConcept}
                </div>
                <div className="activity-description">
                  {prescription.reconcileActivity}
                </div>
              </div>
            </div>

            {/* ▼ 코멘트 입력 섹션 */}
            <div className="section">
              <div className="section-title">▓▓▓ COMMENT ▓▓▓</div>

              <div className="comment-box">
                <textarea
                  className="comment-textarea"
                  placeholder="결과에 대한 느낌, 메모, 다음 목표 등을 자유롭게 남겨보세요..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={onCommentKeyDown}
                  rows={6}
                  maxLength={1000}
                />
                <div className="comment-actions">
                  <button
                    onClick={handleSendComment}
                    className="crt-button comment-send"
                    disabled={sending}
                    aria-label="send comment"
                  >
                    {sending ? "[C] SENDING..." : "[C] SEND COMMENT"}
                  </button>
                  <div className="save-hint">
                    길이 제한: {commentText.length}/1000
                    {lastSentAt
                      ? ` · 마지막 전송: ${lastSentAt.toLocaleTimeString()}`
                      : ""}
                    <span className="kbd"> (⌘/Ctrl + Enter 전송)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 하단 버튼들 */}
            <div className="action-buttons">
              ╔═══════════════════════════════════════════════════════════════════╗
              ║ OPTIONS ║
              ╠═══════════════════════════════════════════════════════════════════╣
              ║ [S] SAVE RESULTS [R] RESTART ANALYSIS [Q] QUIT ║
              ╚═══════════════════════════════════════════════════════════════════╝
              <div className="button-row">
                <button
                  onClick={handleSave}
                  className="crt-button"
                  disabled={saving}
                >
                  {saving ? "[S] SAVING..." : "[S] SAVE"}
                </button>
                <button onClick={handleRestart} className="crt-button">
                  [R] RESTART
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .crt-container {
          background: #000;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: "Courier New", monospace;
          padding: 20px;
        }

        .crt-screen {
          background: #001100;
          border: 20px solid #333;
          border-radius: 20px;
          width: 100%;
          max-width: 1200px;
          min-height: 80vh;
          position: relative;
          overflow: hidden;
          box-shadow: inset 0 0 50px rgba(0, 255, 0, 0.1),
            0 0 50px rgba(0, 0, 0, 0.8);
        }

        .crt-screen::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 255, 0, 0.03) 2px,
            rgba(0, 255, 0, 0.03) 4px
          );
          pointer-events: none;
          z-index: 10;
        }

        .crt-content {
          padding: 30px;
          color: #00ff00;
          text-shadow: 0 0 5px #00ff00;
          line-height: 1.4;
          height: 100%;
          overflow-y: auto;
        }

        .terminal-header {
          text-align: center;
          margin-bottom: 30px;
          font-size: 12px;
          white-space: pre;
        }

        .prescription-display {
          max-width: 100%;
        }

        .section {
          margin-bottom: 25px;
        }

        .section-title {
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 10px;
          text-align: center;
        }

        .prescription-name {
          font-size: 18px;
          text-align: center;
          margin: 10px 0;
          font-weight: bold;
        }

        .prescription-dear {
          text-align: center;
          margin-bottom: 20px;
          color: #00cc00;
        }

        .scores-section {
          margin: 20px 0;
          font-size: 12px;
          white-space: pre;
          text-align: center;
        }

        .letter-content,
        .concept-content,
        .movie-content {
          background: rgba(0, 255, 0, 0.05);
          border: 1px solid #00ff00;
          padding: 15px;
          margin: 10px 0;
          font-size: 13px;
          line-height: 1.6;
        }

        .activities-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 15px;
          margin: 25px 0;
        }

        .activity-box {
          border: 1px solid #00ff00;
          padding: 15px;
          background: rgba(0, 255, 0, 0.02);
        }

        .activity-header {
          text-align: center;
          font-weight: bold;
          margin-bottom: 10px;
        }

        .activity-keyword {
          text-align: center;
          color: #00ffff;
          margin-bottom: 8px;
          font-size: 12px;
        }

        .activity-concept {
          font-weight: bold;
          margin-bottom: 8px;
          font-size: 13px;
        }

        .activity-description {
          font-size: 12px;
          line-height: 1.5;
          color: #ccffcc;
        }

        .action-buttons {
          margin-top: 30px;
          text-align: center;
        }

        .button-row {
          margin-top: 15px;
          display: flex;
          justify-content: center;
          gap: 20px;
        }

        .crt-button {
          background: transparent;
          border: 2px solid #00ff00;
          color: #00ff00;
          padding: 8px 16px;
          font-family: "Courier New", monospace;
          font-size: 12px;
          cursor: pointer;
          text-shadow: 0 0 5px #00ff00;
          transition: all 0.3s;
        }

        .crt-button:hover {
          background: #00ff00;
          color: #000;
          text-shadow: none;
        }

        @media (min-width: 768px) {
          .activities-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        /* --- comment styles --- */
        .comment-box {
          background: rgba(0, 255, 0, 0.05);
          border: 1px solid #00ff00;
          padding: 12px;
          margin-top: 8px;
        }

        .comment-textarea {
          width: 100%;
          background: rgba(0, 255, 0, 0.03);
          border: 1px dashed #00ff00;
          color: #ccffcc;
          padding: 10px;
          font-family: "Courier New", monospace;
          font-size: 13px;
          outline: none;
          resize: vertical;
          min-height: 120px;
        }

        .comment-textarea:focus {
          box-shadow: 0 0 8px #00ff00;
        }

        .comment-actions {
          margin-top: 10px;
          display: flex;
          align-items: center;
          gap: 12px;
          justify-content: space-between;
          flex-wrap: wrap;
        }

        .comment-send {
          border-color: #00ffff;
          color: #00ffff;
        }
        .comment-send:hover {
          background: #00ffff;
          color: #000;
        }

        .save-hint {
          margin-left: auto;
          font-size: 11px;
          color: #00cc00;
          opacity: 0.9;
        }

        .kbd {
          margin-left: 6px;
          padding: 1px 6px;
          border: 1px solid #00ff00;
          border-radius: 4px;
          font-family: "Courier New", monospace;
          font-size: 10px;
          color: #00ff00;
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
}
