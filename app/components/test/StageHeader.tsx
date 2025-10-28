import React from "react";
import ProgressBar from "./ProgressBar";

interface StageHeaderProps {
  currentStage: string;
  currentIndex: number;
  total: number;
  steps: string[];
}

export default function StageHeader({
  currentStage,
  currentIndex,
  total,
  steps,
}: StageHeaderProps) {
  const pct = total ? Math.round(((currentIndex + 1) / total) * 100) : 0;

  // 현재 단계의 인덱스 찾기
  const currentStepIndex = steps.findIndex((step) => step === currentStage);

  return (
    <div className="stage-header crt-flicker">
      {/* CRT 스캔라인 배경 */}
      <div className="header-scanlines" />

      {/* 메인 헤더 컨테이너 */}
      <div className="header-container">
        {/* 터미널 상태 라인 */}
        <div className="terminal-status">
          <div className="status-left">
            <span className="terminal-prompt crt-text-glow">
              psych-test@neural-link:
            </span>
            <span className="current-path crt-text-glow">/{currentStage}</span>
            <span className="terminal-cursor crt-cursor">$</span>
          </div>
          <div className="status-right">
            <span className="system-time crt-text-glow">
              {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* 단계 진행 표시 */}
        <div className="stages-container">
          <div className="stages-label">
            <span className="bracket">[</span>
            <span className="label-text crt-text-glow">STAGE PROGRESS</span>
            <span className="bracket">]</span>
          </div>

          <div className="stages-list">
            {steps.map((step, index) => {
              const isCurrent = step === currentStage;
              const isCompleted = index < currentStepIndex;
              const isPending = index > currentStepIndex;

              return (
                <div key={step} className="stage-item">
                  <div
                    className={`stage-indicator ${
                      isCurrent
                        ? "current"
                        : isCompleted
                        ? "completed"
                        : "pending"
                    }`}
                  >
                    <span className="stage-bracket">[</span>
                    <span className="stage-number">{index + 1}</span>
                    <span className="stage-bracket">]</span>
                  </div>
                  <span
                    className={`stage-name ${
                      isCurrent
                        ? "current"
                        : isCompleted
                        ? "completed"
                        : "pending"
                    }`}
                  >
                    {step.toUpperCase()}
                  </span>
                  {isCurrent && (
                    <span className="current-marker crt-flicker-slow">
                      <span className="marker-text"> &gt;&gt; ACTIVE</span>
                    </span>
                  )}
                  {isCompleted && <span className="completed-marker"> ✓</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* 진행률 영역 */}
        <div className="progress-section">
          <div className="progress-info">
            <div className="question-counter">
              <span className="counter-bracket">[</span>
              <span className="counter-current crt-text-glow">
                {currentIndex + 1}
              </span>
              <span className="counter-separator">/</span>
              <span className="counter-total">{total}</span>
              <span className="counter-bracket">]</span>
              <span className="counter-label">QUESTIONS</span>
            </div>

            <div className="percentage-display">
              <span className="percentage-value crt-text-glow">
                {pct.toString().padStart(3, "0")}%
              </span>
              <span className="percentage-label">COMPLETE</span>
            </div>
          </div>

          {/* 진행바 */}
          <ProgressBar
            value={pct}
            showLabel={false}
            showPercentage={false}
            animated={true}
          />
        </div>
      </div>

      <style jsx>{`
        /* HomePage와 동일한 스타일 적용 */
        .stage-header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(0, 12, 6, 0.6);
          backdrop-filter: blur(3px);
          -webkit-backdrop-filter: blur(3px);
          border-bottom: 2px solid rgba(0, 255, 140, 0.4);
          box-shadow: 0 0 30px rgba(0, 255, 120, 0.2),
            inset 0 0 30px rgba(0, 60, 30, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.6);
          font-family: "Courier New", ui-monospace, SFMono-Regular, Menlo,
            monospace;
          font-weight: 600;
          color: #bbffdd;
          text-shadow: 0 0 3px #00ffaa, 0 0 8px #00ff88,
            0 0 20px rgba(0, 255, 100, 0.6), 2px 2px 2px #000000,
            -1px -1px 1px #000000, 1px -1px 1px #000000, -1px 1px 1px #000000;
          /* Safe area 지원 */
          padding-top: env(safe-area-inset-top, 0);
          overflow: hidden;
        }

        /* HomePage에서 가져온 CRT 효과 클래스들 */
        .crt-text-glow {
          text-shadow: 0 0 3px #00ffaa, 0 0 8px #00ff88,
            0 0 20px rgba(0, 255, 100, 0.6), 2px 2px 2px #000000,
            -1px -1px 1px #000000, 1px -1px 1px #000000, -1px 1px 1px #000000;
        }

        .crt-cursor {
          animation: crt-cursor-blink 0.8s infinite;
        }

        .crt-flicker {
          animation: crt-flicker 4s infinite ease-in-out;
        }

        .crt-flicker-slow {
          animation: crt-flicker-slow 4s infinite ease-in-out;
        }

        .header-scanlines {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 1px,
            rgba(0, 255, 140, 0.1) 1px,
            rgba(0, 255, 140, 0.1) 2px
          );
          pointer-events: none;
          z-index: 1;
        }

        .header-container {
          position: relative;
          z-index: 2;
          max-width: 100%;
          margin: 0 auto;
          padding: 10px 15px;
        }

        .terminal-status {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 10px;
          margin-bottom: 8px;
          color: #bbffdd;
        }

        .status-left {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .terminal-prompt {
          color: #bbffdd;
        }

        .current-path {
          color: #a7ffd8;
          font-weight: 700;
        }

        .terminal-cursor {
          color: #a7ffd8;
          text-shadow: 0 0 8px rgba(0, 255, 160, 0.7), 2px 2px 2px #000000;
        }

        .system-time {
          color: #bbffdd;
          font-weight: 600;
        }

        .stages-container {
          margin-bottom: 12px;
        }

        .stages-label {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 8px;
          font-size: 11px;
          justify-content: center;
        }

        .bracket {
          color: #a7ffd8;
          font-weight: 600;
        }

        .label-text {
          color: #bbffdd;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .stages-list {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .stage-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          white-space: nowrap;
        }

        .stage-indicator {
          display: flex;
          align-items: center;
        }

        .stage-bracket {
          font-weight: 600;
          color: #a7ffd8;
        }

        .stage-number {
          font-weight: 900;
          min-width: 8px;
          text-align: center;
        }

        .stage-name {
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        /* 단계별 색상 - HomePage 팔레트 적용 */
        .stage-indicator.completed .stage-bracket,
        .stage-name.completed {
          color: #a7ffd8;
          opacity: 0.7;
        }

        .stage-indicator.completed .stage-number {
          color: #bbffdd;
          text-shadow: 0 0 4px #00ffaa, 0 0 8px #00ff88;
        }

        .stage-indicator.current .stage-bracket,
        .stage-name.current {
          color: #bbffdd;
        }

        .stage-indicator.current .stage-number {
          color: #bbffdd;
          text-shadow: 0 0 8px #00ffaa, 0 0 15px rgba(0, 255, 100, 0.8);
        }

        .stage-indicator.pending .stage-bracket,
        .stage-name.pending {
          color: rgba(187, 255, 221, 0.3);
        }

        .stage-indicator.pending .stage-number {
          color: rgba(187, 255, 221, 0.4);
        }

        .current-marker {
          color: #a7ffd8;
          font-size: 9px;
        }

        .completed-marker {
          color: #bbffdd;
          font-weight: 900;
          text-shadow: 0 0 6px #00ffaa;
        }

        .progress-section {
          margin-top: 10px;
        }

        .progress-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          font-size: 11px;
        }

        .question-counter {
          display: flex;
          align-items: center;
          gap: 2px;
        }

        .counter-bracket {
          color: #a7ffd8;
        }

        .counter-current {
          color: #bbffdd;
          font-weight: 900;
        }

        .counter-separator {
          color: #bbffdd;
        }

        .counter-total {
          color: #bbffdd;
          font-weight: 700;
        }

        .counter-label {
          color: #a7ffd8;
          margin-left: 4px;
          font-size: 9px;
        }

        .percentage-display {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .percentage-value {
          color: #bbffdd;
          font-weight: 900;
          font-size: 12px;
        }

        .percentage-label {
          color: #a7ffd8;
          font-size: 9px;
        }

        /* HomePage에서 가져온 애니메이션들 */
        @keyframes crt-cursor-blink {
          0%,
          50% {
            opacity: 1;
          }
          51%,
          100% {
            opacity: 0;
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

        @keyframes crt-flicker-slow {
          0%,
          100% {
            opacity: 0.7;
          }
          50% {
            opacity: 1;
          }
        }

        /* 태블릿 이상에서의 스타일 */
        @media (min-width: 768px) {
          .header-container {
            max-width: 1000px;
            padding: 15px 30px;
          }

          .terminal-status {
            font-size: 12px;
            margin-bottom: 12px;
          }

          .stages-label {
            font-size: 13px;
            margin-bottom: 10px;
          }

          .stage-item {
            font-size: 12px;
            gap: 6px;
          }

          .stages-list {
            gap: 12px;
          }

          .progress-info {
            font-size: 13px;
            margin-bottom: 10px;
          }

          .percentage-value {
            font-size: 14px;
          }

          .counter-label,
          .percentage-label {
            font-size: 10px;
          }
        }

        /* 대형 화면에서의 추가 최적화 */
        @media (min-width: 1024px) {
          .header-container {
            max-width: 1200px;
            padding: 20px 40px;
          }

          .terminal-status {
            font-size: 14px;
            margin-bottom: 15px;
          }

          .stages-label {
            font-size: 15px;
          }

          .stage-item {
            font-size: 14px;
          }

          .stages-list {
            gap: 16px;
          }

          .progress-info {
            font-size: 15px;
          }

          .percentage-value {
            font-size: 16px;
          }
        }

        /* 접근성을 위한 고대비 모드 지원 - HomePage와 동일 */
        @media (prefers-contrast: high) {
          .stage-header {
            background: #000;
            border-bottom-width: 3px;
            border-bottom-color: #00ffaa;
          }

          .header-scanlines {
            display: none;
          }

          .crt-text-glow,
          .terminal-prompt,
          .current-path,
          .system-time,
          .label-text,
          .counter-current,
          .percentage-value {
            text-shadow: none;
          }

          .stage-indicator.current .stage-number,
          .completed-marker {
            text-shadow: none;
          }
        }

        /* 모션 감소 선호 사용자를 위한 애니메이션 제거 - HomePage와 동일 */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }

          .crt-flicker,
          .crt-flicker-slow,
          .crt-cursor {
            animation: none !important;
            opacity: 1 !important;
          }
        }

        /* 모바일 최적화 - HomePage 패턴 적용 */
        @media (max-width: 767px) {
          .header-container {
            padding: max(8px, env(safe-area-inset-top, 0)) 12px
              max(8px, env(safe-area-inset-bottom, 0));
          }

          .terminal-status {
            font-size: 9px;
            margin-bottom: 6px;
          }

          .stages-label {
            font-size: 10px;
            margin-bottom: 6px;
          }

          .stages-list {
            gap: 6px;
          }

          .stage-item {
            font-size: 9px;
            gap: 2px;
          }

          .progress-info {
            font-size: 10px;
            margin-bottom: 6px;
          }

          .percentage-value {
            font-size: 11px;
          }

          .counter-label,
          .percentage-label {
            font-size: 8px;
          }
        }

        /* 세로 모드 최적화 */
        @media (orientation: portrait) and (max-width: 767px) {
          .current-marker {
            display: none; /* 공간 절약 */
          }
        }

        /* 가로 모드 최적화 */
        @media (orientation: landscape) and (max-height: 600px) {
          .header-container {
            padding: 6px 15px;
          }

          .terminal-status {
            margin-bottom: 4px;
          }

          .stages-container {
            margin-bottom: 6px;
          }

          .stages-label {
            margin-bottom: 4px;
          }

          .progress-section {
            margin-top: 6px;
          }

          .progress-info {
            margin-bottom: 4px;
          }
        }

        /* 작은 화면 추가 최적화 */
        @media (max-width: 360px) {
          .header-container {
            padding: 6px 10px;
          }

          .system-time {
            display: none; /* 공간 절약 */
          }

          .stages-list {
            gap: 4px;
          }

          .stage-name {
            display: none; /* 번호만 표시 */
          }

          .counter-label,
          .percentage-label {
            display: none;
          }
        }

        /* 터치 디바이스 최적화 */
        @media (hover: none) and (pointer: coarse) {
          .stage-header {
            -webkit-user-select: none;
            user-select: none;
          }
        }
      `}</style>
    </div>
  );
}
