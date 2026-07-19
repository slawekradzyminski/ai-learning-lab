import type { EmbeddingPoint3d } from './embeddingMath';

export type Camera = { yaw: number; pitch: number; zoom: number };
export type ScreenPoint = EmbeddingPoint3d & { screenX: number; screenY: number; depth: number; scale: number };
export type ScreenLabel = { x: number; y: number; width: number; leaderX: number; leaderY: number };
export type ProjectionOptions = { perspective?: number; worldScale?: number; centerY?: number };

export const DEFAULT_EMBEDDING_CAMERA: Camera = { yaw: -0.55, pitch: 0.42, zoom: 1 };

export function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function projectPoint(
  point: EmbeddingPoint3d,
  camera: Camera,
  width: number,
  height: number,
  options: ProjectionOptions = {},
): ScreenPoint {
  const cosineYaw = Math.cos(camera.yaw);
  const sineYaw = Math.sin(camera.yaw);
  const yawX = point.x * cosineYaw - point.z * sineYaw;
  const yawZ = point.x * sineYaw + point.z * cosineYaw;
  const cosinePitch = Math.cos(camera.pitch);
  const sinePitch = Math.sin(camera.pitch);
  const pitchY = point.y * cosinePitch - yawZ * sinePitch;
  const pitchZ = point.y * sinePitch + yawZ * cosinePitch;
  const perspectiveDistance = options.perspective ?? 3.8;
  const perspective = perspectiveDistance / (perspectiveDistance - pitchZ);
  const scale = camera.zoom * perspective;
  const worldScale = options.worldScale ?? 0.29;
  const centerY = options.centerY ?? 0.5;

  return {
    ...point,
    screenX: width / 2 + yawX * Math.min(width, height) * worldScale * scale,
    screenY: height * centerY - pitchY * Math.min(width, height) * worldScale * scale,
    depth: pitchZ,
    scale,
  };
}

export function shortEmbeddingLabel(text: string, length = 30) {
  return text.length > length ? `${text.slice(0, length - 1)}…` : text;
}

export function layoutEmbeddingLabels(
  points: ScreenPoint[],
  labels: string[],
  selectedIndex: number,
  width: number,
  height: number,
): ScreenLabel[] {
  const occupied: Array<{ x: number; y: number; width: number; height: number }> = [];
  const result: ScreenLabel[] = Array.from({ length: points.length });
  const order = points
    .map((point, index) => ({ point, index }))
    .sort((left, right) => Number(right.index === selectedIndex) - Number(left.index === selectedIndex)
      || left.point.screenY - right.point.screenY);
  const candidates = [
    { side: 1, dy: -12 }, { side: 1, dy: 14 },
    { side: -1, dy: -12 }, { side: -1, dy: 14 },
    { side: 1, dy: -34 }, { side: 1, dy: 36 },
    { side: -1, dy: -34 }, { side: -1, dy: 36 },
  ];

  order.forEach(({ point, index }) => {
    const labelWidth = clamp(30 + labels[index].length * 6.2, 62, 190);
    const labelHeight = 18;
    const options = candidates.map(({ side, dy }) => {
      const rawX = side > 0 ? point.screenX + 17 : point.screenX - labelWidth - 17;
      const x = clamp(rawX, 8, width - labelWidth - 8);
      const y = clamp(point.screenY + dy - labelHeight / 2, 8, height - labelHeight - 8);
      return {
        x,
        y,
        width: labelWidth,
        leaderX: side > 0 ? x - 4 : x + labelWidth + 4,
        leaderY: y + labelHeight / 2,
      };
    });
    const label = options.find((option) => occupied.every((box) =>
      option.x + option.width + 5 < box.x
      || box.x + box.width + 5 < option.x
      || option.y + labelHeight + 3 < box.y
      || box.y + box.height + 3 < option.y)) ?? options[options.length - 1];

    occupied.push({ x: label.x, y: label.y, width: label.width, height: labelHeight });
    result[index] = label;
  });

  return result;
}
