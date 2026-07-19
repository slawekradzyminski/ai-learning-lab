import { useMemo, useRef, useState, type PointerEvent, type WheelEvent } from 'react';
import { RotateCcw } from 'lucide-react';
import { clamp, layoutEmbeddingLabels, projectPoint, type Camera } from '../embeddingSpace3dGeometry';

export type FocusedEmbeddingPoint = {
  id: string | number;
  label: string;
  x: number;
  y: number;
  z: number;
  testId?: string;
};

type FocusedEmbeddingPlotProps = {
  points: FocusedEmbeddingPoint[];
  selectedId: FocusedEmbeddingPoint['id'];
  highlightedIds?: Array<FocusedEmbeddingPoint['id']>;
  connections?: Array<[FocusedEmbeddingPoint['id'], FocusedEmbeddingPoint['id']]>;
  onSelect: (id: FocusedEmbeddingPoint['id']) => void;
  ariaLabel: string;
};

const VIEWBOX = { width: 920, height: 540 };
const INITIAL_CAMERA: Camera = { yaw: -0.58, pitch: 0.34, zoom: 1.08 };

function normalize(points: FocusedEmbeddingPoint[]) {
  if (!points.length) return [];
  const mean = ['x', 'y', 'z'].map((axis) => points.reduce((sum, point) => sum + point[axis as 'x' | 'y' | 'z'], 0) / points.length);
  const centered = points.map((point) => ({ ...point, x: point.x - mean[0], y: point.y - mean[1], z: point.z - mean[2] }));
  const maximum = Math.max(...centered.flatMap(({ x, y, z }) => [Math.abs(x), Math.abs(y), Math.abs(z)]), 0.001);
  return centered.map((point) => ({ ...point, x: point.x / maximum, y: point.y / maximum, z: point.z / maximum }));
}

export function FocusedEmbeddingPlot({ points, selectedId, highlightedIds = [], connections = [], onSelect, ariaLabel }: FocusedEmbeddingPlotProps) {
  const [camera, setCamera] = useState(INITIAL_CAMERA);
  const drag = useRef<{ pointerId: number; x: number; y: number } | null>(null);
  const normalized = useMemo(() => normalize(points), [points]);
  const project = (point: FocusedEmbeddingPoint) => projectPoint(point, camera, VIEWBOX.width, VIEWBOX.height, { perspective: 3.5, worldScale: 0.34, centerY: 0.51 });
  const projected = normalized.map(project);
  const selectedIndex = Math.max(0, normalized.findIndex(({ id }) => id === selectedId));
  const labels = layoutEmbeddingLabels(projected, normalized.map(({ label }) => label), selectedIndex, VIEWBOX.width, VIEWBOX.height);
  const byId = new Map(normalized.map((point, index) => [point.id, projected[index]]));

  const handlePointerDown = (event: PointerEvent<SVGSVGElement>) => {
    drag.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const handlePointerMove = (event: PointerEvent<SVGSVGElement>) => {
    if (!drag.current || drag.current.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - drag.current.x;
    const deltaY = event.clientY - drag.current.y;
    drag.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
    setCamera((current) => ({ ...current, yaw: current.yaw + deltaX * 0.007, pitch: clamp(current.pitch + deltaY * 0.007, -1.05, 1.05) }));
  };
  const handlePointerUp = (event: PointerEvent<SVGSVGElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    drag.current = null;
  };
  const handleWheel = (event: WheelEvent<SVGSVGElement>) => {
    event.preventDefault();
    setCamera((current) => ({ ...current, zoom: clamp(current.zoom + (event.deltaY > 0 ? -0.08 : 0.08), 0.7, 1.65) }));
  };

  const origin = project({ id: 'origin', label: '', x: 0, y: 0, z: 0 });
  const axes = [
    { label: 'PC1', point: { id: 'pc1', label: '', x: 1.2, y: 0, z: 0 } },
    { label: 'PC2', point: { id: 'pc2', label: '', x: 0, y: 1.2, z: 0 } },
    { label: 'PC3', point: { id: 'pc3', label: '', x: 0, y: 0, z: 1.2 } },
  ];

  return (
    <div className="relative min-h-[32rem] overflow-hidden bg-[#07111a]" data-testid="focused-embedding-plot">
      <svg viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`} className="h-full min-h-[32rem] w-full cursor-grab touch-none select-none active:cursor-grabbing" role="img" aria-label={ariaLabel} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} onWheel={handleWheel}>
        <rect width={VIEWBOX.width} height={VIEWBOX.height} fill="#07111a" />

        {[-1, -0.5, 0, 0.5, 1].flatMap((offset) => {
          const x1 = project({ id: '', label: '', x: -1, y: -0.82, z: offset });
          const x2 = project({ id: '', label: '', x: 1, y: -0.82, z: offset });
          const z1 = project({ id: '', label: '', x: offset, y: -0.82, z: -1 });
          const z2 = project({ id: '', label: '', x: offset, y: -0.82, z: 1 });
          return [<line key={`x-${offset}`} x1={x1.screenX} y1={x1.screenY} x2={x2.screenX} y2={x2.screenY} stroke="#94a3b8" strokeOpacity="0.1" />, <line key={`z-${offset}`} x1={z1.screenX} y1={z1.screenY} x2={z2.screenX} y2={z2.screenY} stroke="#94a3b8" strokeOpacity="0.1" />];
        })}

        {axes.map(({ label, point }) => {
          const end = project(point);
          return <g key={label} aria-hidden="true"><line x1={origin.screenX} y1={origin.screenY} x2={end.screenX} y2={end.screenY} stroke="#64748b" strokeOpacity="0.48" /><text x={end.screenX + 7} y={end.screenY - 6} fill="#64748b" fontSize="10">{label}</text></g>;
        })}

        {connections.map(([from, to]) => {
          const first = byId.get(from);
          const second = byId.get(to);
          return first && second ? <line key={`${from}-${to}`} x1={first.screenX} y1={first.screenY} x2={second.screenX} y2={second.screenY} stroke="#38bdf8" strokeWidth="2" strokeOpacity="0.72" /> : null;
        })}

        {[...projected].map((point, index) => ({ point, index })).sort((left, right) => left.point.depth - right.point.depth).map(({ point, index }) => {
          const source = normalized[index];
          const selected = source.id === selectedId;
          const highlighted = highlightedIds.includes(source.id);
          const radius = selected ? 9 : highlighted ? 7 : 5;
          return <g key={source.id} className="cursor-pointer">
            <circle cx={point.screenX} cy={point.screenY} r="15" fill="transparent" role="button" tabIndex={0} aria-label={`Select ${source.label}`} onClick={(event) => { event.stopPropagation(); onSelect(source.id); }} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(source.id); } }} data-testid={source.testId} />
            {selected ? <circle className="pointer-events-none" cx={point.screenX} cy={point.screenY} r="15" fill="#38bdf8" fillOpacity="0.13" /> : null}
            <circle className="pointer-events-none transition-all duration-200" cx={point.screenX} cy={point.screenY} r={radius} fill={selected ? '#38bdf8' : highlighted ? '#e2e8f0' : '#94a3b8'} fillOpacity={selected ? 1 : highlighted ? 0.9 : 0.72} stroke="#f8fafc" strokeOpacity={selected ? 0.9 : 0.22} />
          </g>;
        })}

        {normalized.map((point, index) => {
          const label = labels[index];
          const selected = point.id === selectedId;
          return <g key={`label-${point.id}`} className="pointer-events-none"><line x1={projected[index].screenX} y1={projected[index].screenY} x2={label.leaderX} y2={label.leaderY} stroke="#94a3b8" strokeOpacity="0.3" /><text x={label.x} y={label.y + 13} fill={selected ? '#7dd3fc' : '#e2e8f0'} stroke="#07111a" strokeWidth="4" paintOrder="stroke" fontSize={selected ? 14 : 12} fontWeight={selected ? 700 : 500}>{point.label}</text></g>;
        })}
      </svg>

      <button type="button" onClick={() => setCamera(INITIAL_CAMERA)} className="absolute right-4 top-4 inline-flex min-h-9 items-center gap-2 rounded-full border border-white/10 bg-[#07111a]/90 px-3 text-xs font-semibold text-slate-400 hover:text-white"><RotateCcw className="h-3.5 w-3.5" /> Reset view</button>
      <p className="pointer-events-none absolute bottom-4 left-5 text-xs text-slate-500">Drag to rotate · scroll to zoom</p>
    </div>
  );
}
