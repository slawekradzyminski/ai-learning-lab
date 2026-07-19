import { describe, expect, test } from 'vitest';
import { LEARNING_LABS } from './learningCatalog';
import { AGENT_COURSE_LESSONS } from './agentCourse/agentCourseCatalog';
import { AGENT_LESSON_MOMENTS } from './agentCourse/content/agentLessonMoments';
import { LLM_COURSE_LESSONS } from './course/llmCourseCatalog';
import { LLM_LESSON_MOMENTS } from './course/content/llmLessonMoments';

describe('standalone content inventory', () => {
  test('keeps every canonical lesson connected to four visible semantic teaching moments', () => {
    const lessonPackages = [
      ...LLM_COURSE_LESSONS.map((lesson) => ({ lesson, lessonMoments: LLM_LESSON_MOMENTS[lesson.id] })),
      ...AGENT_COURSE_LESSONS.map((lesson) => ({ lesson, lessonMoments: AGENT_LESSON_MOMENTS[lesson.id] })),
    ];
    expect(LEARNING_LABS).toHaveLength(19);
    expect(lessonPackages).toHaveLength(18);
    expect(lessonPackages.flatMap(({ lessonMoments }) => lessonMoments.moments)).toHaveLength(72);

    for (const { lesson, lessonMoments } of lessonPackages) {
      expect(lessonMoments.lessonId).toBe(lesson.id);
      expect(lessonMoments.moments.map(({ kind }) => kind), lesson.id).toEqual(['hook', 'mechanism', 'practice', 'debrief']);
      for (const moment of lessonMoments.moments) {
        expect(moment.id).toBe(`${lesson.id}/${moment.kind}`);
        expect(moment.presenterCue).toBeTruthy();
      }
    }
  });

  test('keeps lab routes unique and under the public learning prefix', () => {
    const routes = LEARNING_LABS.map(({ route }) => route);
    expect(new Set(routes).size).toBe(routes.length);
    expect(routes.every((route) => route.startsWith('/learn/'))).toBe(true);
  });
});
