import { useEffect, useMemo, useRef, useState, type PointerEvent, type WheelEvent } from 'react';
import { RotateCcw } from 'lucide-react';
import type { Gpt2EmbeddingForestPoint } from '../../../types/gpt2';
import { clamp, projectPoint, type Camera } from '../embeddingSpace3dGeometry';

type Gpt2EmbeddingForestProps = {
  points: Gpt2EmbeddingForestPoint[];
  selectedId: number;
  neighborhoodIds: number[];
  onSelect: (id: number) => void;
};

const WIDTH = 920;
const HEIGHT = 540;
const INITIAL_CAMERA: Camera = { yaw: -0.58, pitch: 0.34, zoom: 1.02 };

export function Gpt2EmbeddingForest({ points, selectedId, neighborhoodIds, onSelect }: Gpt2EmbeddingForestProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const projectedRef = useRef<Float32Array>(new Float32Array());
  const drag = useRef<{ pointerId: number; x: number; y: number; moved: boolean } | null>(null);
  const [camera, setCamera] = useState(INITIAL_CAMERA);
  const pointIndex = useMemo(() => new Map(points.map((point, index) => [point.id, index])), [points]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    context.clearRect(0, 0, WIDTH, HEIGHT);
    context.fillStyle = '#07111a';
    context.fillRect(0, 0, WIDTH, HEIGHT);

    const projected = new Float32Array(points.length * 2);
    context.fillStyle = 'rgba(148, 163, 184, 0.34)';
    points.forEach((point, index) => {
      const screen = projectPoint(point, camera, WIDTH, HEIGHT, { perspective: 3.8, worldScale: 0.34, centerY: 0.5 });
      projected[index * 2] = screen.screenX;
      projected[index * 2 + 1] = screen.screenY;
      const radius = clamp(0.75 * screen.scale, 0.55, 1.65);
      context.fillRect(screen.screenX - radius, screen.screenY - radius, radius * 2, radius * 2);
    });
    projectedRef.current = projected;

    context.fillStyle = 'rgba(56, 189, 248, 0.9)';
    neighborhoodIds.forEach((id) => {
      const index = pointIndex.get(id);
      if (index === undefined) return;
      context.beginPath();
      context.arc(projected[index * 2], projected[index * 2 + 1], 2.6, 0, Math.PI * 2);
      context.fill();
    });

    const selectedIndex = pointIndex.get(selectedId);
    if (selectedIndex !== undefined) {
      const x = projected[selectedIndex * 2];
      const y = projected[selectedIndex * 2 + 1];
      context.strokeStyle = '#f8fafc';
      context.lineWidth = 1.5;
      context.beginPath();
      context.arc(x, y, 7, 0, Math.PI * 2);
      context.stroke();
      context.fillStyle = '#38bdf8';
      context.beginPath();
      context.arc(x, y, 3.5, 0, Math.PI * 2);
      context.fill();
    }
  }, [camera, neighborhoodIds, pointIndex, points, selectedId]);

  const canvasPosition = (event: PointerEvent<HTMLCanvasElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    return { x: (event.clientX - bounds.left) * WIDTH / bounds.width, y: (event.clientY - bounds.top) * HEIGHT / bounds.height };
  };

  const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    drag.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!drag.current || drag.current.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - drag.current.x;
    const deltaY = event.clientY - drag.current.y;
    drag.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, moved: drag.current.moved || Math.abs(deltaX) + Math.abs(deltaY) > 2 };
    setCamera((current) => ({ ...current, yaw: current.yaw + deltaX * 0.007, pitch: clamp(current.pitch + deltaY * 0.007, -1.05, 1.05) }));
  };
  const handlePointerUp = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!drag.current || drag.current.pointerId !== event.pointerId) return;
    const wasMoved = drag.current.moved;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (wasMoved) return;

    const target = canvasPosition(event);
    const projected = projectedRef.current;
    let nearestIndex = -1;
    let nearestDistance = 64;
    for (let index = 0; index < points.length; index += 1) {
      const deltaX = projected[index * 2] - target.x;
      const deltaY = projected[index * 2 + 1] - target.y;
      const distance = deltaX * deltaX + deltaY * deltaY;
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    }
    if (nearestIndex >= 0) onSelect(points[nearestIndex].id);
  };
  const handleWheel = (event: WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    setCamera((current) => ({ ...current, zoom: clamp(current.zoom + (event.deltaY > 0 ? -0.08 : 0.08), 0.62, 1.75) }));
  };

  return (
    <div className="relative min-h-[32rem] overflow-hidden bg-[#07111a]" data-testid="gpt2-embedding-forest">
      <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="h-[32rem] w-full cursor-grab touch-none active:cursor-grabbing" role="img" aria-label={`Complete GPT-2 embedding forest containing ${points.length.toLocaleString()} projected token vectors`} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} onWheel={handleWheel} />
      <button type="button" onClick={() => setCamera(INITIAL_CAMERA)} className="absolute right-4 top-4 inline-flex min-h-9 items-center gap-2 rounded-full border border-white/10 bg-[#07111a]/90 px-3 text-xs font-semibold text-slate-400 hover:text-white"><RotateCcw className="h-3.5 w-3.5" /> Reset view</button>
      <p className="pointer-events-none absolute bottom-4 left-5 font-mono text-xs text-slate-500">{points.length.toLocaleString()} vectors</p>
      <p className="pointer-events-none absolute bottom-4 right-5 text-xs text-slate-500">Click a dot · drag to orbit · scroll to zoom</p>
    </div>
  );
}
