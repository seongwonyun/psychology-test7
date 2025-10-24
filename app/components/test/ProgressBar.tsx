export default function ProgressBar({ value = 0 }) {
  return (
    <div className="h-2 w-full bg-gray-800 rounded">
      <div
        className="h-2 rounded bg-emerald-500 transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
