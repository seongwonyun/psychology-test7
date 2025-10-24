export const runtime = "nodejs";
// (선택) 데이터가 자주 바뀌면 아래 사용
// export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getPrescriptionByCode } from "@/app/lib/services/prescription.service";
import { PrescriptionHeader } from "@/app/components/prescription/PrescriptionHeader";
import { PrescriptionSummary } from "@/app/components/prescription/PrescriptionSummary";
import { PrescriptionLetter } from "@/app/components/prescription/PrescriptionLetter";
import { TravelPrescriptions } from "@/app/components/prescription/TravelPrescriptions";
import { PrescriptionActions } from "@/app/components/prescription/PrescriptionActions";
import DebugPanel from "@/app/components/dev/DebugPanel";

/** ---------- Types ---------- **/

type PageProps = {
  params: Promise<{ code: string }>; // Next.js 15+ async params
};

/** ---------- SEO ---------- **/

export async function generateMetadata({ params }: PageProps) {
  const { code } = await params;
  const row = await getPrescriptionByCode(code);

  return {
    title: row ? `${row.code} — ${row.name ?? "상세 결과"}` : "결과 없음",
    description: row
      ? `${row.code} 처방 상세, 도전/유지/화해 추천과 편지/진단 요약`
      : "해당 코드에 대한 결과를 찾을 수 없습니다.",
  };
}

/** ---------- Page ---------- **/

export default async function Page({ params }: PageProps) {
  const { code } = await params;
  const row = await getPrescriptionByCode(code);

  if (!row) return notFound();

  const {
    name,
    diagnosis,
    concept,
    dear,
    letter,
    movie,
    book,
    challengeConcept,
    challengeKeyword,
    challengeActivity,
    maintainConcept,
    maintainKeyword,
    maintainActivity,
    reconcileConcept,
    reconcileKeyword,
    reconcileActivity,
  } = row;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 space-y-8">
      {/* 상단 헤더 */}
      <PrescriptionHeader code={code} name={name} concept={concept} />

      {/* 편지 본문 */}
      <PrescriptionLetter dear={dear} letter={letter} />

      {/* 핵심 요약 카드 */}
      <PrescriptionSummary
        // dear={dear}
        // diagnosis={diagnosis}
        movie={movie}
        book={book}
      />

      {/* 도전/유지/화해 3단 그리드 */}
      <TravelPrescriptions
        challengeConcept={challengeConcept}
        challengeKeyword={challengeKeyword}
        challengeActivity={challengeActivity}
        maintainConcept={maintainConcept}
        maintainKeyword={maintainKeyword}
        maintainActivity={maintainActivity}
        reconcileConcept={reconcileConcept}
        reconcileKeyword={reconcileKeyword}
        reconcileActivity={reconcileActivity}
      />

      {/* 코멘트 & 액션 버튼 */}
      <PrescriptionActions code={code} />
      {/* <DebugPanel /> */}
    </main>
  );
}
