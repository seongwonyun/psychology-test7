// src/lib/utils/string.ts

/**
 * 문자열을 태그 배열로 변환
 * 쉼표(,), 개행(\n), 풀와이드 콤마(，) 지원
 */
export function toList(s?: string | null): string[] {
  if (!s) return [];

  return String(s)
    .split(/[,\n，]/g)
    .map((t) => t.trim())
    .filter(Boolean);
}

/**
 * 빈 값 체크
 */
export function isEmpty(value?: string | null): boolean {
  return !value || value.trim().length === 0;
}
