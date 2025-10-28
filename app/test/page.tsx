"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useTestStore } from "@/app/store/useTestStore";
import permaData from "@/app/data/perma.json";
import StageHeader from "@/app/components/test/StageHeader";
import QuestionCard from "@/app/components/test/QuestionCard";
import NavControls from "@/app/components/test/NavControls";
import { nextStageAfter } from "@/app/utils/flow";
import { computePermaScores } from "@/app/utils/perma";
import MatrixRain from "@/app/components/MatrixRain";

type Stage = "intro" | "permaTest" | "results";

type Question = {
  id: string;
  text: string;
  reverse_score?: boolean;
  options?: string[];
};

type PermaJson = Record<"P" | "E" | "S" | "M" | "A", Question[]>;

// 현실 접속 단계 (지정된 영문 유지)
const steps = [
  "Access Contact",
  "Code authentication",
  "Connection command",
] as const;

function flatten(obj: unknown): Question[] {
  if (Array.isArray(obj)) return obj as Question[];
  if (obj && typeof obj === "object")
    return Object.values(obj as Record<string, Question[]>).flat();
  return [];
}

export default function TestPage() {
  const router = useRouter();

  const {
    currentStage,
    currentIndex,
    setIndex,
    setStage,
    answers,
    saveAnswer,
    setResults,
  } = useTestStore() as {
    currentStage: Stage;
    currentIndex: number;
    setIndex: (i: number) => void;
    setStage: (s: Stage) => void;
    answers: Record<string, Record<string, number | undefined>>;
    saveAnswer: (bundle: string, id: string, value: number) => void;
    setResults: (payload: unknown) => void;
  };

  // 인트로 → 현실 접속 테스트 자동 진입
  useEffect(() => {
    if (currentStage === "intro") setStage("permaTest");
  }, [currentStage, setStage]);

  // 현실 인식 척도 번호 제거 (순수한 응답만 표시)
  useEffect(() => {
    const removeNumbersFromOptions = () => {
      const optionButtons = document.querySelectorAll(".option-button");
      optionButtons.forEach((button) => {
        const text = button.textContent || "";
        // "1. 전혀 그렇지 않다" → "전혀 그렇지 않다"로 변경
        const cleanText = text.replace(/^\d+\.\s*/, "");
        if (cleanText !== text) {
          button.textContent = cleanText;
        }
      });
    };

    // 현실 인터페이스 업데이트 후 실행
    const timer = setTimeout(removeNumbersFromOptions, 100);
    return () => clearTimeout(timer);
  }, [currentIndex, currentStage]); // 접속 단계나 인덱스 변경 시마다 실행

  const bundle = useMemo((): { key: string | null; items: Question[] } => {
    if (currentStage === "permaTest") {
      return { key: "perma", items: flatten(permaData as PermaJson) };
    }
    return { key: null, items: [] };
  }, [currentStage]);

  const total = bundle.items.length;
  const q = bundle.items[currentIndex];
  const val =
    bundle.key && q?.id
      ? (answers[bundle.key]?.[q.id] as number | undefined)
      : undefined;

  function onNext() {
    if (currentIndex < total - 1) {
      setIndex(currentIndex + 1);
      return;
    }

    const next = nextStageAfter(currentStage);
    console.log(next);
    if (next === "results") {
      const perma = computePermaScores(answers.perma || {});
      // ✅ 현실 접속 결과(perma) + 원본 응답 데이터(answersRaw) 저장
      setResults({ perma, answersRaw: answers });

      const codeStr = [
        perma.codes?.P,
        perma.codes?.E,
        perma.codes?.S,
        perma.codes?.M,
        perma.codes?.A,
      ]
        .join("")
        .toLowerCase();

      router.push(`/result?code=${codeStr}`);
    } else {
      setStage(next as Stage);
    }
  }

  return (
    <main className="min-h-screen relative font-mono bg-black crt-screen crt-flicker">
      {/* 현실 접속 매트릭스 배경 */}
      <MatrixRain />

      {/* 현실 인터페이스 CRT 오버레이 */}
      <div className="crt-overlay" />
      <div className="scanlines" />
      <div className="crt-flicker-effect" />

      {/* 현실 접속 콘텐츠 레이어 */}
      <div className="relative z-10 crt-content">
        <div className="crt-container">
          <StageHeader
            currentStage={currentStage}
            currentIndex={currentIndex}
            total={total}
            steps={steps as unknown as string[]}
          />
        </div>

        <section className="test-section">
          {q && (
            <div className="crt-question-container">
              <QuestionCard
                question={q}
                value={val}
                onChange={(v: number) => {
                  if (bundle.key) saveAnswer(bundle.key, q.id, v);
                }}
              />
            </div>
          )}
          <div className="crt-controls-container">
            <NavControls
              canPrev={currentIndex > 0}
              canNext={val !== undefined && val !== null}
              isLast={currentIndex === total - 1}
              onPrev={() => setIndex(currentIndex - 1)}
              onNext={onNext}
              onFinish={onNext}
            />
          </div>
        </section>
      </div>

      <style jsx>{`
        /* HomePage와 정확히 동일한 배경 스타일 */
        .crt-screen {
          background: radial-gradient(
            ellipse at center,
            rgba(0, 15, 8, 0.7),
            rgba(0, 0, 0, 0.85)
          );
          /* 모바일 안전 영역 지원 */
          padding-top: env(safe-area-inset-top, 0);
          padding-bottom: env(safe-area-inset-bottom, 0);
          padding-left: env(safe-area-inset-left, 0);
          padding-right: env(safe-area-inset-right, 0);
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

        /* 현실 경계 비네팅 효과 */
        .crt-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(
            ellipse at center,
            transparent 0%,
            rgba(0, 0, 0, 0.3) 100%
          );
          pointer-events: none;
          z-index: 1;
        }

        /* HomePage와 동일한 스캔라인 색상 */
        .scanlines {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 1px,
            rgba(0, 255, 140, 0.1) 1px,
            rgba(0, 255, 140, 0.1) 3px
          );
          pointer-events: none;
          z-index: 2;
        }

        /* 현실 신호 플리커 */
        .crt-flicker-effect {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 255, 140, 0.02);
          animation: crt-flicker 0.1s infinite linear alternate;
          pointer-events: none;
          z-index: 3;
        }

        .crt-content {
          filter: blur(0.3px) contrast(1.2);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        /* HomePage와 동일한 컨테이너 스타일 */
        .crt-container {
          background: rgba(0, 12, 6, 0.4);
          border-bottom: 2px solid rgba(0, 255, 140, 0.4);
          padding: 10px 15px;
          backdrop-filter: blur(3px);
          box-shadow: 0 0 30px rgba(0, 255, 120, 0.2),
            inset 0 0 30px rgba(0, 60, 30, 0.2);
        }

        /* 현실 인식 테스트 섹션 */
        .test-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 15px;
          max-width: 100%;
          margin: 0 auto;
          box-sizing: border-box;
        }

        /* HomePage와 동일한 질문 컨테이너 스타일 */
        .crt-question-container {
          background: rgba(0, 12, 6, 0.6);
          border: 2px solid rgba(0, 255, 140, 0.4);
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 20px;
          box-shadow: 0 0 30px rgba(0, 255, 120, 0.2),
            inset 0 0 30px rgba(0, 60, 30, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(3px);
          flex: 1;
          display: flex;
          align-items: center;
          min-height: 200px;
        }

        /* HomePage와 동일한 제어 컨테이너 스타일 */
        .crt-controls-container {
          background: rgba(0, 12, 6, 0.6);
          border: 2px solid rgba(0, 255, 140, 0.4);
          border-radius: 8px;
          padding: 15px;
          box-shadow: 0 0 30px rgba(0, 255, 120, 0.2),
            inset 0 0 30px rgba(0, 60, 30, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(3px);
          margin-top: auto;
        }

        /* HomePage와 동일한 글로벌 스타일 */
        :global(.crt-container *),
        :global(.crt-question-container *),
        :global(.crt-controls-container *) {
          font-family: "Courier New", ui-monospace, SFMono-Regular, Menlo,
            monospace !important;
          font-weight: 600 !important;
          color: #bbffdd !important;
          text-shadow: 0 0 3px #00ffaa, 0 0 8px #00ff88,
            0 0 20px rgba(0, 255, 100, 0.6), 2px 2px 2px #000000,
            -1px -1px 1px #000000, 1px -1px 1px #000000, -1px 1px 1px #000000 !important;
        }

        /* HomePage와 동일한 버튼 스타일 */
        :global(.crt-controls-container button) {
          background: rgba(0, 12, 6, 0.6) !important;
          border: 2px solid rgba(0, 255, 140, 0.4) !important;
          color: #bbffdd !important;
          padding: 12px 20px !important;
          border-radius: 4px !important;
          cursor: pointer !important;
          transition: all 0.3s ease !important;
          font-family: "Courier New", ui-monospace, SFMono-Regular, Menlo,
            monospace !important;
          font-weight: 600 !important;
          font-size: 13px !important;
          letter-spacing: 1px !important;
          text-transform: uppercase !important;
          min-width: 100px !important;
          max-width: 140px !important;
          position: relative !important;
          overflow: hidden !important;
          backdrop-filter: blur(3px) !important;
          box-shadow: 0 0 15px rgba(0, 255, 120, 0.2),
            inset 0 0 15px rgba(0, 60, 30, 0.2) !important;
          text-shadow: 0 0 3px #00ffaa, 0 0 8px #00ff88,
            0 0 20px rgba(0, 255, 100, 0.6), 2px 2px 2px #000000,
            -1px -1px 1px #000000, 1px -1px 1px #000000, -1px 1px 1px #000000 !important;
        }

        :global(.crt-controls-container button:disabled) {
          opacity: 0.4 !important;
          cursor: not-allowed !important;
          border-color: rgba(0, 255, 140, 0.2) !important;
          background: rgba(0, 12, 6, 0.3) !important;
        }

        :global(.crt-controls-container button:not(:disabled):hover),
        :global(.crt-controls-container button:not(:disabled):focus) {
          border-color: rgba(0, 255, 140, 0.6) !important;
          background: rgba(0, 12, 6, 0.8) !important;
          box-shadow: 0 0 25px rgba(0, 255, 120, 0.4),
            inset 0 0 25px rgba(0, 60, 30, 0.3) !important;
          transform: scale(1.02) !important;
          outline: none !important;
        }

        :global(.crt-controls-container button::before) {
          content: "" !important;
          position: absolute !important;
          top: 0 !important;
          left: -100% !important;
          width: 100% !important;
          height: 100% !important;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(0, 255, 140, 0.2),
            transparent
          ) !important;
          animation: button-scan 3s infinite !important;
        }

        :global(.crt-controls-container > div) {
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          gap: 20px !important;
        }

        /* 컨테이너별 세부 스타일 */
        :global(.crt-container h1),
        :global(.crt-container h2),
        :global(.crt-container h3) {
          color: #bbffdd !important;
          font-size: 16px !important;
          letter-spacing: 1px !important;
          margin: 0 !important;
          text-align: center !important;
        }

        :global(.crt-question-container .question-text) {
          color: #bbffdd !important;
          font-size: 14px !important;
          line-height: 1.5 !important;
          text-align: center !important;
          margin-bottom: 15px !important;
        }

        :global(.crt-question-container .option-button) {
          background: rgba(0, 12, 6, 0.4) !important;
          border: 1px solid rgba(0, 255, 140, 0.3) !important;
          color: #bbffdd !important;
          padding: 10px 14px !important;
          margin: 4px 0 !important;
          border-radius: 4px !important;
          cursor: pointer !important;
          width: 100% !important;
          text-align: left !important;
          font-size: 12px !important;
          transition: all 0.2s ease !important;
          backdrop-filter: blur(2px) !important;
        }

        :global(.crt-question-container .option-button:hover),
        :global(.crt-question-container .option-button:focus) {
          background: rgba(0, 12, 6, 0.6) !important;
          border-color: rgba(0, 255, 140, 0.5) !important;
          box-shadow: 0 0 15px rgba(0, 255, 120, 0.3) !important;
          outline: none !important;
        }

        :global(.crt-question-container .option-button.selected) {
          background: rgba(0, 12, 6, 0.8) !important;
          border-color: rgba(0, 255, 140, 0.7) !important;
          box-shadow: 0 0 20px rgba(0, 255, 120, 0.5) !important;
        }

        /* HomePage와 동일한 애니메이션 */
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

        /* 태블릿 이상에서의 스타일 */
        @media (min-width: 768px) {
          .crt-container {
            padding: 20px 30px;
          }

          .test-section {
            padding: 30px;
            max-width: 800px;
          }

          .crt-question-container {
            padding: 25px;
            margin-bottom: 30px;
            min-height: 250px;
            border-radius: 12px;
          }

          .crt-controls-container {
            padding: 25px;
            border-radius: 12px;
          }

          :global(.crt-controls-container > div) {
            gap: 30px !important;
          }

          :global(.crt-controls-container button) {
            padding: 15px 24px !important;
            min-width: 120px !important;
            max-width: 160px !important;
            font-size: 14px !important;
            letter-spacing: 2px !important;
          }

          :global(.crt-container h1),
          :global(.crt-container h2),
          :global(.crt-container h3) {
            font-size: 20px !important;
            letter-spacing: 2px !important;
          }

          :global(.crt-question-container .question-text) {
            font-size: 16px !important;
          }

          :global(.crt-question-container .option-button) {
            font-size: 14px !important;
            padding: 12px 16px !important;
            margin: 6px 0 !important;
          }

          :global(.crt-controls-container button:hover),
          :global(.crt-controls-container button:focus) {
            transform: scale(1.05) !important;
          }
        }

        /* 대형 화면에서의 추가 최적화 */
        @media (min-width: 1024px) {
          .test-section {
            max-width: 1000px;
            padding: 40px;
          }

          .crt-question-container {
            padding: 30px;
            min-height: 300px;
          }

          .crt-controls-container {
            padding: 30px;
          }

          :global(.crt-container h1),
          :global(.crt-container h2),
          :global(.crt-container h3) {
            font-size: 24px !important;
            letter-spacing: 3px !important;
          }

          :global(.crt-question-container .question-text) {
            font-size: 18px !important;
          }

          :global(.crt-controls-container button) {
            font-size: 16px !important;
            padding: 18px 30px !important;
            min-width: 140px !important;
            max-width: 180px !important;
          }
        }

        /* HomePage와 동일한 접근성 지원 */
        @media (prefers-contrast: high) {
          .crt-screen {
            background: #000;
          }

          :global(.crt-container *),
          :global(.crt-question-container *),
          :global(.crt-controls-container *) {
            text-shadow: none !important;
          }

          :global(.crt-controls-container button) {
            border-width: 3px !important;
          }

          :global(.crt-controls-container button:hover),
          :global(.crt-controls-container button:focus) {
            box-shadow: 0 0 0 3px #00ffbf !important;
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
          .crt-flicker-effect {
            animation: none !important;
            opacity: 1 !important;
          }

          :global(.crt-controls-container button::before) {
            animation: none !important;
          }

          :global(.crt-controls-container button:hover),
          :global(.crt-controls-container button:focus) {
            transform: none !important;
          }
        }

        /* 모바일 최적화 */
        @media (max-width: 767px) {
          .test-section {
            padding: max(10px, env(safe-area-inset-top, 0)) 10px
              max(10px, env(safe-area-inset-bottom, 0));
          }

          .crt-question-container {
            padding: 12px;
            min-height: 180px;
          }

          .crt-controls-container {
            padding: 12px;
          }

          :global(.crt-controls-container > div) {
            flex-direction: row !important;
            justify-content: space-between !important;
            gap: 12px !important;
          }

          :global(.crt-controls-container button) {
            flex: 1 !important;
            max-width: 48% !important;
            min-width: 100px !important;
          }

          :global(.crt-container h1),
          :global(.crt-container h2),
          :global(.crt-container h3) {
            font-size: 14px !important;
            letter-spacing: 1px !important;
          }

          :global(.crt-question-container .question-text) {
            font-size: 12px !important;
          }

          :global(.crt-question-container .option-button) {
            font-size: 11px !important;
            padding: 8px !important;
          }
        }

        /* 가로 모드 최적화 */
        @media (orientation: landscape) and (max-height: 600px) {
          .crt-content {
            padding: 5px 0;
          }

          .crt-container {
            padding: 8px 15px;
          }

          .test-section {
            padding: 10px 15px;
          }

          .crt-question-container {
            min-height: 120px;
            padding: 15px;
            margin-bottom: 10px;
          }

          .crt-controls-container {
            padding: 15px;
          }

          :global(.crt-container h1),
          :global(.crt-container h2),
          :global(.crt-container h3) {
            font-size: 14px !important;
          }
        }

        /* 소형 디바이스 추가 최적화 */
        @media (max-width: 360px) {
          .test-section {
            padding: 8px;
          }

          .crt-question-container {
            padding: 10px;
          }

          .crt-controls-container {
            padding: 10px;
          }

          :global(.crt-controls-container button) {
            font-size: 11px !important;
            padding: 10px 12px !important;
            letter-spacing: 0.5px !important;
          }
        }
      `}</style>
    </main>
  );
}
