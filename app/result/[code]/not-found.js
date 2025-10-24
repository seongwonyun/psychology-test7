import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-xl font-semibold mb-4">결과를 찾을 수 없습니다</h1>
      <Link href="/result" className="text-blue-600 underline">
        목록으로 돌아가기
      </Link>
    </main>
  );
}
