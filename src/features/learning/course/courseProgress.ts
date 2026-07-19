import type { LlmCourseLessonId } from './llmCourseCatalog';

const STORAGE_KEY = 'aiLab.llmCourse.completed.v1';

function readStorage() {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}
export function readCompletedLessons(): LlmCourseLessonId[] {
  try {
    const raw = readStorage()?.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((value): value is LlmCourseLessonId => typeof value === 'string') : [];
  } catch {
    return [];
  }
}

export function completeLesson(id: LlmCourseLessonId) {
  const completed = new Set(readCompletedLessons());
  completed.add(id);
  readStorage()?.setItem(STORAGE_KEY, JSON.stringify([...completed]));
  return [...completed];
}

export function clearCourseProgress() {
  readStorage()?.removeItem(STORAGE_KEY);
}
