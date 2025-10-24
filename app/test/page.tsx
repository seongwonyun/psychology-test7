// // src/app/test/page.tsx
// "use client";

// import { useRouter } from "next/navigation";
// import { useEffect, useMemo } from "react";
// import { useTestStore } from "@/app/store/useTestStore";
// import permaData from "@/app/data/perma.json";
// import StageHeader from "@/app/components/test/StageHeader";
// import QuestionCard from "@/app/components/test/QuestionCard";
// import NavControls from "@/app/components/test/NavControls";
// import { nextStageAfter } from "@/app/utils/flow";
// import { computePermaScores } from "@/app/utils/perma";
// import MatrixRain from "@/app/components/MatrixRain";

// type Stage = "intro" | "permaTest" | "results";

// type Question = {
//   id: string;
//   text: string;
//   reverse_score?: boolean;
//   options?: string[];
// };

// type PermaJson = Record<"P" | "E" | "S" | "M" | "A", Question[]>;

// const steps = ["intro", "permaTest", "results"] as const;

// function flatten(obj: unknown): Question[] {
//   if (Array.isArray(obj)) return obj as Question[];
//   if (obj && typeof obj === "object")
//     return Object.values(obj as Record<string, Question[]>).flat();
//   return [];
// }

// export default function TestPage() {
//   const router = useRouter();

//   const {
//     currentStage,
//     currentIndex,
//     setIndex,
//     setStage,
//     answers,
//     saveAnswer,
//     setResults,
//   } = useTestStore() as {
//     currentStage: Stage;
//     currentIndex: number;
//     setIndex: (i: number) => void;
//     setStage: (s: Stage) => void;
//     answers: Record<string, Record<string, number | undefined>>;
//     saveAnswer: (bundle: string, id: string, value: number) => void;
//     setResults: (payload: unknown) => void;
//   };

//   // intro → permaTest 자동 진입
//   useEffect(() => {
//     if (currentStage === "intro") setStage("permaTest");
//   }, [currentStage, setStage]);

//   const bundle = useMemo((): { key: string | null; items: Question[] } => {
//     if (currentStage === "permaTest") {
//       return { key: "perma", items: flatten(permaData as PermaJson) };
//     }
//     return { key: null, items: [] };
//   }, [currentStage]);

//   const total = bundle.items.length;
//   const q = bundle.items[currentIndex];
//   const val =
//     bundle.key && q?.id
//       ? (answers[bundle.key]?.[q.id] as number | undefined)
//       : undefined;

//   function onNext() {
//     if (currentIndex < total - 1) {
//       setIndex(currentIndex + 1);
//       return;
//     }

//     const next = nextStageAfter(currentStage);
//     if (next === "results") {
//       const perma = computePermaScores(answers.perma || {});
//       // ✅ 요약(perma) + 원본 답(answersRaw)만 저장
//       setResults({ perma, answersRaw: answers });

//       const codeStr = [
//         perma.codes?.P,
//         perma.codes?.E,
//         perma.codes?.S,
//         perma.codes?.M,
//         perma.codes?.A,
//       ]
//         .join("")
//         .toLowerCase();

//       router.push(`/result/${codeStr}`);
//     } else {
//       setStage(next as Stage);
//     }
//   }

//   return (
//     <main className="min-h-screen relative">
//       <MatrixRain />
//       <div className="relative z-10">
//         <StageHeader
//           currentStage={currentStage}
//           currentIndex={currentIndex}
//           total={total}
//           steps={steps as unknown as string[]}
//         />
//         <section className="max-w-3xl mx-auto px-4 py-10">
//           {q && (
//             <QuestionCard
//               question={q}
//               value={val}
//               onChange={(v: number) => {
//                 if (bundle.key) saveAnswer(bundle.key, q.id, v); // ✅ 값만 저장
//               }}
//             />
//           )}
//           <NavControls
//             canPrev={currentIndex > 0}
//             canNext={val !== undefined && val !== null}
//             isLast={currentIndex === total - 1}
//             onPrev={() => setIndex(currentIndex - 1)}
//             onNext={onNext}
//             onFinish={onNext}
//           />
//         </section>
//       </div>
//     </main>
//   );
// }

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
import DebugPanel from "../components/dev/DebugPanel";

type Stage = "intro" | "permaTest" | "results";

type Question = {
  id: string;
  text: string;
  reverse_score?: boolean;
  options?: string[];
};

type PermaJson = Record<"P" | "E" | "S" | "M" | "A", Question[]>;

const steps = ["intro", "permaTest", "results"] as const;

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

  // intro → permaTest 자동 진입
  useEffect(() => {
    if (currentStage === "intro") setStage("permaTest");
  }, [currentStage, setStage]);

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
      // ✅ 요약(perma) + 원본 답(answersRaw) 저장
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
      // .toUpperCase();

      // router.push(`/result`);
      // router.push(`/result/${codeStr}`);
      router.push(`/result?code=${codeStr}`);
    } else {
      setStage(next as Stage);
    }
  }

  return (
    <main className="min-h-screen relative font-mono bg-black crt-screen">
      {/* 매트릭스 배경 */}
      <MatrixRain />

      {/* CRT 오버레이 */}
      <div className="crt-overlay" />
      <div className="scanlines" />
      <div className="crt-flicker" />

      {/* 콘텐츠 레이어 */}
      <div className="relative z-10 crt-content">
        <div className="crt-container">
          <StageHeader
            currentStage={currentStage}
            currentIndex={currentIndex}
            total={total}
            steps={steps as unknown as string[]}
          />
        </div>

        <section className="max-w-3xl mx-auto px-4 py-10">
          {q && (
            <div className="crt-question-container">
              <QuestionCard
                question={q}
                value={val}
                onChange={(v: number) => {
                  if (bundle.key) saveAnswer(bundle.key, q.id, v); // ✅ 값만 저장
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
        /* 배경 라디얼 + CRT 감성 */
        .crt-screen {
          background: radial-gradient(
            ellipse at center,
            #000a00 0%,
            #000400 70%,
            #000000 100%
          );
        }

        /* 비네팅 */
        .crt-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(
            ellipse at center,
            transparent 0%,
            rgba(0, 0, 0, 0.5) 100%
          );
          pointer-events: none;
          z-index: 1;
        }

        /* 스캔라인 */
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
            rgba(0, 40, 0, 0.15) 1px,
            rgba(0, 40, 0, 0.15) 3px
          );
          pointer-events: none;
          z-index: 2;
        }

        /* 플리커 */
        .crt-flicker {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 30, 0, 0.03);
          animation: crt-flicker 0.1s infinite linear alternate;
          pointer-events: none;
          z-index: 3;
        }

        .crt-content {
          filter: blur(0.3px) contrast(1.2);
        }

        .crt-container {
          background: rgba(0, 10, 0, 0.3);
          border-bottom: 1px solid #004400;
        }

        .crt-question-container {
          background: rgba(0, 15, 0, 0.2);
          border: 1px solid #003300;
          border-radius: 4px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: inset 0 0 20px rgba(0, 60, 0, 0.1),
            0 0 10px rgba(0, 100, 0, 0.2);
        }

        .crt-controls-container {
          background: rgba(0, 10, 0, 0.4);
          border: 1px solid #002200;
          border-radius: 4px;
          padding: 20px;
          box-shadow: inset 0 0 15px rgba(0, 40, 0, 0.1),
            0 0 5px rgba(0, 80, 0, 0.2);
        }

        /* 전역 CRT 폰트/색 오버라이드 (test 하위 컴포넌트 포함) */
        :global(.crt-container *),
        :global(.crt-question-container *),
        :global(.crt-controls-container *) {
          font-family: "Courier New", monospace !important;
          color: #00aa00 !important;
          text-shadow: 1px 1px 0px rgba(0, 50, 0, 0.8), 0 0 2px #002200 !important;
        }

        /* NavControls 버튼 그룹 레이아웃 */
        :global(.crt-controls-container > div) {
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          gap: 30px !important;
          flex-wrap: wrap !important;
        }

        /* 버튼 기본 스타일 */
        :global(.crt-controls-container button) {
          background: #001a00 !important;
          border: 2px solid #006600 !important;
          color: #00ff00 !important;
          padding: 12px 24px !important;
          margin: 5px !important;
          border-radius: 4px !important;
          transition: all 0.3s ease !important;
          font-family: "Courier New", monospace !important;
          font-weight: 700 !important;
          letter-spacing: 2px !important;
          text-transform: uppercase !important;
          min-width: 120px !important;
          position: relative !important;
          overflow: hidden !important;
          text-shadow: 0 0 5px #00aa00, 0 0 10px #008800, 1px 1px 0px #000 !important;
          box-shadow: 0 0 15px rgba(0, 255, 0, 0.4),
            inset 0 0 5px rgba(0, 150, 0, 0.3) !important;
        }

        /* 이전 버튼 강조 */
        :global(.crt-controls-container button:first-child) {
          border-color: #004400 !important;
          color: #00cc00 !important;
          background: #000f00 !important;
          text-shadow: 0 0 3px #008800, 0 0 6px #006600, 1px 1px 0px #000 !important;
          box-shadow: 0 0 10px rgba(0, 200, 0, 0.3),
            inset 0 0 5px rgba(0, 100, 0, 0.2) !important;
        }

        /* 다음/완료 버튼 강조 */
        :global(.crt-controls-container button:last-child) {
          border-color: #00aa00 !important;
          color: #00ff00 !important;
          background: #002200 !important;
          text-shadow: 0 0 8px #00ff00, 0 0 15px #00aa00, 1px 1px 0px #000 !important;
          box-shadow: 0 0 20px rgba(0, 255, 0, 0.5),
            inset 0 0 8px rgba(0, 200, 0, 0.4) !important;
        }

        /* 버튼 스캔 라인 */
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
            rgba(0, 255, 0, 0.3),
            transparent
          ) !important;
          animation: button-scan 2s infinite ease-in-out !important;
          pointer-events: none !important;
        }

        /* 호버 */
        :global(.crt-controls-container button:hover) {
          background: #003300 !important;
          border-color: #00ff00 !important;
          color: #ffffff !important;
          box-shadow: 0 0 30px rgba(0, 255, 0, 0.8),
            0 0 50px rgba(0, 255, 0, 0.4), inset 0 0 15px rgba(0, 255, 0, 0.3) !important;
          text-shadow: 0 0 10px #00ff00, 0 0 20px #00aa00, 0 0 30px #008800,
            1px 1px 0px #000 !important;
          transform: scale(1.05) !important;
        }

        /* 이전 버튼 호버 */
        :global(.crt-controls-container button:first-child:hover) {
          background: #002200 !important;
          border-color: #00cc00 !important;
          color: #00ff00 !important;
        }

        /* 다음/완료 버튼 호버 */
        :global(.crt-controls-container button:last-child:hover) {
          background: #004400 !important;
          border-color: #00ff00 !important;
          box-shadow: 0 0 35px rgba(0, 255, 0, 0.9),
            0 0 60px rgba(0, 255, 0, 0.5), inset 0 0 20px rgba(0, 255, 0, 0.4) !important;
        }

        /* 비활성 */
        :global(.crt-controls-container button:disabled) {
          background: #000500 !important;
          border-color: #002200 !important;
          color: #004400 !important;
          text-shadow: 0 0 1px #002200, 1px 1px 0px #000 !important;
          cursor: not-allowed !important;
          box-shadow: 0 0 5px rgba(0, 50, 0, 0.2),
            inset 0 0 3px rgba(0, 30, 0, 0.1) !important;
          transform: none !important;
        }

        /* 진행바(필요 시 StageHeader 내부) */
        :global(.crt-container [role="progressbar"]) {
          background: rgba(0, 20, 0, 0.5) !important;
          border: 1px solid #004400 !important;
        }
        :global(.crt-container [role="progressbar"] > div) {
          background: linear-gradient(
            90deg,
            #004400,
            #008800,
            #00aa00
          ) !important;
          box-shadow: 0 0 10px rgba(0, 150, 0, 0.5) !important;
        }

        /* 헤더 텍스트 */
        :global(.crt-container h1),
        :global(.crt-container h2),
        :global(.crt-container h3) {
          font-family: "Courier New", monospace !important;
          font-weight: 700 !important;
          letter-spacing: 2px !important;
          text-transform: uppercase !important;
          color: #00cc00 !important;
          text-shadow: 1px 1px 0px rgba(0, 80, 0, 0.8), 0 0 3px #003300,
            2px 2px 0px #000 !important;
        }

        /* 플리커 애니메이션 */
        @keyframes crt-flicker {
          0% {
            opacity: 1;
          }
          95% {
            opacity: 1;
          }
          96% {
            opacity: 0.97;
          }
          97% {
            opacity: 1;
          }
          98% {
            opacity: 0.98;
          }
          99% {
            opacity: 0.99;
          }
          100% {
            opacity: 1;
          }
        }

        /* 버튼 스캔 */
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
      `}</style>

      <DebugPanel />
    </main>
  );
}
