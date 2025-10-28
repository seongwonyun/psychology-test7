/**
 * HomePage Component - 모바일 최적화 버전
 *
 * 모바일 환경에서 올바른 작동을 위해 다음 viewport 메타태그가 필요합니다:
 * <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
 *
 * 주요 모바일 최적화:
 * - 동적 viewport height (100dvh) 사용
 * - iOS 안전 영역 (safe-area-inset) 고려
 * - 터치 최소 크기 (44px) 준수
 * - iOS zoom 방지 (font-size: 16px)
 * - 터치 피드백 및 네이티브 스타일 제거
 */

"use client";
import React, { useEffect, useState, KeyboardEvent, JSX, useMemo } from "react";
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

/** ─────────────────────────────────────────────────────────────
 * BootLogOverlay (현실 접속 준비 오버레이 + 타이핑 효과)
 * - 오버레이는 UI 위에 얹혀서 typewriter로 한 줄씩 출력
 * - 클릭/Enter로 즉시 스킵 가능
 * - 완료 후 자연스러운 페이드아웃
 * ────────────────────────────────────────────────────────────*/
function BootLogOverlay({
  onDone,
  duration = 3200, // 전체 자동 종료(최소치). 메시지 타이밍은 line.delay로 제어
}: {
  onDone: () => void;
  duration?: number;
}) {
  const [linesShown, setLinesShown] = useState<number>(0);
  const [finished, setFinished] = useState<boolean>(false);

  // 현실 접속 준비 메시지 (한국어 서사)
  const lines = useMemo(
    () => [
      { text: ">> 현실 접속 프로토콜 초기화 중...", delay: 300 },
      { text: ">> 의식 경계선 캘리브레이션 완료...", delay: 650 },
      { text: ">> 현실 인식 레이어 동기화 중...", delay: 1000 },
      { text: ">> 잠재의식 신호를 의식층으로 전송...", delay: 1400 },
      { text: ">> 자아 참조 루프 무결성 확인...", delay: 1750 },
      { text: ">> 현실 접속 준비 완료 - 식별자 입력 대기 중...", delay: 2100 },
      { text: "[ 완료 ] 현실 핸드셰이크 성공. 사용자 대기 중.", delay: 2500 },
    ],
    []
  );

  // 순차 출력
  useEffect(() => {
    let mounted = true;
    const timeouts: number[] = [];

    lines.forEach((_, i) => {
      const t = window.setTimeout(() => {
        if (!mounted) return;
        setLinesShown((n) => Math.min(n + 1, lines.length));
      }, lines[i].delay);
      timeouts.push(t);
    });

    // 자동 종료 시점 (duration 이후)
    const end = window.setTimeout(() => {
      if (!mounted) return;
      setFinished(true);
      // 페이드 아웃 시간 고려해 약간 뒤에 onDone
      window.setTimeout(onDone, 350);
    }, Math.max(duration, lines[lines.length - 1].delay + 250));

    return () => {
      mounted = false;
      timeouts.forEach((id) => window.clearTimeout(id));
      window.clearTimeout(end);
    };
  }, [lines, duration, onDone]);

  // 스킵: 클릭/Enter
  useEffect(() => {
    const onKey = (e: KeyboardEvent | any) => {
      if (e.key === "Enter") {
        setFinished(true);
        setTimeout(onDone, 150);
      }
    };
    window.addEventListener("keydown", onKey as any);
    return () => window.removeEventListener("keydown", onKey as any);
  }, [onDone]);

  return (
    <div
      className={`bootlog-overlay ${finished ? "bootlog-hide" : ""}`}
      onClick={() => {
        setFinished(true);
        setTimeout(onDone, 150);
      }}
      role="presentation"
    >
      <div className="bootlog-panel">
        {lines.slice(0, linesShown).map((l, idx) => (
          <div className="bootlog-line" key={idx}>
            <span className="bootlog-caret">▸</span> {l.text}
          </div>
        ))}
        {linesShown < lines.length && <div className="bootlog-cursor">█</div>}
        <div className="bootlog-hint">ENTER 키 또는 클릭하여 건너뛰기</div>
      </div>
      <style jsx>{`
        .bootlog-overlay {
          position: fixed;
          inset: 0;
          z-index: 50; /* 최상단 (기존 오버레이 위) */
          display: grid;
          place-items: center;
          background: radial-gradient(
            ellipse at center,
            rgba(0, 15, 8, 0.7),
            rgba(0, 0, 0, 0.85)
          ); /* 투명도 조정 */
          backdrop-filter: blur(3px); /* 블러 조정 */
          transition: opacity 220ms ease;
        }
        .bootlog-hide {
          opacity: 0;
          pointer-events: none;
        }
        .bootlog-panel {
          width: min(90vw, 720px);
          max-height: 70vh;
          overflow: hidden;
          border: 2px solid rgba(0, 255, 140, 0.4); /* 테두리 강화 */
          background: rgba(0, 12, 6, 0.6); /* 배경 투명도 조정 */
          box-shadow: 0 0 30px rgba(0, 255, 120, 0.2),
            inset 0 0 30px rgba(0, 60, 30, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.6); /* 그림자 강도 조정 */
          padding: 18px 20px;
          border-radius: 8px;
        }
        .bootlog-line {
          font-family: "Courier New", ui-monospace, SFMono-Regular, Menlo,
            monospace;
          font-size: 12px;
          line-height: 1.6;
          color: #bbffdd;
          text-shadow: 0 0 3px #00ffaa, 0 0 8px #00ff88,
            0 0 20px rgba(0, 255, 100, 0.6), 2px 2px 2px #000000,
            /* 검정 아웃라인 강화 */ -1px -1px 1px #000000, 1px -1px 1px #000000,
            -1px 1px 1px #000000;
          white-space: pre-wrap;
          word-break: break-word;
          animation: bootlog-pop 220ms ease-out;
          font-weight: 600; /* 글자 두께 증가 */
        }
        .bootlog-caret {
          margin-right: 8px;
          color: #a7ffd8;
          text-shadow: 0 0 8px rgba(0, 255, 160, 0.7), 2px 2px 2px #000000,
            -1px -1px 1px #000000;
        }
        .bootlog-cursor {
          margin-top: 4px;
          font-family: inherit;
          color: #a7ffd8;
          animation: cursor-blink 0.9s steps(2) infinite;
          opacity: 0.9;
          text-shadow: 0 0 8px rgba(0, 255, 160, 0.7), 2px 2px 2px #000000;
        }
        .bootlog-hint {
          margin-top: 8px;
          font-size: 10px;
          opacity: 0.8;
          color: #bbffdd;
          text-align: right;
          text-shadow: 0 0 3px #00ffaa, 1px 1px 1px #000000;
        }
        @keyframes cursor-blink {
          0%,
          50% {
            opacity: 0;
          }
          51%,
          100% {
            opacity: 0.9;
          }
        }
        @keyframes bootlog-pop {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (min-width: 768px) {
          .bootlog-line {
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
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

  const [showBoot, setShowBoot] = useState<boolean>(true); // T2 overlay boot log

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toTimeString().split(" ")[0] ?? "");
      setCurrentDate(now.toISOString().split("T")[0] ?? "");
    };

    const getSystemInfo = () => {
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

    // reset first
    const resetAll = () => {
      if (typeof window !== "undefined") {
        sessionStorage.clear();
        localStorage.clear();
      }
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

  if (stage === "initial") {
    return (
      <main className="crt-screen min-h-screen min-h-[100dvh] relative overflow-hidden flex items-center justify-center">
        {/* MatrixRain Background with enhanced blur */}
        <div className="bg-layer">
          <MatrixRain />
        </div>

        {/* Enhanced overlays for better separation */}
        <div className="crt-overlay"></div>
        <div className="scanlines"></div>
        <div className="crt-flicker"></div>

        {/* Content with better background separation and mobile optimization */}
        <section className="crt-content">
          {/* ASCII Art */}
          <div className="hacker-ascii mb-6 crt-text-strong">
            <div className="ascii-line">
              ██╗ ██╗ ██████╗ ██╗██████╗ ███████╗██╗███╗ ███╗
            </div>
            <div className="ascii-line">
              ██║ ██║██╔═══██╗██║██╔══██╗ ██╔════╝██║████╗ ████║
            </div>
            <div className="ascii-line">
              ██║ ██║██║ ██║██║██║ ██║ ███████╗██║██╔████╔██║
            </div>
            <div className="ascii-line">
              ╚██╗ ██╔╝██║ ██║██║██║ ██║ ╚════██║██║██║╚██╔╝██║
            </div>
            <div className="ascii-line">
              {" "}
              ╚████╔╝ ╚██████╔╝██║██████╔╝ ███████║██║██║ ╚═╝ ██║
            </div>
            <div className="ascii-line">
              {" "}
              ╚═══╝ ╚═════╝ ╚═╝╚═════╝ ╚══════╝╚═╝╚═╝ ╚═╝
            </div>
          </div>

          {/* Info Lines */}
          <div className="space-y-2 mb-6">
            <div className="hacker-line delay-100 crt-text-strong">
              [ establishing connection to reality... ]
            </div>
            <div className="hacker-line delay-200 crt-text-strong">
              [ connectioning to reality... ]
            </div>
            <div className="hacker-line delay-300 dim-note">
              consciousness.exe : initializing user terminal...
            </div>
          </div>

          {/* Enhanced input panel */}
          <div className="enhanced-input-panel mb-6 space-y-4 w-full">
            <div className="port-title crt-text-strong">
              접속 터미널이 열였습니다.
            </div>
            <div className="port-subtitle dim-note">
              reality terminal v0.01.1
            </div>

            <div className="space-y-2">
              <label className="port-label crt-text-strong">
                닉네임을 입력해주세요
              </label>
              <input
                className="port-input crt-text-strong w-full px-4 py-3"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="닉네임을_입력하세요..."
                autoFocus
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
              />
            </div>

            <button
              className={`port-button w-full px-6 py-3 transition-all duration-300 ${
                nickname.trim()
                  ? "btn-active crt-text-glow-hover crt-text-strong"
                  : "btn-disabled"
              }`}
              onClick={start}
              disabled={!nickname.trim()}
            >
              {nickname.trim() ? "[연결하기]" : "[입력_대기_중]"}
            </button>
          </div>

          {/* Enhanced system info */}
          <div className="system-info-grid mb-4 w-full">
            <div className="port-info dim-note">
              브라우저: {systemInfo.userAgent} | 플랫폼: {systemInfo.platform}
            </div>
            <div className="port-info dim-note">
              언어: {systemInfo.language} | 시간대: {systemInfo.timezone}
            </div>
            <div className="port-info dim-note">
              화면: {systemInfo.screenRes} | 날짜: {currentDate}
            </div>
          </div>

          {/* Terminal prompt */}
          <div className="port-terminal crt-text-strong crt-flicker-slow">
            사용자@현실:{currentTime}$ <span className="crt-cursor">█</span>
          </div>
        </section>

        {/* 현실 접속 준비 오버레이 */}
        {showBoot && <BootLogOverlay onDone={() => setShowBoot(false)} />}

        <style jsx>{`
          /* ─────────────── G1: Enhanced Sharp Neon with better contrast ─────────────── */
          .crt-text-strong {
            color: #bbffdd !important; /* 본체 텍스트 색 (식별 핵심) */
            text-shadow: 0 0 3px #00ffaa, 0 0 8px #00ff88,
              0 0 20px rgba(0, 255, 100, 0.6), 2px 2px 3px #000000,
              /* 강화된 검정 아웃라인 */ -2px -2px 2px #000000,
              2px -2px 2px #000000, -2px 2px 2px #000000;
            font-weight: 600; /* 글자 두께 증가 */
          }
          .crt-text-glow-hover:hover,
          .crt-text-glow-hover:focus {
            text-shadow: 0 0 4px #00ffaa, 0 0 12px #00ff88,
              0 0 25px rgba(0, 255, 120, 0.7), 2px 2px 3px #000000,
              -2px -2px 2px #000000, 2px -2px 2px #000000, -2px 2px 2px #000000;
          }
          .dim-note {
            color: #a7ffd8;
            opacity: 0.9;
            text-shadow: 0 0 2px #00ffaa, 0 0 6px #00ff88, 1px 1px 2px #000000,
              -1px -1px 1px #000000;
          }

          /* ─────────────── Balanced Blur: MatrixRain 배경 적당한 블러 ─────────────── */
          .bg-layer {
            position: fixed;
            inset: 0;
            z-index: 0;
            filter: blur(1.5px) contrast(0.9) brightness(0.85); /* 블러 줄이고 밝기 증가 */
          }

          /* ─────────────── Enhanced Screen + Overlays ─────────────── */
          .crt-screen {
            background: radial-gradient(
              ellipse at center,
              #000a00 0%,
              #000400 70%,
              #000000 100%
            );
            padding-top: env(safe-area-inset-top, 0);
            padding-bottom: env(safe-area-inset-bottom, 0);
            padding-left: env(safe-area-inset-left, 0);
            padding-right: env(safe-area-inset-right, 0);
            color: #bbffdd;
          }
          .crt-overlay {
            position: fixed;
            inset: 0;
            background: radial-gradient(
              ellipse at center,
              rgba(0, 0, 0, 0.1) 0%,
              rgba(0, 0, 0, 0.4) 100% /* 오버레이 강도 줄임 */
            );
            pointer-events: none;
            z-index: 1;
          }
          .scanlines {
            position: fixed;
            inset: 0;
            background: repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(0, 255, 0, 0.03) 2px,
              rgba(0, 255, 0, 0.03) 4px
            );
            pointer-events: none;
            z-index: 2;
          }
          .crt-flicker {
            position: fixed;
            inset: 0;
            opacity: 0.99;
            animation: crt-flicker 8s infinite;
            pointer-events: none;
            z-index: 3;
          }
          .crt-content {
            max-width: 90vw;
            padding: 20px;
            position: relative;
            z-index: 4;
            width: 100%;
            min-height: 100vh;
            min-height: 100dvh; /* 동적 viewport height for mobile */
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
          }

          /* ─────────────── Enhanced Input Panel ─────────────── */
          .enhanced-input-panel {
            background: rgba(0, 12, 6, 0.6); /* 배경 투명도 조정 */
            border: 2px solid rgba(0, 255, 140, 0.4);
            border-radius: 8px;
            padding: 24px;
            box-shadow: 0 0 30px rgba(0, 255, 120, 0.15),
              inset 0 0 30px rgba(0, 60, 30, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.6); /* 그림자 강도 조정 */
            backdrop-filter: blur(6px); /* 블러 조정 */
          }

          /* ─────────────── Enhanced Typographic Blocks ─────────────── */
          .hacker-ascii {
            line-height: 1.2;
          }
          .ascii-line {
            font-size: 10px;
            opacity: 0;
            animation: hacker-typewriter 0.5s ease-out forwards;
            white-space: nowrap;
            overflow: hidden;
            font-weight: 600; /* 글자 두께 증가 */
          }
          .ascii-line:nth-child(1) {
            animation-delay: 0s;
          }
          .ascii-line:nth-child(2) {
            animation-delay: 0.1s;
          }
          .ascii-line:nth-child(3) {
            animation-delay: 0.2s;
          }
          .ascii-line:nth-child(4) {
            animation-delay: 0.3s;
          }

          .hacker-line {
            opacity: 0;
            animation: hacker-typewriter 0.5s ease-out forwards;
            font-size: 11px;
            word-break: break-all;
            line-height: 1.4;
            font-weight: 600; /* 글자 두께 증가 */
          }
          .delay-100 {
            animation-delay: 0.4s;
          }
          .delay-200 {
            animation-delay: 0.5s;
          }
          .delay-300 {
            animation-delay: 0.6s;
          }

          .port-title {
            font-family: "Courier New", monospace;
            font-weight: 700;
            letter-spacing: 1px;
            font-size: 14px;
            line-height: 1.3;
          }
          .port-subtitle {
            font-family: "Courier New", monospace;
            font-weight: 600;
            letter-spacing: 1px;
            font-size: 11px;
            line-height: 1.3;
          }
          .port-label {
            font-family: "Courier New", monospace;
            font-weight: 600;
            letter-spacing: 1px;
            font-size: 12px;
          }
          .port-input {
            font-family: "Courier New", monospace;
            font-weight: 600; /* 글자 두께 증가 */
            letter-spacing: 1px;
            font-size: 14px;
            border-radius: 4px;
            min-height: 48px;
            background: rgba(0, 10, 0, 0.8); /* 배경 강화 */
            transition: all 0.3s ease;
            border: 2px solid rgba(0, 255, 140, 0.5); /* 테두리 강화 */
            box-shadow: inset 0 0 20px rgba(0, 60, 30, 0.3),
              0 0 0 1px rgba(0, 0, 0, 0.8);
          }
          .port-input::placeholder {
            color: rgba(187, 255, 221, 0.55);
            text-shadow: none;
          }
          .port-input:focus {
            border-color: rgba(0, 255, 140, 0.8);
            box-shadow: 0 0 20px rgba(0, 255, 140, 0.3),
              inset 0 0 20px rgba(0, 60, 30, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.8);
          }
          .port-button {
            font-family: "Courier New", monospace;
            font-weight: 700;
            letter-spacing: 1px;
            font-size: 14px;
            border-radius: 4px;
            min-height: 48px;
          }
          .btn-disabled {
            border: 2px solid rgba(0, 120, 60, 0.4);
            color: rgba(187, 255, 221, 0.25);
            cursor: not-allowed;
            background: rgba(0, 10, 0, 0.3);
          }
          .btn-active {
            border: 2px solid rgba(0, 255, 140, 0.7); /* 테두리 강화 */
            color: #bbffdd;
            background: rgba(0, 20, 10, 0.6); /* 배경 강화 */
            box-shadow: 0 0 20px rgba(0, 255, 140, 0.3),
              inset 0 0 20px rgba(0, 90, 60, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.8);
          }

          .system-info-grid {
            display: flex;
            flex-direction: column;
            gap: 4px;
            align-items: center;
            background: rgba(0, 12, 6, 0.4); /* 배경 투명도 증가 */
            border: 1px solid rgba(0, 255, 140, 0.2);
            border-radius: 4px;
            padding: 12px;
            backdrop-filter: blur(3px); /* 블러 조정 */
          }
          .port-info {
            font-family: "Courier New", monospace;
            font-weight: 600; /* 글자 두께 증가 */
            letter-spacing: 1px;
            font-size: 9px;
            word-break: break-all;
            text-align: center;
          }
          .port-terminal {
            font-family: "Courier New", monospace;
            font-weight: 600;
            letter-spacing: 1px;
            font-size: 11px;
            word-break: break-all;
            background: rgba(0, 12, 6, 0.4); /* 배경 투명도 증가 */
            border: 1px solid rgba(0, 255, 140, 0.2);
            border-radius: 4px;
            padding: 8px 12px;
            backdrop-filter: blur(3px); /* 블러 조정 */
          }

          /* CRT flickers & cursors */
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

          /* ─────────────── Mobile-First Responsive Tweaks ─────────────── */

          /* 모바일 기본 스타일 */
          @media (max-width: 767px) {
            .crt-content {
              padding: max(16px, env(safe-area-inset-top, 0)) 16px
                max(16px, env(safe-area-inset-bottom, 0));
              max-width: 95vw;
              gap: 1rem;
            }
            .enhanced-input-panel {
              padding: 20px 16px;
              margin: 0 auto;
              width: 100%;
              max-width: 350px;
            }
            .ascii-line {
              font-size: 8px;
              line-height: 1.1;
            }
            .hacker-line {
              font-size: 10px;
              line-height: 1.3;
            }
            .port-title {
              font-size: 16px;
              letter-spacing: 1px;
            }
            .port-subtitle {
              font-size: 12px;
              letter-spacing: 1px;
            }
            .port-label {
              font-size: 13px;
            }
            .port-input {
              font-size: 16px; /* iOS zoom 방지 */
              letter-spacing: 1px;
              padding: 12px;
              min-height: 44px; /* iOS 터치 최소 크기 */
              -webkit-appearance: none; /* iOS 기본 스타일 제거 */
              -webkit-border-radius: 4px; /* iOS border radius 고정 */
            }
            .port-button {
              font-size: 16px;
              letter-spacing: 1px;
              width: 100%;
              min-height: 44px; /* iOS 터치 최소 크기 */
              -webkit-appearance: none; /* iOS 기본 스타일 제거 */
              cursor: pointer;
            }
            .port-button:active {
              transform: scale(0.98); /* 터치 피드백 */
            }
            .system-info-grid {
              flex-direction: column;
              gap: 8px;
              padding: 8px;
              width: 100%;
              max-width: 350px;
              margin: 0 auto;
            }
            .port-info {
              font-size: 9px;
              text-align: center;
              word-break: break-word;
            }
            .port-terminal {
              font-size: 12px;
              padding: 6px 10px;
              max-width: 350px;
              margin: 0 auto;
              word-break: break-all;
            }
            .bootlog-panel {
              width: min(95vw, 350px);
              padding: 16px;
              margin: 16px;
            }
            .bootlog-line {
              font-size: 11px;
              line-height: 1.4;
            }

            /* 모바일 키보드 대응 */
            .crt-content {
              padding-bottom: env(keyboard-inset-height, 0);
            }
          }

          /* 터치 디바이스 최적화 */
          @media (hover: none) and (pointer: coarse) {
            .port-button:hover {
              /* 터치 디바이스에서는 hover 효과 제거 */
              text-shadow: inherit;
            }
            .crt-text-glow-hover:hover {
              text-shadow: inherit;
            }
          }

          @media (min-width: 768px) {
            .crt-content {
              max-width: 4xl;
              padding: 40px;
            }
            .ascii-line {
              font-size: 12px;
            }
            .hacker-line {
              font-size: 14px;
            }
            .port-title {
              font-size: 20px;
              letter-spacing: 2px;
            }
            .port-subtitle {
              font-size: 14px;
              letter-spacing: 2px;
            }
            .port-label {
              font-size: 14px;
            }
            .port-input {
              font-size: 16px;
              letter-spacing: 2px;
            }
            .port-button {
              font-size: 16px;
              letter-spacing: 2px;
              width: auto;
              min-width: 200px;
            }
            .system-info-grid {
              flex-direction: row;
              justify-content: space-between;
              gap: 20px;
            }
            .port-info {
              font-size: 11px;
              text-align: left;
            }
            .port-terminal {
              font-size: 14px;
            }
          }
          @media (min-width: 1024px) {
            .port-title {
              font-size: 24px;
              letter-spacing: 3px;
            }
            .port-subtitle {
              font-size: 16px;
            }
            .port-input {
              font-size: 18px;
            }
            .port-button {
              font-size: 18px;
            }
            .ascii-line {
              font-size: 14px;
            }
            .hacker-line {
              font-size: 16px;
            }
            .port-info {
              font-size: 12px;
            }
          }

          /* High contrast / reduce motion */
          @media (prefers-contrast: high) {
            .crt-screen {
              background: #000;
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
        `}</style>
      </main>
    );
  }

  return <div>Loading next stage...</div>;
}
