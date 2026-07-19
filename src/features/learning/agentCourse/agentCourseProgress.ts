import type { AgentCourseLessonId } from './agentCourseCatalog';
import { AGENT_COURSE_LESSONS } from './agentCourseCatalog';

const STORAGE_KEY = 'aiLab.agentCourse.completed.v1';

function storage() {
  return typeof window === 'undefined' ? null : window.localStorage;
}

export function readCompletedAgentLessons(): AgentCourseLessonId[] {
  try {
    const raw = storage()?.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    const knownIds = new Set(AGENT_COURSE_LESSONS.map(({ id }) => id));
    return Array.isArray(parsed) ? parsed.filter((value): value is AgentCourseLessonId => typeof value === 'string' && knownIds.has(value as AgentCourseLessonId)) : [];
  } catch {
    return [];
  }
}

export function completeAgentLesson(id: AgentCourseLessonId) {
  const completed = new Set(readCompletedAgentLessons());
  completed.add(id);
  try { storage()?.setItem(STORAGE_KEY, JSON.stringify([...completed])); } catch { /* Progress must never block learning. */ }
  return [...completed];
}

export function clearAgentCourseProgress() {
  try { storage()?.removeItem(STORAGE_KEY); } catch { /* Progress must never block learning. */ }
}
