import { DeferredChapter } from './DeferredChapter';
import { COURSE_CHAPTER_LOADERS } from './content/chapterLoaders';
import type { LlmCourseLesson } from './llmCourseCatalog';

export function CourseLessonNotes({ lesson }: { lesson: LlmCourseLesson }) {
  return (
    <DeferredChapter
      content={lesson.educational}
      loadChapter={COURSE_CHAPTER_LOADERS[lesson.id]}
      accent="sky"
      testId="course-lesson-notes"
    />
  );
}
