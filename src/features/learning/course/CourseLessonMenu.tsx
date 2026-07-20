import { Check, ChevronDown } from 'lucide-react';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { LLM_COURSE_LESSONS, getLlmCourseRoute, type LlmCourseLesson, type LlmCourseLessonId } from './llmCourseCatalog';

export function CourseLessonMenu({ lesson, completed }: { lesson: LlmCourseLesson; completed: Set<LlmCourseLessonId> }) {
  const menuRef = useRef<HTMLDetailsElement>(null);

  return (
    <details ref={menuRef} className="group relative z-30 ml-auto shrink-0" data-testid="course-lesson-menu">
      <summary
        className="flex min-h-10 cursor-pointer list-none items-center gap-2 text-xs font-semibold text-slate-500 marker:content-none transition hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-600"
        aria-label={`${completed.size} of ${LLM_COURSE_LESSONS.length} lessons complete. Open lesson list.`}
      >
        <span data-testid="course-progress"><span className="font-mono text-sky-700">{completed.size}/{LLM_COURSE_LESSONS.length}</span> complete</span>
        <ChevronDown className="h-4 w-4 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" />
      </summary>
      <nav className="learning-reveal absolute right-0 top-12 w-[min(24rem,calc(100vw-2rem))] border border-stone-200 bg-white py-2 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.5)]" aria-label="LLM course lessons">
        {LLM_COURSE_LESSONS.map((candidate, index) => {
          const done = completed.has(candidate.id);
          const current = candidate.id === lesson.id;
          return (
            <Link
              key={candidate.id}
              to={getLlmCourseRoute(candidate.id)}
              onClick={() => menuRef.current?.removeAttribute('open')}
              className={`flex min-h-11 items-center gap-3 px-4 text-sm font-semibold transition hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-sky-600 ${current ? 'bg-sky-50 text-sky-800' : 'text-slate-700'}`}
              aria-current={current ? 'step' : undefined}
              data-testid={`pipeline-${candidate.stage}`}
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center font-mono text-[0.65rem] text-slate-400">{done ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : String(index + 1).padStart(2, '0')}</span>
              <span className="min-w-0 flex-1">{candidate.shortTitle}</span>
              {current && <span className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-sky-600">Current</span>}
            </Link>
          );
        })}
      </nav>
    </details>
  );
}
