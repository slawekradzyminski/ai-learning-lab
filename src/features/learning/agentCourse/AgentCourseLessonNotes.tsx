import { useEffect, useState } from 'react';
import { CourseChapterReader } from '../course/CourseChapterReader';
import type { CourseTheoryChapter } from '../course/content/theoryTypes';
import type { AgentCourseLesson } from './agentCourseCatalog';
import { AGENT_CHAPTER_LOADERS } from './content/chapterLoaders';

export function AgentCourseLessonNotes({ lesson }: { lesson: AgentCourseLesson }) {
  const [loaded, setLoaded] = useState<{ lessonId: string; chapter: CourseTheoryChapter } | null>(null);
  const [failedLessonId, setFailedLessonId] = useState<string | null>(null);
  const chapter = loaded?.lessonId === lesson.id ? loaded.chapter : undefined;

  useEffect(() => {
    let active = true;
    setFailedLessonId(null);
    AGENT_CHAPTER_LOADERS[lesson.id]()
      .then((nextChapter) => {
        if (active) setLoaded({ lessonId: lesson.id, chapter: nextChapter });
      })
      .catch(() => {
        if (active) setFailedLessonId(lesson.id);
      });
    return () => { active = false; };
  }, [lesson.id]);

  if (chapter) {
    return <div data-testid="agent-course-lesson-notes"><CourseChapterReader content={{ ...lesson.educational, chapter }} /></div>;
  }

  return (
    <section className="border-y border-stone-300 py-12" data-testid="agent-course-lesson-notes" aria-live="polite">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
        {failedLessonId === lesson.id ? 'The complete chapter could not be loaded' : 'Loading the complete explanation'}
      </p>
      {failedLessonId === lesson.id ? (
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">Refresh the page to retry. The interactive lesson remains available above.</p>
      ) : (
        <div className="mt-5 h-px w-full overflow-hidden bg-stone-200"><div className="h-full w-1/3 animate-pulse bg-amber-500 motion-reduce:animate-none" /></div>
      )}
    </section>
  );
}
