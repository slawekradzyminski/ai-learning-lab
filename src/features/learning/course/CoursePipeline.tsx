import { Check, ChevronDown } from 'lucide-react';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { LLM_COURSE_LESSONS, getLlmCourseRoute, type LlmCourseLesson, type LlmCourseLessonId } from './llmCourseCatalog';

export function CoursePipeline({ lesson, completed }: { lesson: LlmCourseLesson; completed: Set<LlmCourseLessonId> }) {
  const currentIndex = LLM_COURSE_LESSONS.findIndex(({ id }) => id === lesson.id);
  const lessonMenuRef = useRef<HTMLDetailsElement>(null);

  const closeLessonMenu = () => {
    lessonMenuRef.current?.removeAttribute('open');
  };

  return (
    <nav className="sticky top-0 z-20 border-y border-stone-200 bg-[hsla(42,23%,95%,0.94)] py-3 backdrop-blur" aria-label="Course progress" data-testid="course-pipeline">
      <div className="flex items-center gap-5">
        <p className="shrink-0 text-sm font-semibold text-slate-950"><span className="mr-2 font-mono text-xs text-sky-700">{String(currentIndex + 1).padStart(2, '0')}</span>{lesson.shortTitle}</p>
        <div className="hidden h-px flex-1 overflow-hidden bg-stone-300 sm:block" aria-hidden="true">
          <div className="h-full bg-sky-600 transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${((currentIndex + 1) / LLM_COURSE_LESSONS.length) * 100}%` }} />
        </div>
        <span className="hidden shrink-0 font-mono text-xs text-slate-400 sm:block">{currentIndex + 1}/{LLM_COURSE_LESSONS.length}</span>

        <details ref={lessonMenuRef} className="group relative ml-auto shrink-0" data-testid="course-lesson-menu">
          <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 text-xs font-semibold text-slate-600 marker:content-none hover:text-slate-950">
            All lessons <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
          </summary>
          <div className="learning-reveal absolute right-0 top-12 z-30 w-[min(22rem,calc(100vw-2rem))] border border-stone-200 bg-white p-2 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.5)]">
            {LLM_COURSE_LESSONS.map((candidate, index) => {
              const done = completed.has(candidate.id);
              return (
                <Link key={candidate.id} to={getLlmCourseRoute(candidate.id)} onClick={closeLessonMenu} className={`flex min-h-10 items-center gap-3 px-3 text-sm font-semibold transition hover:bg-stone-50 ${candidate.id === lesson.id ? 'text-sky-700' : 'text-slate-700'}`} aria-current={candidate.id === lesson.id ? 'step' : undefined} data-testid={`pipeline-${candidate.stage}`}>
                  <span className="flex h-5 w-5 items-center justify-center font-mono text-[0.65rem] text-slate-400">{done ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : String(index + 1).padStart(2, '0')}</span>
                  {candidate.shortTitle}
                </Link>
              );
            })}
          </div>
        </details>
      </div>
    </nav>
  );
}
