import type { EmbeddingPoint3d } from '../embeddingMath';
import type { ScreenPoint } from '../embeddingSpace3dGeometry';

export const WORD_SPACE_BOUNDS = {
  minimum: -1.22,
  maximum: 1.22,
  floor: -1.18,
  ceiling: 1.18,
} as const;

type Projector = (point: EmbeddingPoint3d) => ScreenPoint;

const CUBE_EDGES: Array<[number, number]> = [
  [0, 1], [1, 2], [2, 3], [3, 0],
  [4, 5], [5, 6], [6, 7], [7, 4],
  [0, 4], [1, 5], [2, 6], [3, 7],
];

const AXES: Array<{ label: string; point: EmbeddingPoint3d; color: string }> = [
  { label: 'PC1', point: { x: 1.42, y: 0, z: 0 }, color: '#38bdf8' },
  { label: 'PC2', point: { x: 0, y: 1.42, z: 0 }, color: '#34d399' },
  { label: 'PC3', point: { x: 0, y: 0, z: 1.42 }, color: '#facc15' },
];

function polygon(points: EmbeddingPoint3d[], project: Projector) {
  return points.map((point) => {
    const projected = project(point);
    return `${projected.screenX},${projected.screenY}`;
  }).join(' ');
}

export function floorFootprint(point: EmbeddingPoint3d, project: Projector, radius = 0.055) {
  return polygon(Array.from({ length: 12 }, (_, index) => {
    const angle = index / 12 * Math.PI * 2;
    return {
      x: point.x + Math.cos(angle) * radius,
      y: WORD_SPACE_BOUNDS.floor,
      z: point.z + Math.sin(angle) * radius,
    };
  }), project);
}

export function WordEmbeddingVolume({ project }: { project: Projector }) {
  const { minimum, maximum, floor, ceiling } = WORD_SPACE_BOUNDS;
  const corners: EmbeddingPoint3d[] = [
    { x: minimum, y: floor, z: minimum },
    { x: maximum, y: floor, z: minimum },
    { x: maximum, y: ceiling, z: minimum },
    { x: minimum, y: ceiling, z: minimum },
    { x: minimum, y: floor, z: maximum },
    { x: maximum, y: floor, z: maximum },
    { x: maximum, y: ceiling, z: maximum },
    { x: minimum, y: ceiling, z: maximum },
  ];
  const projectedCorners = corners.map(project);
  const origin = project({ x: 0, y: 0, z: 0 });

  return (
    <g aria-hidden="true">
      {[-0.78, 0, 0.78].map((depth, index) => {
        const plane = [
          { x: minimum, y: floor, z: depth },
          { x: maximum, y: floor, z: depth },
          { x: maximum, y: ceiling, z: depth },
          { x: minimum, y: ceiling, z: depth },
        ];
        const labelPoint = project({ x: minimum, y: ceiling, z: depth });
        return (
          <g key={depth}>
            <polygon points={polygon(plane, project)} fill="#38bdf8" fillOpacity={index === 1 ? 0.022 : 0.012} stroke="#7dd3fc" strokeOpacity={index === 1 ? 0.16 : 0.08} />
            <text x={labelPoint.screenX + 7} y={labelPoint.screenY + 13} fill="#7dd3fc" fillOpacity="0.42" fontSize="9" fontWeight="700">
              {index === 0 ? 'PC3 −' : index === 1 ? 'PC3 0' : 'PC3 +'}
            </text>
          </g>
        );
      })}

      {Array.from({ length: 9 }, (_, index) => minimum + index * ((maximum - minimum) / 8)).flatMap((offset) => {
        const xStart = project({ x: minimum, y: floor, z: offset });
        const xEnd = project({ x: maximum, y: floor, z: offset });
        const zStart = project({ x: offset, y: floor, z: minimum });
        const zEnd = project({ x: offset, y: floor, z: maximum });
        return [
          <line key={`floor-x-${offset}`} x1={xStart.screenX} y1={xStart.screenY} x2={xEnd.screenX} y2={xEnd.screenY} stroke="#94a3b8" strokeOpacity="0.09" />,
          <line key={`floor-z-${offset}`} x1={zStart.screenX} y1={zStart.screenY} x2={zEnd.screenX} y2={zEnd.screenY} stroke="#94a3b8" strokeOpacity="0.09" />,
        ];
      })}

      {CUBE_EDGES.map(([from, to]) => {
        const first = projectedCorners[from];
        const second = projectedCorners[to];
        const averageDepth = (first.depth + second.depth) / 2;
        return <line key={`${from}-${to}`} x1={first.screenX} y1={first.screenY} x2={second.screenX} y2={second.screenY} stroke="#cbd5e1" strokeOpacity={0.08 + (averageDepth + 1.5) * 0.035} />;
      })}

      {AXES.map(({ label, point, color }) => {
        const endpoint = project(point);
        return (
          <g key={label}>
            <line x1={origin.screenX} y1={origin.screenY} x2={endpoint.screenX} y2={endpoint.screenY} stroke={color} strokeOpacity="0.62" strokeWidth="1.5" />
            <circle cx={endpoint.screenX} cy={endpoint.screenY} r="2.4" fill={color} />
            <text x={endpoint.screenX + 7} y={endpoint.screenY - 7} fill={color} fontSize="10" fontWeight="700">{label}</text>
          </g>
        );
      })}
    </g>
  );
}
