// "use client";
// import { useRouter } from "next/navigation";
// import MatrixRain from "@/app/components/MatrixRain";
// import { useTestStore } from "@/app/store/useTestStore";

// export default function HomePage() {
//   const router = useRouter();
//   const { setStage, resetAll } = useTestStore();

//   function start() {
//     resetAll();
//     setStage("permaTest");
//     router.push("/test");
//   }

//   return (
//     <main className="min-h-screen text-gray-100 relative">
//       <MatrixRain />
//       <section className="max-w-3xl mx-auto px-4 py-24 text-center">
//         <h1 className="text-3xl md:text-5xl font-semibold">Psychology Test</h1>
//         <p className="mt-4 text-gray-300">
//           PERMA와 무의식 신호로 나의 현재 상태를 점검해보세요.
//         </p>
//         <button
//           onClick={start}
//           className="mt-8 px-6 py-3 rounded-xl border border-emerald-500 text-emerald-300 hover:bg-emerald-500/10"
//         >
//           시작하기
//         </button>
//       </section>
//     </main>
//   );
// }

// src/app/page.tsx (또는 해당 위치)
// ✅ TSX + 타입 보강 + 닉네임 reset 순서 수정

"use client";
import React, { useEffect, useState, KeyboardEvent, JSX } from "react";
import { useRouter } from "next/navigation";
import MatrixRain from "@/app/components/MatrixRain";

type Stage = "initial" | "permaTest";

interface SystemInfo {
  userAgent: "CHROME" | "FIREFOX" | "UNKNOWN";
  platform: string;
  language: string;
  timezone: string;
  screenRes: string;
}

export default function HomePage(): JSX.Element {
  const [stage, setStage] = useState<Stage>("initial");
  const router = useRouter();
  const [nickname, setNickname] = useState<string>("");
  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({
    userAgent: "UNKNOWN",
    platform: "UNKNOWN",
    language: "",
    timezone: "",
    screenRes: "",
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toTimeString().split(" ")[0] ?? "");
      setCurrentDate(now.toISOString().split("T")[0] ?? "");
    };

    const getSystemInfo = () => {
      // 일부 브라우저에서 userAgentData 미정의 → 안전 캐스팅
      const navAny = navigator as any;
      const platform =
        navAny?.userAgentData?.platform ??
        (navigator.platform || navigator.userAgent || "UNKNOWN");

      setSystemInfo({
        userAgent: navigator.userAgent.includes("Chrome")
          ? "CHROME"
          : navigator.userAgent.includes("Firefox")
          ? "FIREFOX"
          : "UNKNOWN",
        platform,
        language: (navigator.language || "ko-KR").toUpperCase(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screenRes: `${window.screen.width}x${window.screen.height}`,
      });
    };

    updateTime();
    getSystemInfo();

    const timeInterval = window.setInterval(updateTime, 1000);
    return () => window.clearInterval(timeInterval);
  }, []);

  function start(): void {
    const trimmed = nickname.trim();
    if (!trimmed) {
      alert("닉네임을 입력해주세요.");
      return;
    }

    // 🔧 reset 순서를 닉네임 저장 '이전'으로 변경(기존 코드의 지워지는 문제 해결)
    const resetAll = () => {
      if (typeof window !== "undefined") {
        sessionStorage.clear();
        localStorage.clear();
      }
      // console.log("모든 데이터가 초기화되었습니다.");
    };

    resetAll();
    sessionStorage.setItem("nickname", trimmed);

    setStage("permaTest");
    router.push("/test");
  }

  function handleKeyPress(e: KeyboardEvent<HTMLInputElement>): void {
    if (e.key === "Enter") {
      start();
    }
  }

  return (
    <main className="min-h-screen text-gray-100 relative flex items-center justify-center font-mono bg-black crt-screen">
      <MatrixRain />

      {/* CRT Screen overlay */}
      <div className="crt-overlay"></div>
      <div className="scanlines"></div>
      <div className="crt-flicker"></div>

      <section className="max-w-4xl mx-auto px-4 text-center relative z-10 crt-content">
        {/* ASCII Header */}
        <div className="text-green-800 text-xs font-mono mb-6 opacity-70">
          <pre className="hacker-ascii">
            {`╔══════════════════════════════════════════════════════════════╗
║                    NEURAL LINK INTERFACE v0.1                ║
║                      REALITY ACCESS PROTOCOL                 ║
╚══════════════════════════════════════════════════════════════╝`}
          </pre>
        </div>

        {/* System Info */}
        <div className="text-green-700 text-sm font-mono mb-6 space-y-1">
          <div className="hacker-line">
            <span className="text-green-800">[{currentDate}]</span> REALITY LINK
            ESTABLISHED...
          </div>
          <div className="hacker-line delay-100">
            <span className="text-green-800">[{currentTime}]</span> TEMPORAL
            SYNC: ACTIVE
          </div>
          <div className="hacker-line delay-200">
            <span className="text-green-800">[{systemInfo.platform}]</span>{" "}
            PLATFORM: {systemInfo.userAgent}
          </div>
          <div className="hacker-line delay-300">
            <span className="text-green-800">[{systemInfo.language}]</span>{" "}
            AWAITING USER AUTHENTICATION
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-normal text-green-600 port-title tracking-wider mb-2">
          ---REALITY ACCESS TERMINAL---
        </h1>
        <p className="text-green-700 port-subtitle tracking-wide text-sm mb-8">
          WARNING: UNAUTHORIZED ACCESS IS PROHIBITED
        </p>

        <div className="space-y-4">
          <div className="text-green-700 text-sm font-mono port-label">
            USER IDENTIFICATION REQUIRED:
          </div>
          <div className="input-container">
            <input
              type="text"
              placeholder="접속명을 입력해주세요..."
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full max-w-md px-3 py-2 bg-black border border-green-800 text-green-600 placeholder-green-900 focus:outline-none focus:border-green-600 crt-input font-mono tracking-wider text-sm uppercase monitor-flicker port-input text-center"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={start}
            disabled={nickname.trim() === ""}
            className={`px-12 py-4 border-2 font-mono tracking-wider text-lg font-bold transition-all duration-200 port-button ${
              nickname.trim() === ""
                ? "border-green-900 text-green-900 cursor-not-allowed"
                : "border-green-600 text-green-500 hover:bg-green-500/20 hover:border-green-400 crt-button-main hover:scale-105"
            }`}
          >
            [CONNECT] 연결합니다.
          </button>
        </div>

        {/* System Status */}
        <div className="mt-8 text-green-800 text-xs font-mono space-y-1">
          <div className="flex justify-between">
            <span className="port-info">
              RESOLUTION: {systemInfo.screenRes}
            </span>
            <span className="port-info">BROWSER: {systemInfo.userAgent}</span>
            <span className="port-info">LANG: {systemInfo.language}</span>
          </div>
          <div className="flex justify-between">
            <span className="port-info">TIMEZONE: {systemInfo.timezone}</span>
            <span className="port-info">DATE: {currentDate}</span>
            <span className="port-info">
              STATUS:{" "}
              <span className="crt-flicker-slow text-green-600">ONLINE</span>
            </span>
          </div>
        </div>

        {/* Terminal cursor */}
        <div className="mt-6 text-green-700 text-sm font-mono port-terminal">
          user@reality:{currentTime}$ <span className="crt-cursor">█</span>
        </div>
      </section>

      <style jsx>{`
        .crt-screen {
          background: radial-gradient(
            ellipse at center,
            #000a00 0%,
            #000400 70%,
            #000000 100%
          );
        }
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
        .hacker-ascii {
          line-height: 1.2;
          text-shadow: 0 0 2px #002200;
        }
        .hacker-line {
          opacity: 0;
          animation: hacker-typewriter 0.5s ease-out forwards;
        }
        .delay-100 {
          animation-delay: 0.1s;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
        .delay-300 {
          animation-delay: 0.3s;
        }
        .crt-title {
          text-shadow: 1px 1px 0px rgba(0, 60, 0, 0.8), 0 0 2px #002200,
            0 0 4px #001100;
          font-weight: 400;
        }
        .crt-subtitle {
          text-shadow: 1px 1px 0px rgba(0, 50, 0, 0.6), 0 0 2px #001100;
          color: #ff4444;
          font-weight: bold;
        }
        .input-container {
          position: relative;
        }
        .port-title {
          font-family: "Courier New", monospace;
          font-weight: 700;
          letter-spacing: 3px;
          text-shadow: 1px 1px 0px rgba(0, 60, 0, 0.8), 0 0 2px #002200,
            0 0 4px #001100, 2px 2px 0px #000;
          text-transform: uppercase;
        }
        .port-subtitle {
          font-family: "Courier New", monospace;
          font-weight: 600;
          letter-spacing: 2px;
          text-shadow: 1px 1px 0px rgba(0, 50, 0, 0.6), 0 0 2px #001100,
            1px 1px 0px #000;
          color: #ff4444;
        }
        .port-label {
          font-family: "Courier New", monospace;
          font-weight: 600;
          letter-spacing: 1px;
          text-shadow: 1px 1px 0px rgba(0, 40, 0, 0.8), 0 0 2px #001100;
        }
        .port-input {
          font-family: "Courier New", monospace;
          font-weight: 500;
          letter-spacing: 2px;
          text-shadow: 1px 1px 0px rgba(0, 60, 0, 0.8), 0 0 2px #002200,
            1px 1px 0px #000;
        }
        .port-button {
          font-family: "Courier New", monospace;
          font-weight: 700;
          letter-spacing: 2px;
          text-shadow: 1px 1px 0px rgba(0, 80, 0, 0.8), 0 0 3px #003300,
            2px 2px 0px #000;
        }
        .port-info {
          font-family: "Courier New", monospace;
          font-weight: 500;
          letter-spacing: 1px;
          text-shadow: 1px 1px 0px rgba(0, 40, 0, 0.6), 0 0 1px #001100,
            1px 1px 0px #000;
        }
        .port-terminal {
          font-family: "Courier New", monospace;
          font-weight: 600;
          letter-spacing: 1px;
          text-shadow: 1px 1px 0px rgba(0, 50, 0, 0.8), 0 0 2px #002200,
            1px 1px 0px #000;
        }
        .monitor-flicker {
          animation: monitor-flicker 1.5s infinite ease-in-out;
          position: relative;
          overflow: hidden;
        }
        .monitor-flicker::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(0, 255, 0, 0.1) 30%,
            rgba(0, 255, 0, 0.3) 50%,
            rgba(0, 255, 0, 0.1) 70%,
            transparent
          );
          animation: monitor-scan 3s infinite ease-in-out;
          pointer-events: none;
        }
        .monitor-flicker:focus {
          animation: monitor-focus-flicker 0.8s infinite ease-in-out;
        }
        .crt-button-main {
          position: relative;
          background: rgba(0, 20, 0, 0.3);
          text-shadow: 0 0 5px #00ff00, 0 0 10px #00aa00, 0 0 15px #008800;
          box-shadow: 0 0 10px rgba(0, 255, 0, 0.3),
            inset 0 0 10px rgba(0, 100, 0, 0.1);
        }
        .crt-button-main:hover {
          text-shadow: 0 0 8px #00ff00, 0 0 15px #00aa00, 0 0 25px #008800,
            0 0 35px #006600;
          box-shadow: 0 0 20px rgba(0, 255, 0, 0.5),
            0 0 30px rgba(0, 255, 0, 0.3), inset 0 0 15px rgba(0, 120, 0, 0.2);
          transform: scale(1.05);
        }
        .crt-input {
          text-shadow: 1px 1px 0px rgba(0, 60, 0, 0.8), 0 0 2px #002200;
          background: rgba(0, 10, 0, 0.5);
          border-style: solid;
          transition: all 0.3s ease;
        }
        .crt-input:focus {
          text-shadow: 1px 1px 0px rgba(0, 80, 0, 0.8), 0 0 3px #003300;
          box-shadow: inset 0 0 5px rgba(0, 60, 0, 0.4), 0 0 2px #003300,
            0 0 8px rgba(0, 255, 0, 0.3);
          border-color: #00aa00;
        }
        @keyframes monitor-flicker {
          0%,
          100% {
            border-color: #004400;
            background: rgba(0, 10, 0, 0.3);
            box-shadow: 0 0 5px rgba(0, 100, 0, 0.2),
              inset 0 0 10px rgba(0, 40, 0, 0.1);
          }
          25% {
            border-color: #006600;
            background: rgba(0, 15, 0, 0.4);
            box-shadow: 0 0 8px rgba(0, 150, 0, 0.3),
              inset 0 0 15px rgba(0, 60, 0, 0.2);
          }
          50% {
            border-color: #008800;
            background: rgba(0, 20, 0, 0.5);
            box-shadow: 0 0 12px rgba(0, 200, 0, 0.4),
              inset 0 0 20px rgba(0, 80, 0, 0.3);
          }
          75% {
            border-color: #006600;
            background: rgba(0, 15, 0, 0.4);
            box-shadow: 0 0 8px rgba(0, 150, 0, 0.3),
              inset 0 0 15px rgba(0, 60, 0, 0.2);
          }
        }
        @keyframes monitor-scan {
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
        @keyframes monitor-focus-flicker {
          0%,
          100% {
            box-shadow: inset 0 0 8px rgba(0, 80, 0, 0.6), 0 0 10px #005500,
              0 0 20px rgba(0, 255, 0, 0.4);
            border-color: #00aa00;
          }
          50% {
            box-shadow: inset 0 0 15px rgba(0, 120, 0, 0.8), 0 0 15px #007700,
              0 0 30px rgba(0, 255, 0, 0.6), 0 0 40px rgba(0, 255, 0, 0.3);
            border-color: #00cc00;
          }
        }
        .crt-button:hover {
          text-shadow: 1px 1px 0px rgba(0, 80, 0, 0.8), 0 0 3px #003300;
          box-shadow: inset 0 0 3px rgba(0, 60, 0, 0.3), 0 0 2px #002200;
        }
        .crt-cursor {
          animation: crt-cursor-blink 0.8s infinite;
        }
        .crt-flicker-slow {
          animation: crt-flicker-slow 4s infinite ease-in-out;
        }
        @keyframes hacker-typewriter {
          0% {
            opacity: 0;
            transform: translateX(-10px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
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
        @keyframes crt-flicker-slow {
          0%,
          100% {
            opacity: 0.7;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </main>
  );
}
