import { describe, expect, test } from 'vitest';
import {
  ATTENTION_EXAMPLES,
  addMatrices,
  applyCausalMask,
  attentionContributions,
  buildAttentionTrace,
  dominantAttentionIndex,
  multiplyMatrices,
  softmaxMaskedRows,
  softmaxRows,
  transpose,
} from './attentionMath';

describe('attention math', () => {
  test('adds, transposes, and multiplies matrices without rounding the calculations', () => {
    expect(addMatrices([[1, 2]], [[0.5, -1]])).toEqual([[1.5, 1]]);
    expect(transpose([[1, 2], [3, 4]])).toEqual([[1, 3], [2, 4]]);
    expect(multiplyMatrices([[1, 2]], [[3], [4]])).toEqual([[11]]);
  });

  test('rejects malformed and incompatible matrices', () => {
    expect(() => addMatrices([[1]], [[1, 2]])).toThrow('same shape');
    expect(() => multiplyMatrices([[1, 2]], [[1, 2]])).toThrow('Inner matrix dimensions');
    expect(() => transpose([[1], [2, 3]])).toThrow('rectangular');
    expect(() => multiplyMatrices([[Number.NaN]], [[1]])).toThrow('finite');
  });

  test('applies a causal mask before a numerically stable row softmax', () => {
    expect(applyCausalMask([[1, 2], [3, 4]])).toEqual([[1, null], [3, 4]]);
    const masked = softmaxMaskedRows([[1, null], [3, 4]]);
    expect(masked[0]).toEqual([1, 0]);
    expect(masked[1][0]).toBeCloseTo(0.268941, 5);
    expect(masked[1][1]).toBeCloseTo(0.731059, 5);

    const stable = softmaxRows([[1000, 1001]]);
    expect(stable[0][0]).toBeCloseTo(0.268941, 5);
    expect(stable[0].reduce((sum, value) => sum + value, 0)).toBeCloseTo(1, 10);
  });

  test('builds the complete subject-signal attention trace', () => {
    const trace = buildAttentionTrace(ATTENTION_EXAMPLES[0]);

    expect(trace.representations[0]).toEqual([1.3, 0]);
    expect(trace.representations[1][0]).toBeCloseTo(0.3, 10);
    expect(trace.representations[1][1]).toBe(0.4);
    expect(trace.representations[2]).toEqual([0.1, 1.2]);
    expect(trace.representations[3]).toEqual([0.8, 1]);
    expect(trace.queries[3][0]).toBeCloseTo(1.4, 10);
    expect(trace.queries[3][1]).toBeCloseTo(0, 10);
    expect(trace.scaledScores[3][0]).toBeCloseTo(1.286934, 5);
    expect(trace.attentionWeights[3].reduce((sum, value) => sum + value, 0)).toBeCloseTo(1, 10);
    expect(dominantAttentionIndex(trace, 3)).toBe(0);
    expect(trace.outputs).toHaveLength(4);
    expect(trace.outputs[3]).toHaveLength(2);
  });

  test('exposes value contributions and the position intervention changes the dominant source', () => {
    const subjectTrace = buildAttentionTrace(ATTENTION_EXAMPLES[0]);
    const positionTrace = buildAttentionTrace(ATTENTION_EXAMPLES[1]);
    const contributions = attentionContributions(subjectTrace, 3);

    expect(contributions).toHaveLength(4);
    expect(contributions[1].weightedValue[0]).toBeCloseTo(
      contributions[1].weight * contributions[1].value[0],
      10,
    );
    expect(dominantAttentionIndex(positionTrace, 3)).toBe(2);
  });

  test('shows why the causal mask matters for earlier output positions', () => {
    const trace = buildAttentionTrace(ATTENTION_EXAMPLES[0]);
    expect(trace.attentionWeights[0]).toEqual([1, 0, 0, 0]);
    expect(trace.unmaskedAttentionWeights[0].slice(1).some((value) => value > 0)).toBe(true);
    expect(() => attentionContributions(trace, 10)).toThrow('outside');
  });
});
