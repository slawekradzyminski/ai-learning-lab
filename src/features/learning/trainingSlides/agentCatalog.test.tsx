import { describe, expect, test } from 'vitest';
import { AGENT_EXERCISE_SLIDE_BY_LAB, AGENT_TRAINING_SLIDES } from './agentCatalog';

describe('agent training slide catalog', () => {
  test('builds an independent 33-slide agent curriculum', () => {
    expect(AGENT_TRAINING_SLIDES).toHaveLength(33);
    expect(AGENT_TRAINING_SLIDES[0]).toMatchObject({ kind: 'opening' });
    expect(AGENT_TRAINING_SLIDES[AGENT_TRAINING_SLIDES.length - 1]).toMatchObject({ kind: 'recap' });
    expect(AGENT_EXERCISE_SLIDE_BY_LAB).toEqual({
      'agent-loop': 5,
      subagents: 9,
      'context-harness': 14,
      'memory-instructions': 18,
      'hooks-lifecycle': 23,
      'tool-boundaries': 27,
      'agent-evals': 31,
    });
  });
});
