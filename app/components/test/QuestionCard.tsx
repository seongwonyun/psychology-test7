"use client";

import scale from "@/app/data/scale.json";

interface Question {
  id: string;
  text: string;
  options?: string[];
}

interface QuestionCardProps {
  question: Question;
  value?: number;
  onChange: (v: number) => void;
}

export default function QuestionCard({
  question,
  value,
  onChange,
}: QuestionCardProps) {
  if (!question) return null;

  // ✅ 문항의 options가 있으면 그것을 사용, 없으면 scale.json을 사용
  const options =
    Array.isArray(question.options) && question.options.length > 0
      ? question.options.map((label, i) => ({ value: i + 1, label }))
      : (scale as { value: number; label: string }[]);

  return (
    <div className="bg-black/40 border border-emerald-500/30 rounded-2xl p-6 text-gray-100">
      {/* 문항 텍스트 */}
      <div className="text-lg mb-6 text-center">{question.text}</div>

      {/* 선택지 */}
      <div className="flex flex-col gap-2 w-full max-w-sm mx-auto">
        {options.map((opt) => (
          <label
            key={opt.value}
            className={`px-4 py-3 rounded-lg border cursor-pointer text-center transition-all ${
              value === opt.value
                ? "border-emerald-400 bg-emerald-500/10"
                : "border-gray-600 hover:border-emerald-500/50"
            }`}
          >
            <input
              type="radio"
              name={question.id}
              className="hidden"
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              aria-label={`${question.text} - ${opt.label}`}
            />
            {opt.value}. {opt.label}
          </label>
        ))}
      </div>
    </div>
  );
}
