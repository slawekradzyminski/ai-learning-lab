import { shortEmbeddingLabel } from './embeddingSpace3dGeometry';

type EmbeddingVectorHeatmapProps = {
  inputs: string[];
  vectors: number[][];
  indices: number[];
};

const MAX_CELLS = 24;

function sampledDimensions(length: number) {
  const count = Math.min(length, MAX_CELLS);
  if (count < 2) return [0];
  return Array.from({ length: count }, (_, index) => Math.round(index * (length - 1) / (count - 1)));
}

export function EmbeddingVectorHeatmap({ inputs, vectors, indices }: EmbeddingVectorHeatmapProps) {
  const dimensions = sampledDimensions(vectors[0]?.length ?? 0);
  const scale = Math.max(...indices.flatMap((index) => dimensions.map((dimension) => Math.abs(vectors[index]?.[dimension] ?? 0))), 1e-9);

  return (
    <div className="mt-7" data-testid="embedding-vector-heatmap">
      <div className="flex items-end justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Vector fingerprint</p>
        <p className="text-[0.65rem] text-slate-500">{dimensions.length}/{vectors[0]?.length ?? 0} dims</p>
      </div>
      <div className="mt-3 space-y-2.5">
        {indices.map((index) => (
          <div key={index} className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-3">
            <span className="truncate text-[0.68rem] text-slate-400">{shortEmbeddingLabel(inputs[index] ?? '', 12)}</span>
            <div className="grid h-4 gap-px" style={{ gridTemplateColumns: `repeat(${dimensions.length}, minmax(0, 1fr))` }}>
              {dimensions.map((dimension) => {
                const value = vectors[index]?.[dimension] ?? 0;
                const intensity = 0.16 + Math.abs(value) / scale * 0.78;
                return (
                  <span
                    key={dimension}
                    className="h-full"
                    style={{ backgroundColor: value >= 0 ? `rgba(56, 189, 248, ${intensity})` : `rgba(250, 204, 21, ${intensity})` }}
                    title={`dimension ${dimension + 1}: ${value.toFixed(4)}`}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-4 text-[0.65rem] text-slate-500">
        <span><i className="mr-1 inline-block h-2 w-2 bg-sky-400" />positive</span>
        <span><i className="mr-1 inline-block h-2 w-2 bg-yellow-400" />negative</span>
      </div>
    </div>
  );
}
