// src/lib/services/prescription.service.ts
import { prisma } from "@/app/lib/prisma";
// import type { PrescriptionData } from "@/types/prescription";

export type PrescriptionData = {
  code: string;
  name: string | null;
  diagnosis: string | null;
  concept: string | null;
  dear: string | null;
  letter: string | null;
  movie: string | null;
  book: string | null;
  challengeConcept: string | null;
  challengeKeyword: string | null;
  challengeActivity: string | null;
  maintainConcept: string | null;
  maintainKeyword: string | null;
  maintainActivity: string | null;
  reconcileConcept: string | null;
  reconcileKeyword: string | null;
  reconcileActivity: string | null;
};

export type TravelPrescriptionType = "challenge" | "maintain" | "reconcile";

export type TravelPrescription = {
  type: TravelPrescriptionType;
  emoji: string;
  title: string;
  concept: string | null;
  keyword: string | null;
  activity: string | null;
  borderColor: string;
  bgColor: string;
};

/**
 * 코드로 처방 단건 조회 (대소문자 무시)
 */
export async function getPrescriptionByCode(
  codeParam: string
): Promise<PrescriptionData | null> {
  try {
    // remove explicit select to avoid referencing nonexistent fields in the generated Prisma select type,
    // then map the returned record to the PrescriptionData shape using a safe any-cast for optional DB fields.
    const record = await prisma.prescriptions.findFirst({
      where: {
        code: {
          equals: String(codeParam),
          mode: "insensitive",
        },
      },
    });

    if (!record) return null;

    const r: any = record as any;
    const result: PrescriptionData = {
      code: (r.code ?? null) as string,
      name: r.name ?? null,
      diagnosis: r.diagnosis ?? null,
      concept: r.concept ?? null,
      dear: r.dear ?? null,
      letter: r.letter ?? null,
      movie: r.movie ?? null,
      book: r.book ?? null,
      challengeConcept: r.challengeConcept ?? null,
      challengeKeyword: r.challengeKeyword ?? null,
      challengeActivity: r.challengeActivity ?? null,
      maintainConcept: r.maintainConcept ?? null,
      maintainKeyword: r.maintainKeyword ?? null,
      maintainActivity: r.maintainActivity ?? null,
      reconcileConcept: r.reconcileConcept ?? null,
      reconcileKeyword: r.reconcileKeyword ?? null,
      reconcileActivity: r.reconcileActivity ?? null,
    };

    return result;
  } catch (error) {
    console.error("처방 조회 오류:", error);
    return null;
  }
}
