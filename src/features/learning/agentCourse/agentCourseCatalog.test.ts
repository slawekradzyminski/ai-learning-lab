import { describe, expect, test } from 'vitest';
import { AGENT_COURSE_LESSONS, getAgentCourseRoute } from './agentCourseCatalog';

describe('canonical AI Agents course catalog', () => {
  test('forms one complete, unique path from loop to system evaluation', () => {
    expect(AGENT_COURSE_LESSONS).toHaveLength(8);
    expect(AGENT_COURSE_LESSONS.map(({ id }) => id)).toEqual(['agent-loop', 'subagents', 'context-harness', 'memory-instructions', 'hooks-lifecycle', 'tool-boundaries', 'agent-evals', 'capstone']);
    expect(new Set(AGENT_COURSE_LESSONS.map(({ id }) => id)).size).toBe(8);
    expect(AGENT_COURSE_LESSONS.every(({ bridgeForward }) => bridgeForward.length > 40)).toBe(true);
    expect(getAgentCourseRoute('agent-loop')).toBe('/learn/how-ai-agent-works/course/agent-loop');
  });

  test('keeps theory, lab, and checkpoint connected', () => {
    for (const lesson of AGENT_COURSE_LESSONS) {
      expect(lesson.educational.sources.length, `${lesson.id} sources`).toBeGreaterThanOrEqual(3);
      expect(lesson.checkpoint.choices.length, `${lesson.id} checkpoint choices`).toBeGreaterThanOrEqual(3);
      expect(lesson.inputRepresentation).toBeTruthy();
      expect(lesson.operation).toBeTruthy();
      expect(lesson.outputRepresentation).toBeTruthy();
    }
  });
});
