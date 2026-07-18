import { describe, expect, test } from 'vitest';
import { RESIDUAL_LAYERS, residualLayerAt } from './residualStreamMath';

describe('residualStreamMath', () => {
  test('provides a stable inspectable representation for every teaching layer', () => {
    expect(RESIDUAL_LAYERS).toHaveLength(7);
    expect(RESIDUAL_LAYERS.every((layer) => layer.vector.length === 48)).toBe(true);
    expect(RESIDUAL_LAYERS[RESIDUAL_LAYERS.length - 1]?.candidates[0]).toEqual({ token: 'important', probability: 0.71 });
  });

  test('clamps layer selection to the available trace', () => {
    expect(residualLayerAt(-10).layer).toBe(0);
    expect(residualLayerAt(100).layer).toBe(6);
  });
});
