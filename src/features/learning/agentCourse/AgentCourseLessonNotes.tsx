import { DeferredChapter } from '../course/DeferredChapter';
import type { AgentCourseLesson } from './agentCourseCatalog';
import { AGENT_CHAPTER_LOADERS } from './content/chapterLoaders';

export function AgentCourseLessonNotes({ lesson }: { lesson: AgentCourseLesson }) {
  return (
    <DeferredChapter
      content={lesson.educational}
      loadChapter={AGENT_CHAPTER_LOADERS[lesson.id]}
      accent="amber"
      testId="agent-course-lesson-notes"
    />
  );
}
