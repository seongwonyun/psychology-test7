// src/app/utils/perma.ts (또는 .js)
import permaData from "@/app/data/perma.json"; // ✅ JSON 경로로 변경

export const CODE_POS = { P: "P", E: "E", S: "S", M: "M", A: "A" } as const;
export const CODE_NEG = { P: "N", E: "D", S: "I", M: "U", A: "L" } as const;

/** 🔧 데이터 안전화: S7은 항상 reverse=false */
const permaSafe = {
  ...permaData,
  S: (permaData.S || []).map((q: any) =>
    q?.id === "S7" ? { ...q, reverse_score: false } : q
  ),
};

type PermaKey = keyof typeof permaSafe; // "P" | "E" | "S" | "M" | "A"

const GROUP_MIDPOINT: Record<PermaKey, number> = {
  P: 6, // 2문항 * 평균 3점
  E: 6,
  S: 21, // 7문항 * 평균 3점
  M: 6,
  A: 6,
};

/** 1~5 Likert 점수 유효성 보정 */
function normalizeLikert(n: unknown) {
  const num = Number(n);
  if (!Number.isFinite(num)) return NaN;
  if (num < 1) return 1;
  if (num > 5) return 5;
  return num;
}

/** 역채점: true면 6 - score, 아니면 그대로 */
function scoredValue(raw: unknown, reverse?: boolean) {
  const v = normalizeLikert(raw);
  if (Number.isNaN(v)) return NaN;
  return reverse ? 6 - v : v;
}

/** 미응답 처리 전략 */
type MissingPolicy = "zero" | "min" | "mid" | "skip";

/** 질문 배열 기반 합계/응답수 */
function sumLikertByQuestions(
  answersObj: Record<string, unknown> | undefined,
  questions: Array<{ id: string; reverse_score?: boolean }>,
  missing: MissingPolicy
) {
  let sum = 0;
  let answered = 0;

  for (const q of questions) {
    const raw = answersObj?.[q.id];
    const val = scoredValue(raw, q.reverse_score === true);

    if (Number.isNaN(val)) {
      // 미응답 처리
      if (missing === "zero") {
        sum += 0; // 그대로 0
      } else if (missing === "min") {
        sum += 1; // 최소점
      } else if (missing === "mid") {
        sum += 3; // 중간점
      } else if (missing === "skip") {
        // 제외
        continue;
      }
    } else {
      sum += val;
      answered += 1;
    }
  }

  return { sum, answered };
}

/** 동적 백분율 계산: answeredCount에 따라 min/max 가변 */
function toPercent(total: number, answeredCount: number) {
  const min = 1 * answeredCount;
  const max = 5 * answeredCount;
  if (answeredCount <= 0) return 0;
  const raw = ((total - min) / (max - min)) * 100;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

export function computePermaScores(
  answersPerma: Record<string, unknown> | undefined,
  missing: MissingPolicy = "skip" // ✅ 기본값: 미응답 제외
) {
  const groups: Record<PermaKey, any[]> = {
    P: permaSafe.P,
    E: permaSafe.E,
    S: permaSafe.S,
    M: permaSafe.M,
    A: permaSafe.A,
  };

  // 영역별 합계(역채점/미응답 정책 반영)
  const sums: Record<PermaKey, number> = { P: 0, E: 0, S: 0, M: 0, A: 0 };
  const answered: Record<PermaKey, number> = { P: 0, E: 0, S: 0, M: 0, A: 0 };

  for (const k of Object.keys(groups) as PermaKey[]) {
    const { sum, answered: a } = sumLikertByQuestions(
      answersPerma,
      groups[k],
      missing
    );
    sums[k] = sum;
    answered[k] = a;
  }

  // 중간값 기준 코드화 (기존 로직 유지: 고정 MIDPOINT 비교)
  const codes: Record<PermaKey, string> = { P: "", E: "", S: "", M: "", A: "" };
  for (const k of Object.keys(sums) as PermaKey[]) {
    // answered 수가 적어 왜곡될 수 있으니, 고정 MIDPOINT와 비교 유지
    codes[k] = sums[k] > GROUP_MIDPOINT[k] ? CODE_POS[k] : CODE_NEG[k];
  }

  // 전체 합계/응답수
  const total = (Object.values(sums) as number[]).reduce((a, b) => a + b, 0);
  const answeredTotal = (Object.values(answered) as number[]).reduce(
    (a, b) => a + b,
    0
  );

  // ✅ 응답된 문항 수 기준 백분위
  const percent = toPercent(total, answeredTotal);

  return { sums, codes, total, percent, answered };
}
