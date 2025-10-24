// "use client";

// import { useEffect, useRef } from "react";

// type MatrixRainProps = {
//   /** 기본 16px */
//   fontSize?: number;
//   /** 기본 "#00ff88" */
//   color?: string;
//   /** 캔버스 전체 오버레이 투명도 (Tailwind class로도 조절 가능). 기본 1 */
//   opacity?: number;
//   /** 프레임 제한(FPS). 기본 무제한 */
//   fps?: number;
//   /** 잔상(트레일) 강도. 0(지우기) ~ 1(잔상 유지). 기본 0.08 */
//   trail?: number;
//   /** 커스텀 문자 집합 */
//   charset?: string;
//   /** 추가 스타일 클래스 */
//   className?: string;
// };

// export default function MatrixRain({
//   fontSize = 16,
//   color = "#00ff88",
//   opacity = 1,
//   fps,
//   trail = 0.08,
//   charset = "アイウエオカキクケコABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
//   className = "fixed inset-0 -z-10 pointer-events-none",
// }: MatrixRainProps) {
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);
//   const rafId = useRef<number | null>(null);
//   const lastFrameTime = useRef<number>(0);

//   // 렌더링 상태 (열 수, 각 열의 y 위치 등)
//   const state = useRef<{
//     cols: number;
//     y: number[];
//     fontSize: number;
//     letters: string[];
//   }>({
//     cols: 0,
//     y: [],
//     fontSize,
//     letters: charset.split(""),
//   });

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     const ctx = canvas.getContext("2d");
//     if (!ctx) return;

//     // 고해상도(DPR) 스케일링 + 폰트 설정
//     const applyResize = () => {
//       const dpr = Math.max(1, window.devicePixelRatio || 1);
//       const cssW = window.innerWidth;
//       const cssH = window.innerHeight;

//       // 캔버스 내부 픽셀 크기
//       canvas.width = Math.floor(cssW * dpr);
//       canvas.height = Math.floor(cssH * dpr);

//       // CSS 픽셀 크기(스타일) — Tailwind로 이미 맞추지만 안전하게 지정
//       canvas.style.width = `${cssW}px`;
//       canvas.style.height = `${cssH}px`;

//       // 스케일 재설정
//       ctx.setTransform(1, 0, 0, 1, 0, 0);
//       ctx.scale(dpr, dpr);

//       // 상태 업데이트
//       state.current.fontSize = fontSize;
//       const cols = Math.ceil(cssW / state.current.fontSize);
//       state.current.cols = cols;

//       // 각 컬럼의 시작 y를 약간 랜덤한 음수로 시작 → 자연스러운 등장
//       state.current.y = Array.from({ length: cols }, () => Math.random() * -50);

//       // 폰트 지정
//       ctx.font = `${state.current.fontSize}px monospace`;
//     };

//     // 리사이즈 핸들러(부하 감소를 위해 rAF로 스로틀)
//     let resizeRaf: number | null = null;
//     const onResize = () => {
//       if (resizeRaf != null) return;
//       resizeRaf = requestAnimationFrame(() => {
//         applyResize();
//         resizeRaf = null;
//       });
//     };

//     applyResize();
//     window.addEventListener("resize", onResize);

//     const draw = (time: number) => {
//       // FPS 제한 (옵션)
//       if (fps && fps > 0) {
//         const frameInterval = 1000 / fps;
//         if (time - lastFrameTime.current < frameInterval) {
//           rafId.current = requestAnimationFrame(draw);
//           return;
//         }
//         lastFrameTime.current = time;
//       }

//       const { cols, y, fontSize: fs, letters } = state.current;
//       const cssW = window.innerWidth;
//       const cssH = window.innerHeight;

//       // 배경을 살짝 덮어 잔상을 남김
//       ctx.fillStyle = `rgba(0,0,0,${Math.max(0, Math.min(1, trail))})`;
//       ctx.fillRect(0, 0, cssW, cssH);

//       // 드로잉 색상
//       ctx.fillStyle = color;

//       // 글자 드롭
//       for (let i = 0; i < cols; i++) {
//         const ch = letters[Math.floor(Math.random() * letters.length)];
//         const x = i * fs;
//         const yPos = y[i] * fs;

//         ctx.fillText(ch, x, yPos);

//         // 화면 하단을 벗어나면 낮은 확률로 리셋
//         if (yPos > cssH && Math.random() > 0.975) {
//           y[i] = 0;
//         }
//         y[i]++;
//       }

//       rafId.current = requestAnimationFrame(draw);
//     };

//     rafId.current = requestAnimationFrame(draw);

//     return () => {
//       if (rafId.current != null) cancelAnimationFrame(rafId.current);
//       if (resizeRaf != null) cancelAnimationFrame(resizeRaf);
//       window.removeEventListener("resize", onResize);
//     };
//   }, [fontSize, color, fps, trail, charset]);

//   return (
//     <canvas
//       ref={canvasRef}
//       className={className}
//       style={{ opacity }}
//       aria-hidden="true"
//     />
//   );
// }

// "use client";
// import { useEffect, useRef } from "react";

// export default function MatrixRain() {
//   const canvasRef = useRef(null);
//   const rafId = useRef(null);
//   const state = useRef({ cols: 0, y: [], fontSize: 3 });

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");

//     function resize() {
//       const dpr = window.devicePixelRatio || 1;
//       canvas.width = Math.floor(window.innerWidth * dpr);
//       canvas.height = Math.floor(window.innerHeight * dpr);
//       ctx.scale(dpr, dpr);
//       state.current.fontSize = 16;
//       const cols = Math.ceil(window.innerWidth / state.current.fontSize);
//       state.current.cols = cols;
//       state.current.y = Array.from({ length: cols }, () => Math.random() * -50);
//       ctx.font = `${state.current.fontSize}px monospace`;
//     }

//     function draw() {
//       const { cols, y, fontSize } = state.current;
//       const w = window.innerWidth;
//       const h = window.innerHeight;

//       ctx.fillStyle = "rgba(0,0,0,0.08)";
//       ctx.fillRect(0, 0, w, h);

//       ctx.fillStyle = "#00ff00";
//       for (let i = 0; i < cols; i++) {
//         const char = String.fromCharCode(0x30a0 + Math.random() * 96);
//         const x = i * fontSize;
//         const yPos = y[i] * fontSize;
//         ctx.fillText(char, x, yPos);
//         if (yPos > h && Math.random() > 0.975) y[i] = 0;
//         y[i]++;
//       }
//       rafId.current = requestAnimationFrame(draw);
//     }

//     resize();
//     window.addEventListener("resize", resize);
//     rafId.current = requestAnimationFrame(draw);
//     return () => {
//       cancelAnimationFrame(rafId.current);
//       window.removeEventListener("resize", resize);
//     };
//   }, []);

//   return (
//     <canvas
//       ref={canvasRef}
//       className="fixed inset-0 z-0 opacity-40 pointer-events-none"
//     />
//   );
// }

"use client";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";

type Intensity = "low" | "medium" | "high";

export type MatrixRainProps = {
  intensity?: Intensity; // "low", "medium", "high"
  showScanlines?: boolean;
  showVignette?: boolean;
  showPixelEffect?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

type Drop = {
  y: number; // 행 단위 위치(폰트 크기 기준)
  speed: number;
  brightness: number;
  glitch: boolean;
  lastChar: string;
  charType: number; // 0~1 사이 난수로 문자군 선택
  resetTimer: number;
  trailLength: number;
  active: boolean;
};

type TrailItem = {
  char: string;
  y: number; // px 단위 y좌표
  brightness: number;
  glitch: boolean;
};

type InternalState = {
  cols: number;
  drops: Drop[];
  fontSize: number;
  trails: TrailItem[][];
  glitchTimer: number;
  scanlineOffset: number;
  isMobile: boolean;
  lastResize: number;
};

type CharacterSets = {
  consonants: string;
  vowels: string;
  katakana: string;
  english: string;
  numbers: string;
  symbols: string;
};

type IntensityConfigItem = {
  fontSize: number;
  spacing: number;
  speed: [number, number];
  density: number;
};

type IntensityConfig = Record<Intensity, IntensityConfigItem>;

export default function MatrixRain({
  intensity = "high",
  showScanlines = true,
  showVignette = true,
  showPixelEffect = true,
  className = "",
  style = {},
}: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafId = useRef<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [screenSize, setScreenSize] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });

  const state = useRef<InternalState>({
    cols: 0,
    drops: [],
    fontSize: 16,
    trails: [],
    glitchTimer: 0,
    scanlineOffset: 0,
    isMobile: false,
    lastResize: 0,
  });

  // 문자 세트
  const characters = useMemo<CharacterSets>(
    () => ({
      consonants: "ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎㄲㄸㅃㅆㅉ",
      vowels: "ㅏㅑㅓㅕㅗㅛㅜㅠㅡㅣㅐㅒㅔㅖㅘㅙㅚㅝㅞㅟㅢ",
      katakana:
        "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン",
      english: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      numbers: "0123456789",
      symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
    }),
    []
  );

  // 강도별 설정
  const intensityConfig = useMemo<IntensityConfig>(
    () => ({
      low: {
        fontSize: state.current.isMobile ? 16 : 18,
        spacing: 1.0,
        speed: [0.2, 1.0],
        density: 0.5,
      },
      medium: {
        fontSize: state.current.isMobile ? 12 : 14,
        spacing: 0.8,
        speed: [0.4, 2.0],
        density: 0.7,
      },
      high: {
        fontSize: state.current.isMobile ? 7 : 11,
        spacing: 0.7,
        speed: [0.5, 3.0],
        density: 0.8,
      },
    }),
    []
  );

  // 랜덤 문자 생성
  const getRandomChar = useCallback(
    (charType: number): string => {
      if (charType < 0.35) {
        // 35%: 한글(자음/모음)
        if (Math.random() < 0.6) {
          const i = Math.floor(Math.random() * characters.consonants.length);
          return characters.consonants[i] ?? "";
        } else {
          const i = Math.floor(Math.random() * characters.vowels.length);
          return characters.vowels[i] ?? "";
        }
      } else if (charType < 0.6) {
        // 25%: 카타카나
        const i = Math.floor(Math.random() * characters.katakana.length);
        return characters.katakana[i] ?? "";
      } else if (charType < 0.8) {
        // 20%: 영문
        const i = Math.floor(Math.random() * characters.english.length);
        return characters.english[i] ?? "";
      } else if (charType < 0.93) {
        // 13%: 숫자
        const i = Math.floor(Math.random() * characters.numbers.length);
        return characters.numbers[i] ?? "";
      } else {
        // 7%: 기호
        const i = Math.floor(Math.random() * characters.symbols.length);
        return characters.symbols[i] ?? "";
      }
    },
    [characters]
  );

  // 화면 크기 감지
  const updateScreenSize = useCallback(() => {
    if (typeof window !== "undefined") {
      const isMobile = window.innerWidth <= 768;
      const scaleFactor = isMobile ? 0.8 : 1;
      setScreenSize({
        width: Math.max(0, Math.floor(window.innerWidth * scaleFactor)),
        height: Math.max(0, Math.floor(window.innerHeight * scaleFactor)),
      });
    }
  }, []);

  // Window resize 이벤트
  useEffect(() => {
    if (typeof window === "undefined") return;

    updateScreenSize();

    const handleResize = () => {
      updateScreenSize();
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, [updateScreenSize]);

  // 캔버스 설정
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || screenSize.width === 0 || screenSize.height === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = (typeof window !== "undefined" && window.devicePixelRatio) || 1;
    const isMobile =
      typeof window !== "undefined" ? window.innerWidth <= 768 : false;

    // 모바일 성능 고려
    const effectiveDpr = isMobile ? Math.min(dpr, 2) : dpr;

    // 전체 화면 크기 기준 설정
    const winW =
      typeof window !== "undefined" ? window.innerWidth : screenSize.width;
    const winH =
      typeof window !== "undefined" ? window.innerHeight : screenSize.height;

    canvas.width = Math.floor(winW * effectiveDpr);
    canvas.height = Math.floor(winH * effectiveDpr);
    canvas.style.width = `${winW}px`;
    canvas.style.height = `${winH}px`;

    ctx.setTransform(1, 0, 0, 1, 0, 0); // 리셋
    ctx.scale(effectiveDpr, effectiveDpr);

    state.current.isMobile = isMobile;

    const config = intensityConfig[intensity];
    state.current.fontSize = config.fontSize;

    const cols = Math.ceil(
      screenSize.width / (state.current.fontSize * config.spacing)
    );
    state.current.cols = cols;

    // drops/trails 재사용
    const existingDropsLength = state.current.drops.length;

    if (existingDropsLength !== cols) {
      if (existingDropsLength < cols) {
        for (let i = existingDropsLength; i < cols; i++) {
          state.current.drops.push({
            y: Math.random() * -300,
            speed:
              config.speed[0] +
              Math.random() * (config.speed[1] - config.speed[0]),
            brightness: 0.3 + Math.random() * 0.7,
            glitch: false,
            lastChar: "",
            charType: Math.random(),
            resetTimer: Math.random() * 50,
            trailLength: 15 + Math.random() * 25,
            active: Math.random() > 1 - config.density,
          });
          state.current.trails.push([]);
        }
      } else {
        state.current.drops.splice(cols);
        state.current.trails.splice(cols);
      }
    }

    // 폰트 설정
    ctx.font = `${state.current.fontSize}px "D2Coding","Malgun Gothic","Noto Sans KR","Courier New",monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    state.current.lastResize = Date.now();
  }, [screenSize, intensity, intensityConfig]);

  // 텍스트 그리기
  const drawText = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      text: string,
      x: number,
      y: number,
      color: string,
      hasGlow = false
    ) => {
      if (hasGlow) {
        const time = Date.now() * 0.001;
        const glowVariation = 0.8 + Math.sin(time * 2 + x * 0.01) * 0.2;

        ctx.shadowColor = color;
        ctx.shadowBlur = (state.current.isMobile ? 2 : 4) * glowVariation;

        ctx.fillStyle = color;
        ctx.fillText(text, x, y);

        if (!state.current.isMobile) {
          ctx.shadowBlur = 8 * glowVariation;
          ctx.shadowColor = "rgba(0, 255, 0, 0.3)";
          ctx.fillText(text, x, y);

          if (Math.random() > 0.8) {
            ctx.shadowBlur = 0;
            ctx.fillStyle = "rgba(255, 100, 100, 0.1)";
            ctx.fillText(text, x - 0.2, y);
            ctx.fillStyle = "rgba(100, 100, 255, 0.1)";
            ctx.fillText(text, x + 0.2, y);
          }
        }

        ctx.shadowBlur = 0;
        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
      } else {
        if (!state.current.isMobile && Math.random() > 0.97) {
          ctx.shadowColor = "rgba(0, 255, 0, 0.2)";
          ctx.shadowBlur = 1;
          ctx.fillStyle = "rgba(100, 255, 100, 0.08)";
          ctx.fillText(text, x - 0.1, y);
          ctx.fillText(text, x + 0.1, y);
          ctx.shadowBlur = 0;
        }

        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
      }
    },
    []
  );

  // 스캔라인
  const drawScanlines = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (!showScanlines) return;

      const h =
        typeof window !== "undefined" ? window.innerHeight : screenSize.height;
      const w =
        typeof window !== "undefined" ? window.innerWidth : screenSize.width;

      ctx.globalCompositeOperation = "multiply";
      if (state.current.isMobile) {
        for (let i = 0; i < h; i += 8) {
          const alpha = 0.003;
          ctx.fillStyle = `rgba(0, 255, 100, ${alpha})`;
          ctx.fillRect(0, i, w, 1);
        }
      } else {
        for (let i = 0; i < h; i += 6) {
          const offset = (i + state.current.scanlineOffset) % 12;
          const alpha = 0.005 + Math.sin(offset * 0.2) * 0.002;
          ctx.fillStyle = `rgba(0, 255, 100, ${alpha})`;
          ctx.fillRect(0, i, w, 1);
        }
      }
      ctx.globalCompositeOperation = "source-over";

      state.current.scanlineOffset += state.current.isMobile ? 0.4 : 0.8;
    },
    [showScanlines, screenSize.height, screenSize.width]
  );

  // CRT 효과
  const drawCRTEffect = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const w =
        typeof window !== "undefined" ? window.innerWidth : screenSize.width;
      const h =
        typeof window !== "undefined" ? window.innerHeight : screenSize.height;

      const time = Date.now() * 0.001;
      const phosphorIntensity =
        0.5 + Math.sin(time * 0.5) * 0.3 + Math.sin(time * 1.3) * 0.2;

      if (!state.current.isMobile) {
        ctx.globalCompositeOperation = "screen";
        ctx.fillStyle = `rgba(0, ${Math.floor(
          40 + phosphorIntensity * 30
        )}, 0, 0.015)`;
        ctx.fillRect(0, 0, w, h);
        ctx.globalCompositeOperation = "source-over";
      }

      const centerGradient = ctx.createRadialGradient(
        w / 2,
        h / 2,
        0,
        w / 2,
        h / 2,
        Math.max(w, h) * 0.6
      );
      centerGradient.addColorStop(0, "rgba(0, 25, 12, 0.03)");
      centerGradient.addColorStop(0.4, "rgba(0, 20, 10, 0.02)");
      centerGradient.addColorStop(0.7, "rgba(0, 15, 8, 0.015)");
      centerGradient.addColorStop(1, "rgba(0, 10, 5, 0.01)");

      ctx.fillStyle = centerGradient;
      ctx.fillRect(0, 0, w, h);

      const vignette = ctx.createRadialGradient(
        w / 2,
        h / 2,
        Math.min(w, h) * 0.2,
        w / 2,
        h / 2,
        Math.max(w, h) * 0.9
      );
      vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
      vignette.addColorStop(0.6, "rgba(0, 0, 0, 0)");
      vignette.addColorStop(0.75, "rgba(0, 0, 0, 0.05)");
      vignette.addColorStop(0.85, "rgba(0, 0, 0, 0.15)");
      vignette.addColorStop(0.92, "rgba(0, 0, 0, 0.3)");
      vignette.addColorStop(0.96, "rgba(0, 0, 0, 0.5)");
      vignette.addColorStop(1, "rgba(0, 0, 0, 0.8)");

      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);

      const flicker =
        Math.sin(time * 60 * Math.PI * 2) * 0.002 +
        Math.sin(time * 59.94 * Math.PI * 2) * 0.001;

      if (Math.abs(flicker) > 0.001) {
        ctx.globalCompositeOperation = flicker > 0 ? "screen" : "multiply";
        ctx.fillStyle = `rgba(0, 255, 0, ${Math.abs(flicker)})`;
        ctx.fillRect(0, 0, w, h);
        ctx.globalCompositeOperation = "source-over";
      }

      if (
        state.current.glitchTimer % (600 + Math.random() * 400) === 0 &&
        Math.random() > 0.7
      ) {
        const glitchIntensity = 0.01 + Math.random() * 0.02;
        ctx.globalCompositeOperation = "screen";
        ctx.fillStyle = `rgba(0, 255, 0, ${glitchIntensity})`;
        ctx.fillRect(0, 0, w, h);
        ctx.globalCompositeOperation = "source-over";
      }

      if (!state.current.isMobile && Math.random() > 0.98) {
        const scanY = (time * 200) % h;
        ctx.globalCompositeOperation = "screen";
        ctx.fillStyle = "rgba(0, 255, 0, 0.005)";
        ctx.fillRect(0, scanY - 1, w, 3);
        ctx.globalCompositeOperation = "source-over";
      }
    },
    [screenSize.height, screenSize.width]
  );

  // 메인 드로우
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || screenSize.width === 0 || screenSize.height === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { cols, drops, fontSize, trails } = state.current;
    const w =
      typeof window !== "undefined" ? window.innerWidth : screenSize.width;
    const h =
      typeof window !== "undefined" ? window.innerHeight : screenSize.height;

    // 배경 페이드
    ctx.fillStyle = state.current.isMobile
      ? "rgba(0, 0, 0, 0.08)"
      : "rgba(0, 0, 0, 0.06)";
    ctx.fillRect(0, 0, w, h);

    // 글리치 타이머
    state.current.glitchTimer++;
    const shouldGlitch =
      state.current.glitchTimer % (state.current.isMobile ? 120 : 90) === 0;

    for (let i = 0; i < cols; i++) {
      const drop = drops[i];
      if (!drop) continue;

      if (!drop.active) {
        if (Math.random() > 0.99) {
          drop.active = true;
          drop.y = Math.random() * -300;
        }
        continue;
      }

      const x = i * fontSize * 0.7 + fontSize / 2;
      const currentY = drop.y * fontSize;

      // 글리치
      if (shouldGlitch && Math.random() > 0.85) {
        drop.glitch = !drop.glitch;
      }
      if (Math.random() > 0.995) {
        drop.glitch = !drop.glitch;
      }

      const glitchX = drop.glitch
        ? x + (Math.random() - 0.5) * (state.current.isMobile ? 3 : 6)
        : x;

      // 문자
      let char: string;
      if (Math.random() > 0.5 && drop.lastChar) {
        char = drop.lastChar;
      } else {
        char = getRandomChar(drop.charType);
        drop.lastChar = char;
      }

      // 트레일 업데이트
      if (!trails[i]) trails[i] = [];
      trails[i].unshift({
        char,
        y: currentY,
        brightness: drop.brightness,
        glitch: drop.glitch,
      });

      // 트레일 길이 제한
      const maxTrailLength = Math.min(drop.trailLength, 40);
      if (trails[i].length > maxTrailLength) {
        trails[i].splice(maxTrailLength);
      }

      // 트레일 렌더
      trails[i].forEach((trail, index) => {
        const alpha = (1 - index / trails[i].length) * 0.95;
        const brightness = trail.brightness * alpha;

        if (index === 0) {
          const headColor = `rgba(240, 255, 240, ${Math.min(brightness, 1)})`;
          drawText(ctx, trail.char, glitchX, trail.y, headColor, true);
        } else if (index < 2) {
          const color = `rgba(200, 255, 200, ${brightness})`;
          drawText(ctx, trail.char, glitchX, trail.y, color, false);
        } else if (index < 4) {
          const color = `rgba(150, 255, 150, ${brightness})`;
          drawText(ctx, trail.char, glitchX, trail.y, color, false);
        } else if (index < 8) {
          const color = `rgba(100, 255, 100, ${brightness})`;
          drawText(ctx, trail.char, glitchX, trail.y, color, false);
        } else if (index < 15) {
          const greenIntensity = Math.floor(80 + brightness * 160);
          const mediumGreen = `rgba(0, ${greenIntensity}, 0, ${brightness})`;
          drawText(ctx, trail.char, glitchX, trail.y, mediumGreen, false);
        } else {
          const greenIntensity = Math.floor(40 + brightness * 120);
          const darkGreen = `rgba(0, ${greenIntensity}, 0, ${
            brightness * 0.8
          })`;
          drawText(ctx, trail.char, glitchX, trail.y, darkGreen, false);
        }
      });

      // 드롭 이동/리셋
      drop.y += drop.speed;
      drop.resetTimer++;

      if (drop.y * fontSize > h + 100 || drop.resetTimer > 300) {
        if (Math.random() > 0.6) {
          drop.y = Math.random() * -300;
          drop.speed = 0.3 + Math.random() * 2.0;
          drop.brightness = 0.3 + Math.random() * 0.7;
          drop.glitch = false;
          drop.charType = Math.random();
          drop.resetTimer = 0;
          drop.trailLength = 15 + Math.random() * 25;
          drop.active = Math.random() > 0.2;
          trails[i].length = 0;
        }
      }
    }

    drawScanlines(ctx);
    drawCRTEffect(ctx);

    rafId.current = requestAnimationFrame(draw);
  }, [screenSize, getRandomChar, drawText, drawScanlines, drawCRTEffect]);

  // 애니메이션 시작/중지
  useEffect(() => {
    if (typeof window === "undefined") return;

    setupCanvas();

    const fontLoadTimer = window.setTimeout(() => {
      setIsLoaded(true);
      rafId.current = requestAnimationFrame(draw);
    }, 100);

    return () => {
      window.clearTimeout(fontLoadTimer);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
    };
  }, [
    setupCanvas,
    draw,
    intensity,
    showScanlines,
    showVignette,
    showPixelEffect,
  ]);

  // 화면 크기 변경 시 캔버스 재설정
  useEffect(() => {
    if (screenSize.width > 0 && screenSize.height > 0) {
      setupCanvas();
    }
  }, [screenSize, setupCanvas]);

  return (
    <div
      className={`fixed inset-0 w-full h-full ${className ?? ""}`}
      style={style}
    >
      <canvas
        ref={canvasRef}
        className={`fixed inset-0 pointer-events-none transition-opacity duration-1000 ${
          isLoaded ? "opacity-60" : "opacity-0"
        }`}
        style={{
          filter:
            "contrast(1.2) brightness(1.05) saturate(1.4) hue-rotate(2deg)",
          imageRendering: "pixelated",
          background: `
            radial-gradient(ellipse at center, 
              #001a00 0%, 
              #001100 30%, 
              #000800 60%, 
              #000000 100%
            )
          `,
          mixBlendMode: "normal",
        }}
      />

      {/* CRT 비네팅 */}
      {showVignette && (
        <>
          <div
            className="fixed inset-0 pointer-events-none"
            style={{
              background: `
                radial-gradient(
                  ellipse 130% 120% at center, 
                  transparent 0%,
                  transparent 50%,
                  rgba(0, 0, 0, 0.05) 65%,
                  rgba(0, 0, 0, 0.15) 75%,
                  rgba(0, 0, 0, 0.35) 85%,
                  rgba(0, 0, 0, 0.6) 92%,
                  rgba(0, 0, 0, 0.85) 97%,
                  rgba(0, 0, 0, 0.95) 100%
                )
              `,
            }}
          />
          <div
            className="fixed inset-0 pointer-events-none"
            style={{
              boxShadow: `
                inset 0 0 0 1px rgba(0, 0, 0, 0.1),
                inset 0 0 20px rgba(0, 0, 0, 0.3),
                inset 0 0 40px rgba(0, 0, 0, 0.2)
              `,
            }}
          />
        </>
      )}

      {/* 스캔라인 */}
      {showScanlines && (
        <>
          <div
            className="fixed inset-0 pointer-events-none"
            style={{
              background: `
                repeating-linear-gradient(
                  0deg,
                  transparent 0px,
                  transparent 2px,
                  rgba(0, 100, 50, 0.01) 2px,
                  rgba(0, 100, 50, 0.01) 3px,
                  transparent 3px,
                  transparent 4px
                )
              `,
            }}
          />
          <div
            className="fixed inset-0 pointer-events-none opacity-60"
            style={{
              background: `
                repeating-linear-gradient(
                  0deg,
                  transparent 0px,
                  rgba(0, 255, 100, 0.003) 1px,
                  transparent 2px
                )
              `,
            }}
          />
        </>
      )}

      {/* 서브픽셀/포스퍼 효과 */}
      {showPixelEffect && (
        <>
          <div
            className="fixed inset-0 pointer-events-none opacity-10"
            style={{
              background: `
                repeating-linear-gradient(
                  90deg,
                  rgba(255, 0, 0, 0.15) 0px,
                  rgba(255, 0, 0, 0.15) 1px,
                  transparent 1px,
                  transparent 2px,
                  rgba(0, 255, 0, 0.15) 2px,
                  rgba(0, 255, 0, 0.15) 3px,
                  transparent 3px,
                  transparent 4px,
                  rgba(0, 0, 255, 0.15) 4px,
                  rgba(0, 0, 255, 0.15) 5px,
                  transparent 5px,
                  transparent 6px
                )
              `,
            }}
          />
          <div
            className="fixed inset-0 pointer-events-none opacity-5"
            style={{
              background: `
                radial-gradient(
                  circle at 50% 50%,
                  rgba(0, 255, 0, 0.3) 0%,
                  transparent 70%
                ),
                repeating-conic-gradient(
                  from 0deg at 50% 50%,
                  transparent 0deg,
                  rgba(0, 255, 0, 0.05) 120deg,
                  transparent 240deg
                )
              `,
              backgroundSize: "3px 3px, 6px 6px",
            }}
          />
        </>
      )}
    </div>
  );
}
