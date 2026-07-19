export function Gpt2VectorStrip({ values, label }: { values: number[]; label: string }) {
  const maximum = Math.max(...values.map(Math.abs), 0.0001);
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
        <span>{label}</span><span>{values.length} shown</span>
      </div>
      <div className="grid grid-cols-12 gap-1" aria-label={label}>
        {values.map((value, index) => (
          <span
            key={`${label}-${index}`}
            className="aspect-square rounded-sm border border-white/5"
            title={`${label} ${index + 1}: ${value.toFixed(5)}`}
            style={{ backgroundColor: value >= 0 ? `rgba(56, 189, 248, ${0.12 + 0.88 * Math.abs(value) / maximum})` : `rgba(251, 191, 36, ${0.12 + 0.88 * Math.abs(value) / maximum})` }}
          />
        ))}
      </div>
    </div>
  );
}
