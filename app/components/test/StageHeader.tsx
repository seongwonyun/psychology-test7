import ProgressBar from "./ProgressBar";

interface StageHeaderProps {
  currentStage: string;
  currentIndex: number;
  total: number;
  steps: string[];
}

export default function StageHeader({
  currentStage,
  currentIndex,
  total,
  steps,
}: StageHeaderProps) {
  const pct = total ? Math.round(((currentIndex + 1) / total) * 100) : 0;
  return (
    <div className="sticky top-0 z-20 bg-black/60 backdrop-blur border-b border-emerald-500/30">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center gap-3 text-sm">
          {steps.map((s) => (
            <span
              key={s}
              className={
                s === currentStage ? "text-emerald-400" : "text-gray-400"
              }
            >
              {s}
            </span>
          ))}
          <span className="ml-auto text-gray-300">
            {total ? `${currentIndex + 1} / ${total}` : ""}
          </span>
        </div>
        <ProgressBar value={pct} />
      </div>
    </div>
  );
}
