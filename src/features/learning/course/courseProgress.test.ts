import { beforeEach, describe, expect, test } from 'vitest';
import { clearCourseProgress, completeLesson, readCompletedLessons } from './courseProgress';

describe('LLM course progress', () => {
  beforeEach(() => localStorage.clear());

  test('persists unique completed lesson IDs', () => {
    completeLesson('tokenization');
    completeLesson('tokenization');
    completeLesson('attention');

    expect(readCompletedLessons()).toEqual(['tokenization', 'attention']);
  });

  test('recovers from invalid storage and can reset', () => {
    localStorage.setItem('aiLab.llmCourse.completed.v1', '{broken');
    expect(readCompletedLessons()).toEqual([]);
    completeLesson('prediction-goal');
    clearCourseProgress();
    expect(readCompletedLessons()).toEqual([]);
  });
});
