import { describe, expect, test } from 'vitest';
import { LEARNING_LABS } from './learningCatalog';
import { AGENT_COURSE_LESSONS } from './agentCourse/agentCourseCatalog';
import { AGENT_CHAPTER_LOADERS } from './agentCourse/content/chapterLoaders';
import { LLM_COURSE_LESSONS } from './course/llmCourseCatalog';
import { COURSE_CHAPTER_LOADERS } from './course/content/chapterLoaders';

describe('standalone content inventory', () => {
  test('keeps every canonical lesson connected to theory, an experiment, and a checkpoint', async () => {
    const lessons = [...LLM_COURSE_LESSONS, ...AGENT_COURSE_LESSONS];
    expect(LEARNING_LABS).toHaveLength(19);
    expect(lessons).toHaveLength(18);

    for (const lesson of lessons) {
      expect(lesson.checkpoint.choices.length, `${lesson.id} checkpoint choices`).toBeGreaterThanOrEqual(3);
      expect(lesson.bridgeForward, `${lesson.id} forward bridge`).toBeTruthy();
    }

    for (const lesson of LLM_COURSE_LESSONS) {
      expect((await COURSE_CHAPTER_LOADERS[lesson.id]()).sections.length, `${lesson.id} theory sections`).toBeGreaterThan(0);
    }
    for (const lesson of AGENT_COURSE_LESSONS) {
      expect((await AGENT_CHAPTER_LOADERS[lesson.id]()).sections.length, `${lesson.id} theory sections`).toBeGreaterThan(0);
    }
  });

  test('keeps lab routes unique and under the public learning prefix', () => {
    const routes = LEARNING_LABS.map(({ route }) => route);
    expect(new Set(routes).size).toBe(routes.length);
    expect(routes.every((route) => route.startsWith('/learn/'))).toBe(true);
  });
});
