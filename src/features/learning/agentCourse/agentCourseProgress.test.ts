import { beforeEach, describe, expect, test } from 'vitest';
import { clearAgentCourseProgress, completeAgentLesson, readCompletedAgentLessons } from './agentCourseProgress';

describe('agent course progress', () => {
  beforeEach(() => localStorage.clear());

  test('persists unique completed lessons independently from the LLM course', () => {
    completeAgentLesson('agent-loop');
    completeAgentLesson('agent-loop');
    completeAgentLesson('tool-boundaries');

    expect(readCompletedAgentLessons()).toEqual(['agent-loop', 'tool-boundaries']);
    expect(localStorage.getItem('aiLab.llmCourse.completed.v1')).toBeNull();
  });

  test('recovers from malformed storage and resets safely', () => {
    localStorage.setItem('aiLab.agentCourse.completed.v1', '{broken');
    expect(readCompletedAgentLessons()).toEqual([]);
    completeAgentLesson('capstone');
    clearAgentCourseProgress();
    expect(readCompletedAgentLessons()).toEqual([]);
  });

  test('ignores strings that are not course lesson IDs', () => {
    localStorage.setItem('aiLab.agentCourse.completed.v1', JSON.stringify(['agent-loop', 'invented-lesson', 42]));
    expect(readCompletedAgentLessons()).toEqual(['agent-loop']);
  });
});
