import { BookOpen, ChevronDown } from 'lucide-react';
import { lazy, Suspense, useEffect, useState } from 'react';
import type { CourseTheory, CourseTheoryChapter } from './content/theoryTypes';

const LazyCourseChapterReader = lazy(() => import('./CourseChapterReader').then(({ CourseChapterReader }) => ({ default: CourseChapterReader })));

export function DeferredChapter({
  content,
  loadChapter,
  accent = 'sky',
  testId,
}: {
  content: CourseTheory;
  loadChapter: () => Promise<CourseTheoryChapter>;
  accent?: 'sky' | 'amber';
  testId: string;
}) {
  const [requested, setRequested] = useState(Boolean(content.chapter));
  const [chapter, setChapter] = useState<CourseTheoryChapter | undefined>(content.chapter);
  const [failed, setFailed] = useState(false);
  const accentText = accent === 'amber' ? 'text-amber-700' : 'text-sky-700';
  const accentBar = accent === 'amber' ? 'bg-amber-500' : 'bg-sky-500';

  useEffect(() => {
    setRequested(Boolean(content.chapter));
    setChapter(content.chapter);
    setFailed(false);
  }, [content.chapter, loadChapter]);

  useEffect(() => {
    if (!requested || chapter || failed) return;
    let active = true;
    loadChapter()
      .then((nextChapter) => { if (active) setChapter(nextChapter); })
      .catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, [chapter, failed, loadChapter, requested]);

  return (
    <details className="group border-y border-stone-300" onToggle={(event) => { if (event.currentTarget.open) setRequested(true); }} data-testid={testId}>
      <summary className="grid min-h-24 cursor-pointer list-none grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 py-4 marker:content-none">
        <BookOpen className={`h-5 w-5 ${accentText}`} />
        <span>
          <span className={`block text-[0.65rem] font-semibold uppercase tracking-[0.2em] ${accentText}`}>Optional reference</span>
          <span className="mt-1 block text-lg font-semibold text-slate-950">Deep dive / reference chapter</span>
          <span className="mt-1 block text-xs leading-5 text-slate-500">Open the complete essay, diagrams, mathematics, exercises, glossary, and sources when you want more depth.</span>
        </span>
        <span className="flex items-center gap-3"><span className="hidden font-mono text-xs text-slate-400 sm:block">{chapter ? `${chapter.estimatedMinutes} min` : 'on demand'}</span><ChevronDown className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180" /></span>
      </summary>
      <div className="border-t border-stone-200">
        {failed ? <p className="py-8 text-sm text-amber-800">The reference chapter could not be loaded. Close and reopen it after refreshing the page.</p> : null}
        {requested && !chapter && !failed ? <div className="py-8" aria-live="polite"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Loading reference chapter</p><div className="mt-4 h-px overflow-hidden bg-stone-200"><div className={`h-full w-1/3 animate-pulse motion-reduce:animate-none ${accentBar}`} /></div></div> : null}
        {chapter ? <Suspense fallback={<p className="py-8 text-sm text-slate-500">Preparing the chapter reader…</p>}><LazyCourseChapterReader content={{ ...content, chapter }} /></Suspense> : null}
      </div>
    </details>
  );
}
