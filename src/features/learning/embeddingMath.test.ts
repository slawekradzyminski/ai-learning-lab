import { describe, expect, test } from 'vitest';
import {
  cosineSimilarity,
  cosineSimilarityMatrix,
  GUIDED_EMBEDDING_VECTORS,
  projectEmbeddings2d,
  projectEmbeddings3d,
} from './embeddingMath';

describe('embedding math', () => {
  test('calculates cosine similarity and rejects incompatible dimensions', () => {
    expect(cosineSimilarity([1, 0], [1, 0])).toBeCloseTo(1);
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0);
    expect(() => cosineSimilarity([1], [1, 2])).toThrow('dimensions must match');
  });

  test('builds a symmetric similarity matrix with unit diagonal', () => {
    const matrix = cosineSimilarityMatrix(GUIDED_EMBEDDING_VECTORS);

    expect(matrix).toHaveLength(8);
    matrix.forEach((row, index) => {
      expect(row[index]).toBeCloseTo(1);
      row.forEach((value, column) => expect(value).toBeCloseTo(matrix[column][index]));
    });
    expect(matrix[0][1]).toBeGreaterThan(matrix[0][2]);
  });

  test('projects equal-length vectors into finite normalized coordinates deterministically', () => {
    const first = projectEmbeddings2d(GUIDED_EMBEDDING_VECTORS);
    const second = projectEmbeddings2d(GUIDED_EMBEDDING_VECTORS);

    expect(first).toEqual(second);
    expect(first).toHaveLength(8);
    first.forEach(({ x, y }) => {
      expect(x).toBeGreaterThanOrEqual(-1);
      expect(x).toBeLessThanOrEqual(1);
      expect(y).toBeGreaterThanOrEqual(-1);
      expect(y).toBeLessThanOrEqual(1);
    });
  });

  test('projects embeddings into a deterministic bounded 3D space', () => {
    const first = projectEmbeddings3d(GUIDED_EMBEDDING_VECTORS);
    const second = projectEmbeddings3d(GUIDED_EMBEDDING_VECTORS);

    expect(first).toEqual(second);
    expect(first).toHaveLength(8);
    first.forEach(({ x, y, z }) => {
      [x, y, z].forEach((coordinate) => {
        expect(Number.isFinite(coordinate)).toBe(true);
        expect(coordinate).toBeGreaterThanOrEqual(-1);
        expect(coordinate).toBeLessThanOrEqual(1);
      });
    });
  });
});
