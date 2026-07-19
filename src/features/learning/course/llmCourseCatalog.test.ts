import { describe, expect, test } from 'vitest';
import { LLM_COURSE_LESSONS, LLM_PIPELINE_STAGES, getLlmCourseRoute } from './llmCourseCatalog';

describe('canonical LLM course catalog', () => {
  test('defines one complete learner-centered representation story', () => {
    expect(LLM_COURSE_LESSONS).toHaveLength(10);
    expect(LLM_PIPELINE_STAGES.map(({ id }) => id)).toEqual(['goal', 'tokens', 'vectors', 'blocks', 'context', 'state', 'distribution', 'repeat', 'learn']);
    expect(LLM_COURSE_LESSONS.map(({ id }) => id)).toContain('token-embeddings');

    for (const lesson of LLM_COURSE_LESSONS) {
      expect(lesson.question, lesson.id).toBeTruthy();
      expect(lesson.inputRepresentation, lesson.id).toBeTruthy();
      expect(lesson.operation, lesson.id).toBeTruthy();
      expect(lesson.outputRepresentation, lesson.id).toBeTruthy();
      expect(lesson.checkpoint.choices.length, lesson.id).toBeGreaterThanOrEqual(3);
      expect(lesson.educational.heading, lesson.id).toBeTruthy();
      expect(lesson.educational.takeaway, lesson.id).toBeTruthy();
      expect(lesson.educational.whyItMatters, lesson.id).toBeTruthy();
      expect(lesson.educational.misconception.correction, lesson.id).toBeTruthy();
      expect(lesson.educational.sources.length, lesson.id).toBeGreaterThan(0);
      for (const source of lesson.educational.sources) {
        expect(source.url, lesson.id).toMatch(/^https:\/\//);
        expect(source.note, lesson.id).toBeTruthy();
      }
      expect(lesson.bridgeForward, lesson.id).toBeTruthy();
      expect(getLlmCourseRoute(lesson.id)).toBe(`/learn/how-llm-works/course/${lesson.id}`);
    }

    expect(LLM_COURSE_LESSONS.filter(({ educational }) => educational.mathNote)).not.toHaveLength(LLM_COURSE_LESSONS.length);
    expect(LLM_COURSE_LESSONS.filter(({ educational }) => educational.diagram).length).toBeGreaterThanOrEqual(5);
  });
});
