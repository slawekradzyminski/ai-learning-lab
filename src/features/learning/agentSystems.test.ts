import { describe, expect, test } from 'vitest';
import { getContextLifecycleOutcome } from './contextLifecycle';
import { evaluateHookSelection, HOOK_SCENARIOS } from './hookLifecycle';
import { evaluateMemoryPlacement, MEMORY_SCENARIOS } from './memoryPlacement';
import { simulateDelegation } from './subagentSimulation';

describe('agent system simulations', () => {
  test('separates restored sessions from warm inference caches', () => {
    const resumed = getContextLifecycleOutcome('resume');
    expect(resumed.cache).toBe('cold');
    expect(resumed.persistenceCopy).toContain('different lifetimes');
  });

  test('keeps required rules and secrets in different stores', () => {
    expect(evaluateMemoryPlacement(MEMORY_SCENARIOS[0], 'instructions').correct).toBe(true);
    expect(evaluateMemoryPlacement(MEMORY_SCENARIOS[5], 'memory').correct).toBe(false);
  });

  test('chooses the earliest useful hook event', () => {
    expect(evaluateHookSelection(HOOK_SCENARIOS[0], 'pre-tool').correct).toBe(true);
    expect(evaluateHookSelection(HOOK_SCENARIOS[0], 'post-tool').correct).toBe(false);
  });

  test('shows speed, token, and write-isolation tradeoffs', () => {
    const sequential = simulateDelegation('bounded', false, false);
    const parallel = simulateDelegation('bounded', true, false);
    const conflicting = simulateDelegation('overlap', true, false);
    const isolated = simulateDelegation('overlap', true, true);

    expect(parallel.elapsedMinutes).toBeLessThan(sequential.elapsedMinutes);
    expect(parallel.totalTokens).toBe(sequential.totalTokens);
    expect(conflicting.conflict).toBe(true);
    expect(isolated.conflict).toBe(false);
    expect(isolated.mergeRequired).toBe(true);
  });
});
