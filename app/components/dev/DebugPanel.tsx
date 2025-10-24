"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTestStore } from "@/app/store/useTestStore";

type AnyObj = Record<string, any>;

function safeStringify(obj: unknown, space = 2) {
  const seen = new WeakSet();
  return JSON.stringify(
    obj,
    (_k, v) => {
      if (typeof v === "object" && v !== null) {
        if (seen.has(v as object)) return "[Circular]";
        seen.add(v as object);
      }
      return v;
    },
    space
  );
}

function Section({
  title,
  data,
  defaultOpen = false,
}: {
  title: string;
  data: unknown;
  defaultOpen?: boolean;
}) {
  const text = useMemo(() => safeStringify(data), [data]);
  const [copied, setCopied] = useState(false);

  return (
    <details
      className="rounded-lg border border-emerald-500/30 bg-black/70"
      open={defaultOpen}
    >
      <summary className="cursor-pointer select-none px-3 py-2 text-emerald-300 font-medium">
        {title}
      </summary>
      <div className="px-3 pb-3">
        <pre className="text-xs leading-relaxed whitespace-pre-wrap break-all text-emerald-100/90">
          {text}
        </pre>
        <button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(text);
              setCopied(true);
              setTimeout(() => setCopied(false), 1200);
            } catch {}
          }}
          className="mt-2 rounded-md border border-emerald-500/40 px-2 py-1 text-xs text-emerald-200 hover:bg-emerald-500/10"
        >
          {copied ? "복사됨!" : "JSON 복사"}
        </button>
      </div>
    </details>
  );
}

export default function DebugPanel() {
  const sp = useSearchParams();
  const isDebugQuery = sp?.get("debug") === "1";
  const isDebug = process.env.NODE_ENV !== "production" || isDebugQuery;

  const store = useTestStore();
  const { currentStage, currentIndex, answers, results } = store as unknown as {
    currentStage: string;
    currentIndex: number;
    answers: AnyObj;
    results?: AnyObj;
  };

  // 콘솔에도 그룹 로그 남기기(선택)
  useEffect(() => {
    if (!isDebug) return;
    console.groupCollapsed(
      "%c[DebugPanel] 결과 페이지 스냅샷",
      "color:#10b981;font-weight:bold"
    );
    console.log("currentStage:", currentStage);
    console.log("currentIndex:", currentIndex);
    console.log("answers:", answers);
    console.log("results:", results);
    console.groupEnd();
  }, [isDebug, currentStage, currentIndex, answers, results]);

  if (!isDebug) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] w-[min(90vw,560px)] max-h-[75vh] overflow-auto rounded-xl border border-emerald-500/40 bg-black/80 backdrop-blur px-3 py-3 shadow-lg">
      <div className="mb-2 text-sm font-semibold text-emerald-300">
        🔎 Debug Panel
        <span className="ml-2 text-emerald-500/70 text-xs">
          (NODE_ENV: {process.env.NODE_ENV})
        </span>
      </div>
      <div className="space-y-2">
        <Section
          title="store.current (stage/index)"
          data={{ currentStage, currentIndex }}
          defaultOpen
        />
        <Section title="answers (원본 값만)" data={answers} />
        <Section title="results (perma/answersRaw 등)" data={results} />
        <Section title="results.perma 요약" data={results?.perma} />
        <Section title="results.answersRaw" data={results?.answersRaw} />
      </div>
    </div>
  );
}
