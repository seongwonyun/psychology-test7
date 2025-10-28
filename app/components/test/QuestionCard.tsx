"use client";

import React from "react";
import scale from "@/app/data/scale.json";

interface Question {
  id: string;
  text: string;
  options?: string[];
}

interface QuestionCardProps {
  question: Question;
  value?: number;
  onChange: (v: number) => void;
}

export default function QuestionCard({
  question,
  value,
  onChange,
}: QuestionCardProps) {
  if (!question) return null;

  // ✅ 문항의 options가 있으면 그것을 사용, 없으면 scale.json을 사용
  const options =
    Array.isArray(question.options) && question.options.length > 0
      ? question.options.map((label, i) => ({ value: i + 1, label }))
      : (scale as { value: number; label: string }[]);

  // 키보드 단축키 (1-9, 0)
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const key = e.key;
      const numKey = parseInt(key);

      // 1-9 키 처리
      if (numKey >= 1 && numKey <= 9 && numKey <= options.length) {
        const targetOption = options.find((opt) => opt.value === numKey);
        if (targetOption) {
          onChange(targetOption.value);
        }
      }

      // 0 키로 10번째 옵션 선택 (있는 경우)
      if (key === "0" && options.length >= 10) {
        const targetOption = options.find((opt) => opt.value === 10);
        if (targetOption) {
          onChange(targetOption.value);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [options, onChange]);

  return (
    <div className="question-card crt-flicker">
      {/* 터미널 헤더 - HomePage 스타일 적용 */}
      <div className="question-header">
        <div className="terminal-line">
          <span className="terminal-prompt">user@psych-test:~$</span>
          <span className="terminal-cursor crt-cursor">█</span>
        </div>
        <div className="question-id">
          <span className="bracket">[</span>
          <span className="id-text crt-text-glow">Q{question.id}</span>
          <span className="bracket">]</span>
          <span className="status crt-flicker-slow">AWAITING RESPONSE</span>
        </div>
      </div>

      {/* 질문 텍스트 - HomePage 스타일 강화 */}
      <div className="question-content">
        <div className="question-text crt-text-glow">{question.text}</div>
      </div>

      {/* 선택지 영역 - HomePage 스타일로 강화 */}
      <div className="options-container">
        <div className="options-header">
          <span className="bracket">[</span>
          <span className="options-label crt-text-glow">SELECT OPTION</span>
          <span className="bracket">]</span>
        </div>

        {/* 가로형 슬라이더 - HomePage 스타일 적용 */}
        <div className="slider-container">
          {/* 양끝 라벨 */}
          <div className="slider-labels">
            <div className="label-left crt-text-glow">전혀 그렇지 않다</div>
            <div className="label-right crt-text-glow">매우 그렇다</div>
          </div>

          <div className="slider-track">
            {/* 연결선 */}
            <div className="slider-line" />

            {/* 옵션 포인트들 */}
            {options.map((opt, index) => {
              const isSelected = value === opt.value;
              const keyHint =
                opt.value <= 9
                  ? opt.value.toString()
                  : opt.value === 10
                  ? "0"
                  : "";

              return (
                <div
                  key={opt.value}
                  className="slider-point-container"
                  style={{
                    left: `${(index / Math.max(options.length - 1, 1)) * 100}%`,
                  }}
                >
                  <label
                    className={`slider-point ${isSelected ? "selected" : ""}`}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onChange(opt.value);
                      }
                    }}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      className="slider-radio"
                      value={opt.value}
                      checked={isSelected}
                      onChange={() => onChange(opt.value)}
                      aria-label={`${question.text} - 레벨 ${opt.value}`}
                    />

                    {/* 포인트 원형 */}
                    <div className="point-circle">
                      <div className="point-inner" />
                      <div className="point-glow" />
                    </div>

                    {/* 키보드 힌트 */}
                    {keyHint && (
                      <div className="key-hint">
                        <span className="key-text">{keyHint}</span>
                      </div>
                    )}

                    {/* 선택 상태 표시 */}
                    {isSelected && (
                      <div className="selection-indicator">
                        <span className="indicator-text crt-text-glow">●</span>
                      </div>
                    )}
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style jsx>{`
        /* HomePage와 정확히 동일한 스타일 적용 */
        .question-card {
          font-family: "Courier New", ui-monospace, SFMono-Regular, Menlo,
            monospace;
          font-weight: 600;
          background: rgba(0, 12, 6, 0.6);
          border: 2px solid rgba(0, 255, 140, 0.4);
          border-radius: 8px;
          padding: 20px;
          margin: 0 auto;
          max-width: 100%;
          box-shadow: 0 0 30px rgba(0, 255, 120, 0.2),
            inset 0 0 30px rgba(0, 60, 30, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.6);
          color: #bbffdd;
          text-shadow: 0 0 3px #00ffaa, 0 0 8px #00ff88,
            0 0 20px rgba(0, 255, 100, 0.6), 2px 2px 2px #000000,
            -1px -1px 1px #000000, 1px -1px 1px #000000, -1px 1px 1px #000000;
          backdrop-filter: blur(3px);
          position: relative;
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

        .question-header {
          margin-bottom: 20px;
          border-bottom: 1px solid rgba(0, 255, 140, 0.2);
          padding-bottom: 10px;
          background: rgba(0, 12, 6, 0.4);
          border: 1px solid rgba(0, 255, 140, 0.2);
          border-radius: 4px;
          padding: 10px;
          backdrop-filter: blur(3px);
        }

        .terminal-line {
          font-size: 11px;
          color: #bbffdd;
          margin-bottom: 5px;
          font-weight: 600;
        }

        .terminal-prompt {
          color: #bbffdd;
        }

        .terminal-cursor {
          color: #a7ffd8;
          text-shadow: 0 0 8px rgba(0, 255, 160, 0.7), 2px 2px 2px #000000;
        }

        .question-id {
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .bracket {
          color: #a7ffd8;
          font-weight: 600;
        }

        .id-text {
          color: #bbffdd;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .status {
          color: #ff9d66;
          font-size: 10px;
          margin-left: auto;
        }

        .question-content {
          margin-bottom: 25px;
          background: rgba(0, 12, 6, 0.4);
          border-radius: 4px;
          padding: 15px;
          border: 1px solid rgba(0, 255, 140, 0.2);
          backdrop-filter: blur(3px);
        }

        .question-text {
          font-size: 16px;
          line-height: 1.6;
          color: #bbffdd;
          text-align: center;
          font-weight: 600;
          word-break: keep-all;
          overflow-wrap: break-word;
          letter-spacing: 0.5px;
        }

        .options-container {
          margin-top: 20px;
          background: rgba(0, 12, 6, 0.4);
          border-radius: 4px;
          padding: 15px;
          border: 1px solid rgba(0, 255, 140, 0.2);
          backdrop-filter: blur(3px);
        }

        .options-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 15px;
          font-size: 12px;
          justify-content: center;
        }

        .options-label {
          color: #bbffdd;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        /* 강화된 슬라이더 스타일 */
        .slider-container {
          margin: 40px 20px;
          padding: 0 20px;
        }

        .slider-labels {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          font-size: 11px;
          color: #bbffdd;
        }

        .label-left,
        .label-right {
          font-weight: 600;
          padding: 8px 12px;
          background: rgba(0, 12, 6, 0.4);
          border: 1px solid rgba(0, 255, 140, 0.2);
          border-radius: 4px;
          backdrop-filter: blur(3px);
        }

        .slider-track {
          position: relative;
          height: 60px;
          width: 100%;
        }

        .slider-line {
          position: absolute;
          top: 25px;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(
            90deg,
            rgba(0, 255, 140, 0.2) 0%,
            rgba(0, 255, 140, 0.4) 25%,
            rgba(0, 255, 140, 0.6) 50%,
            rgba(0, 255, 140, 0.4) 75%,
            rgba(0, 255, 140, 0.2) 100%
          );
          border-radius: 2px;
          box-shadow: 0 0 6px rgba(0, 255, 140, 0.4);
        }

        .slider-point-container {
          position: absolute;
          top: 0;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
        }

        .slider-point {
          position: relative;
          cursor: pointer;
          outline: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin-top: 15px;
        }

        .slider-radio {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }

        .point-circle {
          position: relative;
          width: 18px;
          height: 18px;
          background: rgba(0, 12, 6, 0.6);
          border: 2px solid rgba(0, 255, 140, 0.4);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          z-index: 2;
          backdrop-filter: blur(3px);
          box-shadow: inset 0 0 10px rgba(0, 60, 30, 0.2);
        }

        .point-inner {
          width: 6px;
          height: 6px;
          background: rgba(0, 255, 140, 0.3);
          border-radius: 50%;
          opacity: 0.5;
          transition: all 0.3s ease;
        }

        .point-glow {
          position: absolute;
          top: -8px;
          left: -8px;
          right: -8px;
          bottom: -8px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(0, 255, 140, 0.2) 0%,
            transparent 70%
          );
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .key-hint {
          position: absolute;
          bottom: -20px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 9px;
          color: #bbffdd;
          background: rgba(0, 12, 6, 0.4);
          border: 1px solid rgba(0, 255, 140, 0.2);
          border-radius: 4px;
          padding: 2px 6px;
          text-shadow: 0 0 3px #00ffaa, 1px 1px 1px #000000;
          opacity: 0.8;
          backdrop-filter: blur(3px);
        }

        .key-text {
          color: #bbffdd;
          font-weight: 600;
        }

        .selection-indicator {
          position: absolute;
          top: -15px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 12px;
          z-index: 3;
          animation: pulse 2s infinite;
        }

        .indicator-text {
          color: #bbffdd;
          text-shadow: 0 0 8px #00ffaa, 0 0 15px #cccc00;
        }

        /* 호버/포커스 효과 - HomePage와 동일한 색상 */
        .slider-point:hover .point-circle,
        .slider-point:focus .point-circle {
          border-color: rgba(0, 255, 140, 0.6);
          background: rgba(0, 12, 6, 0.7);
          box-shadow: 0 0 12px rgba(0, 100, 0, 0.6);
          transform: scale(1.1);
        }

        .slider-point:hover .point-glow,
        .slider-point:focus .point-glow {
          opacity: 1;
        }

        .slider-point:hover .point-inner,
        .slider-point:focus .point-inner {
          opacity: 0.8;
        }

        /* 선택된 상태 - HomePage와 동일한 색상 */
        .slider-point.selected .point-circle {
          border-color: rgba(0, 255, 140, 0.8);
          background: rgba(0, 12, 6, 0.8);
          box-shadow: 0 0 18px rgba(0, 200, 0, 0.8),
            0 0 30px rgba(0, 150, 0, 0.4);
          transform: scale(1.15);
        }

        .slider-point.selected .point-inner {
          opacity: 1;
          background: #bbffdd;
          box-shadow: 0 0 10px #00ffaa;
        }

        .slider-point.selected .point-glow {
          opacity: 1;
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

        @keyframes pulse {
          0% {
            opacity: 1;
            transform: translateX(-50%) scale(1);
          }
          50% {
            opacity: 0.7;
            transform: translateX(-50%) scale(1.2);
          }
          100% {
            opacity: 1;
            transform: translateX(-50%) scale(1);
          }
        }

        /* 모바일 최적화 - HomePage 스타일 적용 */
        @media (max-width: 767px) {
          .question-card {
            padding: max(16px, env(safe-area-inset-top, 0)) 16px
              max(16px, env(safe-area-inset-bottom, 0));
            max-width: 95vw;
            margin: 0 auto;
          }

          .question-text {
            font-size: 14px;
          }

          .slider-container {
            margin: 30px 10px;
            padding: 0 10px;
          }

          .slider-labels {
            font-size: 10px;
            margin-bottom: 15px;
          }

          .slider-track {
            height: 50px;
          }

          .point-circle {
            width: 14px;
            height: 14px;
          }

          .point-inner {
            width: 4px;
            height: 4px;
          }

          .key-hint {
            font-size: 8px;
            bottom: -18px;
          }

          /* iOS 터치 최적화 */
          .slider-point {
            min-height: 44px;
            min-width: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }

        /* 태블릿 및 데스크톱 최적화 */
        @media (min-width: 768px) {
          .question-card {
            padding: 30px;
            border-radius: 12px;
            max-width: 4xl;
          }

          .question-text {
            font-size: 18px;
          }

          .slider-container {
            margin: 50px 30px;
            padding: 0 30px;
          }

          .slider-track {
            height: 80px;
          }

          .point-circle {
            width: 22px;
            height: 22px;
          }

          .point-inner {
            width: 8px;
            height: 8px;
          }
        }

        @media (min-width: 1024px) {
          .question-text {
            font-size: 20px;
          }

          .slider-container {
            margin: 60px 50px;
            padding: 0 50px;
          }

          .point-circle {
            width: 26px;
            height: 26px;
          }

          .point-inner {
            width: 10px;
            height: 10px;
          }
        }

        /* 접근성 및 사용자 환경 설정 */
        @media (prefers-contrast: high) {
          .question-card {
            border-width: 3px;
            border-color: #00ffaa;
            background: #000;
          }

          .point-glow {
            display: none;
          }

          .crt-text-glow,
          .question-text,
          .label-left,
          .label-right {
            text-shadow: none;
          }

          .crt-input:focus,
          .crt-text-glow-hover:focus {
            box-shadow: 0 0 0 3px #00ffbf;
          }
        }

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

        /* 터치 디바이스 최적화 */
        @media (hover: none) and (pointer: coarse) {
          .slider-point:hover {
            /* 터치 디바이스에서는 hover 효과 제거 */
          }

          .slider-point:active .point-circle {
            transform: scale(0.95);
          }
        }
      `}</style>
    </div>
  );
}
