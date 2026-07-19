import { describe, expect, test } from 'vitest';
import { GLOVE_WORDS } from './gloveWordEmbeddings';
import { findOddOneOut, nearestWords, projectWordSpace, rankSemanticAxis, solveAnalogy } from './wordEmbeddingMath';

describe('real GloVe word-space experiments', () => {
  test('finds semantic neighbors from the real vectors', () => {
    const dog = GLOVE_WORDS.find((row) => row.word === 'dog')!;
    const neighbors = nearestWords(GLOVE_WORDS, dog.vector, ['dog'], 5).map(({ index }) => GLOVE_WORDS[index].word);
    expect(neighbors).toContain('cat');
  });

  test('solves the canonical royalty analogy', () => {
    const result = solveAnalogy(GLOVE_WORDS, 'man', 'king', 'woman');
    expect(result.matches.slice(0, 3).map(({ index }) => GLOVE_WORDS[index].word)).toContain('queen');
  });

  test('scores cereal as the odd meal word', () => {
    expect(findOddOneOut(GLOVE_WORDS, ['breakfast', 'lunch', 'dinner', 'cereal']).odd.word).toBe('cereal');
  });

  test('creates two readable ends of a semantic direction', () => {
    const axis = rankSemanticAxis(GLOVE_WORDS, 'man', 'woman');
    expect(axis.low).toHaveLength(7);
    expect(axis.high).toHaveLength(7);
    expect(axis.low[0].score).toBeLessThan(axis.high[0].score);
  });

  test('spreads the dense vocabulary for display while keeping outliers bounded', () => {
    const points = projectWordSpace(GLOVE_WORDS.map(({ vector }) => vector));
    expect(points).toHaveLength(GLOVE_WORDS.length);
    expect(Math.max(...points.flatMap(({ x, y, z }) => [Math.abs(x), Math.abs(y), Math.abs(z)]))).toBeLessThanOrEqual(1.18);
    expect(points.filter(({ x }) => Math.abs(x) > 0.7).length).toBeGreaterThan(20);
  });
});
