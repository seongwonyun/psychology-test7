// // src/app/api/results/[id]/route.ts
// export const runtime = "nodejs";

// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import { prisma } from "@/app/lib/prisma";

// type RouteParams = {
//   params: { id: string };
// };

// /**
//  * GET: 결과 조회 (코멘트 포함)
//  */
// export async function GET(request: NextRequest, { params }: RouteParams) {
//   try {
//     const { id } = params;
//     const resultId = parseInt(id, 10);

//     if (Number.isNaN(resultId)) {
//       return NextResponse.json(
//         { error: "유효하지 않은 ID입니다." },
//         { status: 400 }
//       );
//     }

//     const result = await prisma.results.findUnique({
//       where: { id: resultId },
//       select: {
//         id: true,
//         code: true,
//         nickname: true,
//         comment: true,
//         answers: true,
//         created_at: true,
//       },
//     });

//     if (!result) {
//       return NextResponse.json(
//         { error: "결과를 찾을 수 없습니다." },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json(result);
//   } catch (error) {
//     console.error("결과 조회 오류:", error);
//     return NextResponse.json(
//       { error: "결과를 불러올 수 없습니다." },
//       { status: 500 }
//     );
//   }
// }

// /**
//  * PATCH: 코멘트 업데이트
//  */
// export async function PATCH(request: NextRequest, { params }: RouteParams) {
//   try {
//     const { id } = params;
//     const resultId = parseInt(id, 10);

//     if (Number.isNaN(resultId)) {
//       return NextResponse.json(
//         { error: "유효하지 않은 ID입니다." },
//         { status: 400 }
//       );
//     }

//     const body = await request.json().catch(() => ({}));
//     const { comment } = body as { comment?: unknown };

//     if (typeof comment !== "string") {
//       return NextResponse.json(
//         { error: "유효한 코멘트를 입력해주세요." },
//         { status: 400 }
//       );
//     }

//     const updated = await prisma.results.update({
//       where: { id: resultId },
//       data: { comment, updated_at: new Date() },
//       select: {
//         id: true,
//         code: true,
//         nickname: true,
//         comment: true,
//         answers: true,
//         created_at: true,
//         updated_at: true,
//       },
//     });

//     return NextResponse.json({ success: true, data: updated });
//   } catch (error) {
//     console.error("코멘트 저장 오류:", error);
//     return NextResponse.json(
//       { error: "코멘트 저장에 실패했습니다." },
//       { status: 500 }
//     );
//   }
// }

// app/api/results/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      answers, // Json
      code, // string | undefined
      nickname, // string | undefined
      comment, // string | undefined
    } = body ?? {};

    if (!answers) {
      return NextResponse.json(
        { error: "MISSING_ANSWERS", message: "`answers` is required." },
        { status: 400 }
      );
    }

    const created = await prisma.results.create({
      data: {
        answers,
        code: code ? String(code).trim().toUpperCase() : null,
        nickname: nickname ? String(nickname).trim() : null,
        comment: comment ? String(comment).trim() : null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("[/api/results] POST error:", err);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Unexpected server error." },
      { status: 500 }
    );
  }
}
