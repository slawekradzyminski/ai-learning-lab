import { describe, expect, test } from 'vitest';
import { probabilityAll, probabilityAtLeastOne, runTeachingEval } from './agentEvaluation';

describe('agent evaluation teaching simulation', () => {
  test('runs a deterministic 20-trial regression suite', () => {
    const run = runTeachingEval('focused', 'clear', 'regression');

    expect(run.trials).toHaveLength(20);
    expect(run.trials.filter((trial) => trial.success)).toHaveLength(17);
    expect(run.successRate).toBe(0.85);
    expect(run.trials[0].grades.map((grade) => grade.kind)).toEqual(['code', 'code', 'model', 'human']);
  });

  test('shows that a critique loop can raise quality while reducing consistency', () => {
    const focused = runTeachingEval('focused', 'clear', 'regression');
    const critique = runTeachingEval('critique-loop', 'clear', 'regression');

    expect(critique.meanQuality).toBeGreaterThan(focused.meanQuality);
    expect(critique.passPower3).toBeLessThan(focused.passPower3);
    expect(critique.totalCostUsd).toBeGreaterThan(focused.totalCostUsd);
  });

  test('keeps pass-at-k and pass-power-k conceptually distinct', () => {
    expect(probabilityAtLeastOne(0.75, 3)).toBeCloseTo(0.984375);
    expect(probabilityAll(0.75, 3)).toBeCloseTo(0.421875);
  });

  test('moves failed trials between batches without changing aggregate reliability', () => {
    const first = runTeachingEval('focused', 'ambiguous', 'capability', 0);
    const second = runTeachingEval('focused', 'ambiguous', 'capability', 1);

    expect(second.successRate).toBe(first.successRate);
    expect(second.trials.map((trial) => trial.success)).not.toEqual(first.trials.map((trial) => trial.success));
  });
});
