import { describe, expect, test } from 'vitest';
import { assembleContext, evaluateToolCall, getAgentTrace, TEACHING_TOOL_CALLS } from './agentHarnessMath';

describe('agentHarnessMath', () => {
  test('makes failures visible to the next model turn', () => {
    expect(getAgentTrace(true).some(({ detail }) => detail.includes('error is appended'))).toBe(true);
    const trace = getAgentTrace(false);
    expect(trace[trace.length - 1]?.label).toContain('final answer');
  });

  test('compaction fits more useful context into the same budget', () => {
    const raw = assembleContext(150, false);
    const compact = assembleContext(150, true);
    expect(compact.included.length).toBeGreaterThan(raw.included.length);
    expect(compact.used).toBeLessThanOrEqual(150);
  });

  test('validates schema before applying permissions', () => {
    expect(evaluateToolCall(TEACHING_TOOL_CALLS[3], 'trusted').decision).toBe('invalid');
    expect(evaluateToolCall(TEACHING_TOOL_CALLS[1], 'strict').decision).toBe('approval');
    expect(evaluateToolCall(TEACHING_TOOL_CALLS[2], 'strict').decision).toBe('denied');
  });
});
