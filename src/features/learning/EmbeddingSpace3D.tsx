import { useMemo, useRef, useState, type PointerEvent, type WheelEvent } from 'react';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import { cosineSimilarityMatrix, projectEmbeddings3d, type EmbeddingPoint3d } from './embeddingMath';
import {
  clamp,
  DEFAULT_EMBEDDING_CAMERA,
  layoutEmbeddingLabels,
  projectPoint,
  shortEmbeddingLabel,
  type Camera,
} from './embeddingSpace3dGeometry';
import { EMBEDDING_SPACE_COPY, type EmbeddingSpaceKind } from './embeddingSpaceCopy';
import { EmbeddingVectorHeatmap } from './EmbeddingVectorHeatmap';

type EmbeddingSpace3DProps = {
  inputs: string[];
  vectors: number[][];
  selectedIndex: number;
  onSelect: (index: number) => void;
  kind: EmbeddingSpaceKind;
};

const VIEWBOX = { width: 820, height: 520 };
const AXES: Array<{ label: string; end: EmbeddingPoint3d }> = [
  { label: 'PC 1', end: { x: 1.35, y: 0, z: 0 } },
  { label: 'PC 2', end: { x: 0, y: 1.35, z: 0 } },
  { label: 'PC 3', end: { x: 0, y: 0, z: 1.35 } },
];

export function EmbeddingSpace3D({ inputs, vectors, selectedIndex, onSelect, kind }: EmbeddingSpace3DProps) {
  const [camera, setCamera] = useState<Camera>(DEFAULT_EMBEDDING_CAMERA);
  const copy = EMBEDDING_SPACE_COPY[kind];
  const drag = useRef<{ pointerId: number; x: number; y: number; moved: boolean } | null>(null);
  const points = useMemo(() => projectEmbeddings3d(vectors), [vectors]);
  const similarity = useMemo(() => cosineSimilarityMatrix(vectors), [vectors]);
  const projected = points.map((point) => projectPoint(point, camera, VIEWBOX.width, VIEWBOX.height));
  const labels = layoutEmbeddingLabels(
    projected,
    inputs.map((input, index) => `${index + 1} · ${shortEmbeddingLabel(input, 24)}`),
    selectedIndex,
    VIEWBOX.width,
    VIEWBOX.height,
  );
  const origin = projectPoint({ x: 0, y: 0, z: 0 }, camera, VIEWBOX.width, VIEWBOX.height);
  const nearest = similarity[selectedIndex]
    ?.map((value, index) => ({ index, value }))
    .filter(({ index }) => index !== selectedIndex)
    .sort((left, right) => right.value - left.value)
    .slice(0, 3) ?? [];
  const selectedPoint = projected[selectedIndex];

  const updateZoom = (delta: number) => setCamera((current) => ({ ...current, zoom: clamp(current.zoom + delta, 0.65, 1.8) }));
  const handlePointerDown = (event: PointerEvent<SVGSVGElement>) => {
    drag.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const handlePointerMove = (event: PointerEvent<SVGSVGElement>) => {
    if (!drag.current || drag.current.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - drag.current.x;
    const deltaY = event.clientY - drag.current.y;
    if (Math.abs(deltaX) + Math.abs(deltaY) > 2) drag.current.moved = true;
    drag.current.x = event.clientX;
    drag.current.y = event.clientY;
    setCamera((current) => ({
      ...current,
      yaw: current.yaw + deltaX * 0.008,
      pitch: clamp(current.pitch + deltaY * 0.008, -1.15, 1.15),
    }));
  };
  const handlePointerUp = (event: PointerEvent<SVGSVGElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    drag.current = null;
  };
  const handleWheel = (event: WheelEvent<SVGSVGElement>) => {
    event.preventDefault();
    updateZoom(event.deltaY > 0 ? -0.08 : 0.08);
  };

  return (
    <div className="learning-reveal" data-testid="embedding-space-3d">
      <div className="grid overflow-hidden bg-[#071018] text-white lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="relative min-h-[32rem] overflow-hidden border-white/10 lg:border-r">
          <svg
            viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
            className="h-full min-h-[32rem] w-full cursor-grab touch-none select-none active:cursor-grabbing"
            role="img"
            aria-label={copy.ariaLabel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={handleWheel}
          >
            <rect width={VIEWBOX.width} height={VIEWBOX.height} fill="#071018" />

            {Array.from({ length: 7 }, (_, index) => -1.2 + index * 0.4).flatMap((offset) => {
              const xStart = projectPoint({ x: -1.2, y: -1.15, z: offset }, camera, VIEWBOX.width, VIEWBOX.height);
              const xEnd = projectPoint({ x: 1.2, y: -1.15, z: offset }, camera, VIEWBOX.width, VIEWBOX.height);
              const zStart = projectPoint({ x: offset, y: -1.15, z: -1.2 }, camera, VIEWBOX.width, VIEWBOX.height);
              const zEnd = projectPoint({ x: offset, y: -1.15, z: 1.2 }, camera, VIEWBOX.width, VIEWBOX.height);
              return [
                <line key={`x-${offset}`} x1={xStart.screenX} y1={xStart.screenY} x2={xEnd.screenX} y2={xEnd.screenY} stroke="#94a3b8" strokeOpacity="0.11" />,
                <line key={`z-${offset}`} x1={zStart.screenX} y1={zStart.screenY} x2={zEnd.screenX} y2={zEnd.screenY} stroke="#94a3b8" strokeOpacity="0.11" />,
              ];
            })}

            {AXES.map(({ label, end }) => {
              const endpoint = projectPoint(end, camera, VIEWBOX.width, VIEWBOX.height);
              return (
                <g key={label}>
                  <line x1={origin.screenX} y1={origin.screenY} x2={endpoint.screenX} y2={endpoint.screenY} stroke="#94a3b8" strokeOpacity="0.5" strokeWidth="1.4" />
                  <text x={endpoint.screenX + 8} y={endpoint.screenY - 7} fill="#94a3b8" fontSize="12" fontWeight="700">{label}</text>
                </g>
              );
            })}

            {selectedPoint ? nearest.map(({ index, value }) => {
              const point = projected[index];
              return <line key={`neighbor-${index}`} x1={selectedPoint.screenX} y1={selectedPoint.screenY} x2={point.screenX} y2={point.screenY} stroke="#facc15" strokeOpacity={0.25 + Math.max(0, value) * 0.55} strokeWidth="1.5" />;
            }) : null}

            {[...projected]
              .map((point, index) => ({ point, index }))
              .sort((left, right) => left.point.depth - right.point.depth)
              .map(({ point, index }) => {
                const selected = selectedIndex === index;
                const radius = (selected ? 10 : 7) * clamp(point.scale, 0.7, 1.35);
                const label = labels[index];
                return (
                  <g
                    key={`${inputs[index]}-${index}`}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={point.screenX}
                      cy={point.screenY}
                      r={radius + 8}
                      fill="transparent"
                      role="button"
                      tabIndex={0}
                      aria-label={`Select ${inputs[index]}`}
                      onClick={(event) => { event.stopPropagation(); onSelect(index); }}
                      onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(index); } }}
                      data-testid={`embedding-3d-point-${index}`}
                    />
                    <circle className="pointer-events-none" cx={point.screenX} cy={point.screenY} r={radius} fill={selected ? '#facc15' : '#38bdf8'} stroke={selected ? '#fef9c3' : '#dbeafe'} strokeOpacity="0.8" strokeWidth="1.5" />
                    <circle className="pointer-events-none" cx={point.screenX - radius * 0.28} cy={point.screenY - radius * 0.3} r={radius * 0.3} fill="white" fillOpacity="0.46" />
                    <line className="pointer-events-none" x1={point.screenX} y1={point.screenY} x2={label.leaderX} y2={label.leaderY} stroke={selected ? '#facc15' : '#7dd3fc'} strokeOpacity="0.32" />
                    <text className="pointer-events-none" x={label.x} y={label.y + 13} fill={selected ? '#fef08a' : '#dbeafe'} fontSize="11" fontWeight={selected ? '700' : '500'}>
                      {index + 1} · {shortEmbeddingLabel(inputs[index], 24)}
                    </text>
                  </g>
                );
              })}
          </svg>

          <div className="absolute right-4 top-4 flex items-center gap-1" aria-label="3D view controls">
            <button type="button" onClick={() => updateZoom(-0.12)} className="inline-flex h-9 w-9 items-center justify-center border border-white/15 bg-[#071018]/90 text-slate-300 hover:text-white" aria-label="Zoom out"><Minus className="h-4 w-4" /></button>
            <button type="button" onClick={() => setCamera(DEFAULT_EMBEDDING_CAMERA)} className="inline-flex h-9 w-9 items-center justify-center border border-white/15 bg-[#071018]/90 text-slate-300 hover:text-white" aria-label="Reset view"><RotateCcw className="h-4 w-4" /></button>
            <button type="button" onClick={() => updateZoom(0.12)} className="inline-flex h-9 w-9 items-center justify-center border border-white/15 bg-[#071018]/90 text-slate-300 hover:text-white" aria-label="Zoom in"><Plus className="h-4 w-4" /></button>
          </div>
        </div>

        <aside className="p-6 lg:p-7" aria-label={copy.neighbors}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">{copy.neighbors}</p>
          <p className="mt-4 text-sm font-semibold leading-6 text-yellow-200">{inputs[selectedIndex]}</p>
          <ol className="mt-6 divide-y divide-white/10 border-y border-white/10">
            {nearest.map(({ index, value }, rank) => (
              <li key={index}>
                <button type="button" onClick={() => onSelect(index)} className="grid w-full grid-cols-[1.5rem_1fr_auto] gap-3 py-4 text-left text-sm text-slate-200 hover:text-white">
                  <span className="font-mono text-xs text-sky-300">{rank + 1}</span>
                  <span className="leading-5">{shortEmbeddingLabel(inputs[index])}</span>
                  <span className="font-mono text-xs text-sky-300">{value.toFixed(2)}</span>
                </button>
              </li>
            ))}
          </ol>
          <EmbeddingVectorHeatmap
            inputs={inputs}
            vectors={vectors}
            indices={[selectedIndex, ...nearest.map(({ index }) => index)]}
          />
          <p className="mt-6 text-xs leading-5 text-slate-400">{copy.note}</p>
        </aside>
      </div>
      <div className="flex flex-col gap-2 border-x border-b border-stone-200 bg-stone-50 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span>Drag to orbit · Scroll to zoom · Select a point</span>
        <span className="font-semibold text-slate-600">{copy.qualifier}</span>
      </div>
    </div>
  );
}
