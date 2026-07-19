import { describe, expect, test } from 'vitest';
import { layoutEmbeddingLabels, type ScreenPoint } from './embeddingSpace3dGeometry';

function point(screenX: number, screenY: number): ScreenPoint {
  return { x: 0, y: 0, z: 0, depth: 0, scale: 1, screenX, screenY };
}

describe('3D embedding label layout', () => {
  test('separates labels for overlapping projected points', () => {
    const labels = layoutEmbeddingLabels(
      [point(300, 220), point(302, 221), point(304, 222)],
      ['1 · animal', '2 · dog', '3 · street'],
      0,
      820,
      520,
    );

    expect(new Set(labels.map(({ x, y }) => `${x}:${y}`))).toHaveLength(3);
    labels.forEach(({ x, y, width }) => {
      expect(x).toBeGreaterThanOrEqual(8);
      expect(x + width).toBeLessThanOrEqual(812);
      expect(y).toBeGreaterThanOrEqual(8);
      expect(y).toBeLessThanOrEqual(494);
    });
  });
});
