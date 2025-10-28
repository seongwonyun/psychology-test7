import React from "react";

type NavControlsProps = {
  canPrev: boolean;
  canNext: boolean;
  isLast: boolean;
  onPrev: () => void;
  onNext: () => void;
  onFinish: () => void;
};

function NavControls({
  canPrev,
  canNext,
  isLast,
  onPrev,
  onNext,
  onFinish,
}: NavControlsProps) {
  return (
    <div className="nav-controls-container">
      {/* 이전 현실 접속 단계 버튼 */}
      <button
        type="button"
        className="nav-button nav-button-prev"
        onClick={onPrev}
        disabled={!canPrev}
        aria-label="이전 현실 인식 질문"
      >
        <span className="button-scan-line" />
        <span className="button-text">
          <span className="button-bracket">[</span>
          <span className="button-key">P</span>
          <span className="button-bracket">]</span> 이전
        </span>
      </button>

      {/* 다음 현실 접속 단계/접속 완료 버튼 */}
      {isLast ? (
        <button
          type="button"
          className="nav-button nav-button-finish"
          onClick={onFinish}
          disabled={!canNext}
          aria-label="현실 접속 완료"
        >
          <span className="button-scan-line" />
          <span className="button-text">
            <span className="button-bracket">[</span>
            <span className="button-key">F</span>
            <span className="button-bracket">]</span> 완료
          </span>
        </button>
      ) : (
        <button
          type="button"
          className="nav-button nav-button-next"
          onClick={onNext}
          disabled={!canNext}
          aria-label="다음 현실 인식 질문"
        >
          <span className="button-scan-line" />
          <span className="button-text">
            <span className="button-bracket">[</span>
            <span className="button-key">N</span>
            <span className="button-bracket">]</span> 다음
          </span>
        </button>
      )}

      <style jsx>{`
        /* 현실 접속 네비게이션 컨트롤 컨테이너 */
        .nav-controls-container {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
          margin-top: 20px;
          flex-wrap: wrap;
        }

        /* 현실 접속 제어 버튼 기본 스타일 */
        .nav-button {
          position: relative;
          background: #001a00;
          border: 2px solid #006600;
          color: #00ff00;
          padding: 12px 16px;
          border-radius: 6px;
          font-family: "Courier New", monospace;
          font-weight: 700;
          font-size: 12px;
          letter-spacing: 1px;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s ease;
          min-height: 48px; /* 모바일 터치 타겟 최소 크기 */
          min-width: 100px;
          max-width: 140px;
          flex: 1;
          overflow: hidden;
          text-shadow: 0 0 5px #00aa00, 0 0 10px #008800, 1px 1px 0px #000;
          box-shadow: 0 0 15px rgba(0, 255, 0, 0.4),
            inset 0 0 5px rgba(0, 150, 0, 0.3);
          -webkit-appearance: none;
          appearance: none;
          outline: none;
        }

        /* 현실 접속 신호 스캔 라인 효과 */
        .button-scan-line {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(0, 255, 0, 0.3),
            transparent
          );
          animation: button-scan 2s infinite ease-in-out;
          pointer-events: none;
        }

        /* 현실 접속 버튼 텍스트 레이어 */
        .button-text {
          position: relative;
          z-index: 2;
          display: inline-block;
        }

        /* 현실 접속 명령어 브래킷 */
        .button-bracket {
          color: #00cccc;
          font-weight: 400;
        }

        /* 현실 접속 키 하이라이트 */
        .button-key {
          color: #ffff00;
          font-weight: 900;
          text-shadow: 0 0 8px #ffff00, 0 0 15px #cccc00;
        }

        /* 이전 현실 접속 단계 버튼 스타일 */
        .nav-button-prev {
          border-color: #004400;
          color: #00cc00;
          background: #000f00;
          text-shadow: 0 0 3px #008800, 0 0 6px #006600, 1px 1px 0px #000;
          box-shadow: 0 0 10px rgba(0, 200, 0, 0.3),
            inset 0 0 5px rgba(0, 100, 0, 0.2);
        }

        .nav-button-prev .button-key {
          color: #00ffcc;
          text-shadow: 0 0 6px #00ffcc, 0 0 12px #00ccaa;
        }

        /* 다음 현실 접속 단계 버튼 스타일 */
        .nav-button-next {
          border-color: #00aa00;
          color: #00ff00;
          background: #002200;
          text-shadow: 0 0 8px #00ff00, 0 0 15px #00aa00, 1px 1px 0px #000;
          box-shadow: 0 0 20px rgba(0, 255, 0, 0.5),
            inset 0 0 8px rgba(0, 200, 0, 0.4);
        }

        .nav-button-next .button-key {
          color: #ffff00;
          text-shadow: 0 0 10px #ffff00, 0 0 20px #cccc00;
        }

        /* 현실 접속 완료 버튼 스타일 */
        .nav-button-finish {
          border-color: #ff6600;
          color: #ffaa00;
          background: #331100;
          text-shadow: 0 0 8px #ffaa00, 0 0 15px #ff8800, 1px 1px 0px #000;
          box-shadow: 0 0 20px rgba(255, 170, 0, 0.5),
            inset 0 0 8px rgba(255, 136, 0, 0.4);
        }

        .nav-button-finish .button-bracket {
          color: #ffccaa;
        }

        .nav-button-finish .button-key {
          color: #ffff00;
          text-shadow: 0 0 12px #ffff00, 0 0 24px #ffaa00;
        }

        /* 현실 접속 버튼 호버/포커스 효과 */
        .nav-button:hover:not(:disabled),
        .nav-button:focus:not(:disabled) {
          transform: scale(1.02);
          outline: none;
        }

        /* 이전 단계 버튼 현실 접속 호버 효과 */
        .nav-button-prev:hover:not(:disabled),
        .nav-button-prev:focus:not(:disabled) {
          background: #002200;
          border-color: #00cc00;
          color: #00ff00;
          box-shadow: 0 0 25px rgba(0, 255, 0, 0.7),
            0 0 40px rgba(0, 255, 0, 0.4), inset 0 0 15px rgba(0, 255, 0, 0.3);
          text-shadow: 0 0 10px #00ff00, 0 0 20px #00aa00, 0 0 30px #008800,
            1px 1px 0px #000;
        }

        /* 다음 단계 버튼 현실 접속 호버 효과 */
        .nav-button-next:hover:not(:disabled),
        .nav-button-next:focus:not(:disabled) {
          background: #004400;
          border-color: #00ff00;
          color: #ffffff;
          box-shadow: 0 0 30px rgba(0, 255, 0, 0.8),
            0 0 50px rgba(0, 255, 0, 0.5), inset 0 0 20px rgba(0, 255, 0, 0.4);
          text-shadow: 0 0 12px #00ff00, 0 0 24px #00aa00, 0 0 36px #008800,
            1px 1px 0px #000;
        }

        /* 접속 완료 버튼 현실 접속 호버 효과 */
        .nav-button-finish:hover:not(:disabled),
        .nav-button-finish:focus:not(:disabled) {
          background: #442200;
          border-color: #ffaa00;
          color: #ffffff;
          box-shadow: 0 0 30px rgba(255, 170, 0, 0.8),
            0 0 50px rgba(255, 170, 0, 0.5),
            inset 0 0 20px rgba(255, 170, 0, 0.4);
          text-shadow: 0 0 12px #ffaa00, 0 0 24px #ff8800, 0 0 36px #ff6600,
            1px 1px 0px #000;
        }

        /* 현실 접속 버튼 비활성 상태 */
        .nav-button:disabled {
          background: #000500;
          border-color: #002200;
          color: #004400;
          text-shadow: 0 0 1px #002200, 1px 1px 0px #000;
          cursor: not-allowed;
          box-shadow: 0 0 5px rgba(0, 50, 0, 0.2),
            inset 0 0 3px rgba(0, 30, 0, 0.1);
          transform: none;
          opacity: 0.6;
        }

        .nav-button:disabled .button-key {
          color: #003300;
          text-shadow: 0 0 2px #002200;
        }

        .nav-button:disabled .button-bracket {
          color: #002200;
        }

        .nav-button:disabled .button-scan-line {
          animation: none;
        }

        /* 현실 접속 신호 스캔 애니메이션 */
        @keyframes button-scan {
          0% {
            left: -100%;
          }
          50% {
            left: 100%;
          }
          100% {
            left: -100%;
          }
        }

        /* 태블릿 이상에서의 현실 접속 인터페이스 스타일 */
        @media (min-width: 768px) {
          .nav-controls-container {
            gap: 30px;
            margin-top: 30px;
          }

          .nav-button {
            padding: 15px 24px;
            font-size: 14px;
            letter-spacing: 2px;
            min-width: 120px;
            max-width: 160px;
          }
        }

        /* 대형 화면에서의 현실 접속 인터페이스 추가 최적화 */
        @media (min-width: 1024px) {
          .nav-controls-container {
            gap: 40px;
          }

          .nav-button {
            padding: 18px 30px;
            font-size: 16px;
            min-width: 140px;
            max-width: 180px;
          }

          .nav-button:hover:not(:disabled),
          .nav-button:focus:not(:disabled) {
            transform: scale(1.05);
          }
        }

        /* 현실 접속 접근성을 위한 고대비 모드 지원 */
        @media (prefers-contrast: high) {
          .nav-button {
            text-shadow: none;
            border-width: 3px;
          }

          .nav-button:hover:not(:disabled),
          .nav-button:focus:not(:disabled) {
            box-shadow: 0 0 0 3px #00ff00;
          }

          .button-key {
            text-shadow: none;
          }
        }

        /* 현실 신호 간소화 - 모션 감소 선호 사용자 */
        @media (prefers-reduced-motion: reduce) {
          .nav-button {
            transition: none;
          }

          .button-scan-line {
            animation: none;
          }

          .nav-button:hover:not(:disabled),
          .nav-button:focus:not(:disabled) {
            transform: none;
          }
        }

        /* 모바일 세로 모드 현실 접속 인터페이스 최적화 */
        @media (orientation: portrait) and (max-width: 767px) {
          .nav-controls-container {
            flex-direction: column;
            gap: 8px;
            margin-top: 15px;
          }

          .nav-button {
            width: 100%;
            max-width: none;
            min-width: 0;
            flex: none;
            font-size: 11px;
            padding: 10px 16px;
          }
        }

        /* 모바일 가로 모드 현실 접속 인터페이스 최적화 */
        @media (orientation: landscape) and (max-height: 600px) {
          .nav-controls-container {
            margin-top: 10px;
            gap: 8px;
          }

          .nav-button {
            padding: 8px 12px;
            font-size: 11px;
            min-height: 40px;
          }
        }

        /* 소형 디바이스 현실 접속 인터페이스 추가 최적화 */
        @media (max-width: 360px) {
          .nav-button {
            font-size: 10px;
            padding: 8px 12px;
            letter-spacing: 0.5px;
          }
        }

        /* iOS Safari 현실 접속 인터페이스 특화 최적화 */
        @supports (-webkit-appearance: none) {
          .nav-button {
            -webkit-tap-highlight-color: rgba(0, 255, 0, 0.3);
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            user-select: none;
          }
        }
      `}</style>
    </div>
  );
}

export default React.memo(NavControls);
