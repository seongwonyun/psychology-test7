import React from "react";

interface ProgressBarProps {
  value?: number;
  max?: number;
  showPercentage?: boolean;
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
}

export default function ProgressBar({
  value = 0,
  max = 100,
  showPercentage = false,
  showLabel = false,
  label = "PROGRESS", // 지정된 영문 유지
  animated = true,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const displayValue = Math.round(percentage);

  return (
    <div className="progress-container">
      {/* 현실 접속 진행 상태 라벨 영역 */}
      {showLabel && (
        <div className="progress-label">
          <span className="label-bracket">[</span>
          <span className="label-text">{label}</span>
          <span className="label-bracket">]</span>
          {showPercentage && (
            <span className="progress-percentage">
              {displayValue.toString().padStart(3, "0")}%
            </span>
          )}
        </div>
      )}

      {/* 현실 접속 진행바 컨테이너 */}
      <div className="progress-bar-container">
        {/* 현실 접속 배경 트랙 */}
        <div className="progress-track">
          {/* 현실 인터페이스 스캔라인 배경 */}
          <div className="track-scanlines" />

          {/* 현실 접속 실제 진행바 */}
          <div
            className={`progress-fill ${animated ? "animated" : ""}`}
            style={{ width: `${percentage}%` }}
            role="progressbar"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={max}
            aria-label={`현실 접속 ${label}: ${displayValue}%`}
          >
            {/* 현실 접속 진행바 글로우 효과 */}
            <div className="progress-glow" />

            {/* 현실 접속 진행바 스캔 효과 */}
            {animated && <div className="progress-scan" />}

            {/* 현실 접속 진행바 패턴 */}
            <div className="progress-pattern" />
          </div>
        </div>

        {/* 현실 접속 진행바 테두리 */}
        <div className="progress-border" />
      </div>

      {/* 현실 접속 퍼센티지 표시 (독립형) */}
      {showPercentage && !showLabel && (
        <div className="progress-percentage-only">
          {displayValue.toString().padStart(3, "0")}%
        </div>
      )}

      <style jsx>{`
        /* 현실 접속 진행바 컨테이너 */
        .progress-container {
          font-family: "Courier New", monospace;
          color: #00aa00;
          font-size: 12px;
          margin: 8px 0;
        }

        /* 현실 접속 진행 상태 라벨 */
        .progress-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
          text-shadow: 1px 1px 0px rgba(0, 50, 0, 0.8), 0 0 2px #002200;
        }

        /* 현실 접속 명령어 브래킷 */
        .label-bracket {
          color: #00cccc;
          font-weight: 400;
        }

        /* 현실 접속 라벨 텍스트 */
        .label-text {
          color: #00ff00;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        /* 현실 접속 진행률 표시 */
        .progress-percentage,
        .progress-percentage-only {
          color: #ffff00;
          font-weight: 900;
          text-shadow: 0 0 8px #ffff00, 0 0 15px #cccc00, 1px 1px 0px #000;
          font-size: 11px;
          letter-spacing: 1px;
        }

        .progress-percentage-only {
          text-align: center;
          margin-top: 4px;
        }

        /* 현실 접속 진행바 메인 컨테이너 */
        .progress-bar-container {
          position: relative;
          width: 100%;
          height: 12px;
        }

        /* 현실 접속 진행바 트랙 */
        .progress-track {
          position: relative;
          width: 100%;
          height: 100%;
          background: #000800;
          border: 1px solid #003300;
          border-radius: 2px;
          overflow: hidden;
          box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.8),
            inset 0 0 4px rgba(0, 60, 0, 0.3);
        }

        /* 현실 인터페이스 트랙 스캔라인 */
        .track-scanlines {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: repeating-linear-gradient(
            90deg,
            transparent,
            transparent 1px,
            rgba(0, 40, 0, 0.2) 1px,
            rgba(0, 40, 0, 0.2) 2px
          );
          pointer-events: none;
          z-index: 1;
        }

        /* 현실 접속 진행바 채움 */
        .progress-fill {
          position: relative;
          height: 100%;
          background: linear-gradient(
            90deg,
            #004400 0%,
            #008800 50%,
            #00aa00 100%
          );
          transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          border-radius: 1px;
          box-shadow: 0 0 8px rgba(0, 200, 0, 0.6),
            0 0 16px rgba(0, 150, 0, 0.4), inset 0 0 4px rgba(0, 255, 0, 0.3);
        }

        /* 현실 접속 진행바 애니메이션 채움 */
        .progress-fill.animated {
          background: linear-gradient(
            90deg,
            #004400 0%,
            #006600 25%,
            #008800 50%,
            #00aa00 75%,
            #00cc00 100%
          );
          background-size: 200% 100%;
          animation: progress-shimmer 2s ease-in-out infinite;
        }

        /* 현실 접속 진행바 글로우 */
        .progress-glow {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            180deg,
            rgba(0, 255, 0, 0.4) 0%,
            rgba(0, 255, 0, 0.1) 50%,
            rgba(0, 255, 0, 0.4) 100%
          );
          pointer-events: none;
          z-index: 2;
        }

        /* 현실 접속 진행바 스캔 */
        .progress-scan {
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(0, 255, 0, 0.8),
            transparent
          );
          animation: progress-scan 3s ease-in-out infinite;
          pointer-events: none;
          z-index: 3;
        }

        /* 현실 접속 진행바 패턴 */
        .progress-pattern {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 2px,
            rgba(0, 255, 0, 0.1) 2px,
            rgba(0, 255, 0, 0.1) 4px
          );
          pointer-events: none;
          z-index: 1;
        }

        /* 현실 접속 진행바 테두리 */
        .progress-border {
          position: absolute;
          top: -1px;
          left: -1px;
          right: -1px;
          bottom: -1px;
          border: 1px solid #006600;
          border-radius: 3px;
          pointer-events: none;
          box-shadow: 0 0 4px rgba(0, 100, 0, 0.4);
        }

        /* 현실 접속 진행바 애니메이션 */
        @keyframes progress-shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        @keyframes progress-scan {
          0% {
            left: -50%;
          }
          50% {
            left: 100%;
          }
          100% {
            left: -50%;
          }
        }

        /* 태블릿 이상에서의 현실 접속 인터페이스 스타일 */
        @media (min-width: 768px) {
          .progress-container {
            font-size: 14px;
            margin: 12px 0;
          }

          .progress-bar-container {
            height: 16px;
          }

          .progress-label {
            margin-bottom: 8px;
          }

          .progress-percentage,
          .progress-percentage-only {
            font-size: 13px;
          }

          .progress-track {
            border-radius: 4px;
          }

          .progress-fill {
            border-radius: 3px;
          }

          .progress-border {
            border-radius: 5px;
          }
        }

        /* 대형 화면에서의 현실 접속 인터페이스 추가 최적화 */
        @media (min-width: 1024px) {
          .progress-container {
            font-size: 16px;
            margin: 16px 0;
          }

          .progress-bar-container {
            height: 20px;
          }

          .progress-percentage,
          .progress-percentage-only {
            font-size: 15px;
          }

          .progress-fill {
            box-shadow: 0 0 12px rgba(0, 200, 0, 0.7),
              0 0 24px rgba(0, 150, 0, 0.5), inset 0 0 6px rgba(0, 255, 0, 0.4);
          }
        }

        /* 현실 접속 접근성을 위한 고대비 모드 지원 */
        @media (prefers-contrast: high) {
          .progress-track {
            border-width: 2px;
            border-color: #00ff00;
          }

          .progress-fill {
            background: #00ff00;
            box-shadow: none;
          }

          .progress-glow,
          .progress-pattern,
          .track-scanlines {
            display: none;
          }

          .label-text,
          .progress-percentage,
          .progress-percentage-only {
            text-shadow: none;
          }
        }

        /* 현실 신호 간소화 - 모션 감소 선호 사용자 */
        @media (prefers-reduced-motion: reduce) {
          .progress-fill {
            transition: width 0.3s ease;
          }

          .progress-fill.animated {
            animation: none;
            background: linear-gradient(
              90deg,
              #004400 0%,
              #008800 50%,
              #00aa00 100%
            );
          }

          .progress-scan {
            animation: none;
            display: none;
          }
        }

        /* 소형 디바이스 현실 접속 인터페이스 최적화 */
        @media (max-width: 480px) {
          .progress-container {
            font-size: 11px;
          }

          .progress-bar-container {
            height: 10px;
          }

          .progress-percentage,
          .progress-percentage-only {
            font-size: 10px;
          }

          .label-text {
            letter-spacing: 0.5px;
          }
        }

        /* 초소형 디바이스 현실 접속 인터페이스 최적화 */
        @media (max-width: 360px) {
          .progress-container {
            font-size: 10px;
          }

          .progress-bar-container {
            height: 8px;
          }

          .progress-percentage,
          .progress-percentage-only {
            font-size: 9px;
          }

          .progress-label {
            flex-direction: column;
            align-items: flex-start;
            gap: 2px;
          }
        }

        /* 현실 접속 다크 모드 최적화 */
        @media (prefers-color-scheme: dark) {
          .progress-track {
            background: #000400;
            box-shadow: inset 0 0 12px rgba(0, 0, 0, 0.9),
              inset 0 0 6px rgba(0, 80, 0, 0.4);
          }
        }
      `}</style>
    </div>
  );
}
