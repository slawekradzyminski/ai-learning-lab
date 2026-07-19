import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, ArrowRight, Presentation, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { LessonTeachingMoments, TeachingMoment, TeachingMomentKind } from './types';

type Accent = 'sky' | 'amber';

const kindLabels: Record<TeachingMomentKind, string> = {
  hook: 'Begin with a question',
  mechanism: 'Smallest useful mechanism',
  practice: 'Commit before trying',
  debrief: 'What changed—and what did not',
};

function accentClasses(accent: Accent) {
  return accent === 'amber'
    ? { text: 'text-amber-300', border: 'border-amber-300', soft: 'bg-amber-300/10 text-amber-100' }
    : { text: 'text-sky-300', border: 'border-sky-400', soft: 'bg-sky-400/10 text-sky-100' };
}

export function TeachingMomentContent({
  moment,
  accent,
  present = false,
}: {
  moment: TeachingMoment;
  accent: Accent;
  present?: boolean;
}) {
  const color = accentClasses(accent);

  return (
    <div className={present ? 'mx-auto w-full max-w-6xl' : ''} data-testid={`teaching-moment-${moment.id}`}>
      <p className={`text-[0.65rem] font-semibold uppercase tracking-[0.24em] ${color.text}`}>
        {moment.eyebrow} · {kindLabels[moment.kind]}
      </p>
      <h2 className={`mt-4 max-w-5xl font-semibold leading-[1.08] tracking-[-0.035em] text-white ${present ? 'text-4xl md:text-6xl' : 'text-3xl md:text-5xl'}`}>
        {moment.title}
      </h2>
      <p className={`mt-6 max-w-3xl leading-8 text-slate-300 ${present ? 'text-lg md:text-xl' : 'text-base'}`}>{moment.summary}</p>

      {moment.steps?.length ? (
        <div className={`mt-8 grid gap-px bg-white/10 ${moment.steps.length > 2 ? 'md:grid-cols-2 xl:grid-cols-4' : 'md:grid-cols-2'}`}>
          {moment.steps.map((step, index) => (
            <div key={`${moment.id}-${step.label}`} className="bg-slate-950 p-5 md:p-6">
              <p className={`text-[0.65rem] font-semibold uppercase tracking-[0.18em] ${color.text}`}>{String(index + 1).padStart(2, '0')} · {step.label}</p>
              <p className="mt-4 font-mono text-base font-semibold leading-7 text-white md:text-lg">{step.expression}</p>
              <p className="mt-3 text-sm leading-6 text-slate-400">{step.copy}</p>
            </div>
          ))}
        </div>
      ) : null}

      {moment.prompt ? <p className={`mt-7 border-l-2 ${color.border} pl-5 text-base font-semibold leading-7 text-white`}>{moment.prompt}</p> : null}
      <p className={`mt-7 max-w-4xl border-l-2 ${color.border} pl-5 text-base leading-7 text-slate-200`}><span className={`mr-2 text-xs font-semibold uppercase tracking-[0.18em] ${color.text}`}>Retain</span>{moment.takeaway}</p>
    </div>
  );
}

export function LessonVisualIntroduction({
  lesson,
  accent,
  courseRoute,
  experimentId,
}: {
  lesson: LessonTeachingMoments;
  accent: Accent;
  courseRoute: string;
  experimentId: string;
}) {
  const [open, setOpen] = useState(false);
  const [momentIndex, setMomentIndex] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const moment = lesson.moments[momentIndex];
  const isLast = momentIndex === lesson.moments.length - 1;
  const accentText = accent === 'amber' ? 'text-amber-700' : 'text-sky-700';
  const accentButton = accent === 'amber' ? 'bg-amber-300 hover:bg-amber-200' : 'bg-sky-400 hover:bg-sky-300';
  const accentProgress = accent === 'amber' ? 'bg-amber-300' : 'bg-sky-400';

  const openIntroduction = () => {
    setMomentIndex(0);
    setOpen(true);
  };

  const closeIntroduction = () => setOpen(false);

  const continueToExperiment = () => {
    setOpen(false);
    requestAnimationFrame(() => document.getElementById(experimentId)?.scrollIntoView?.({ behavior: 'smooth', block: 'start' }));
  };

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const appRoot = document.getElementById('root');
    document.body.style.overflow = 'hidden';
    if (appRoot) appRoot.inert = true;
    requestAnimationFrame(() => closeRef.current?.focus());
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
      else if (event.key === 'ArrowRight') setMomentIndex((index) => Math.min(index + 1, lesson.moments.length - 1));
      else if (event.key === 'ArrowLeft') setMomentIndex((index) => Math.max(index - 1, 0));
      else if (event.key === 'Tab') {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      if (appRoot) appRoot.inert = false;
      window.removeEventListener('keydown', handleKey);
      triggerRef.current?.focus();
    };
  }, [lesson.moments.length, open]);

  return (
    <>
      <section
        id={`lesson-visual-introduction-${lesson.lessonId}`}
        className="scroll-mt-20 border-y border-stone-300 py-7"
        data-testid="lesson-visual-introduction"
      >
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <p className={`text-[0.65rem] font-semibold uppercase tracking-[0.2em] ${accentText}`}>Optional visual introduction · 4 moments</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Orient yourself before the experiment.</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Open a short, focused walkthrough of the question, mechanism, practice brief, and interpretation. Close it at any time to continue reading.</p>
          </div>
          <button
            ref={triggerRef}
            type="button"
            onClick={openIntroduction}
            className={`group inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold text-slate-950 transition ${accentButton}`}
            data-testid="open-lesson-introduction"
          >
            <Presentation className="h-4 w-4" /> Start visual introduction <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </section>

      {open ? createPortal((
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-2 backdrop-blur-md md:p-6"
          onMouseDown={(event) => { if (event.currentTarget === event.target) closeIntroduction(); }}
          data-testid="lesson-introduction-backdrop"
        >
          <section
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="lesson-introduction-title"
            className="learning-enter flex max-h-[calc(100svh-1rem)] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-2xl md:max-h-[calc(100svh-3rem)]"
            data-testid="lesson-introduction-dialog"
          >
            <div className="h-1 bg-white/10">
              <div className={`h-full transition-[width] duration-300 ${accentProgress}`} style={{ width: `${((momentIndex + 1) / lesson.moments.length) * 100}%` }} />
            </div>
            <header className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4 md:px-8">
              <div>
                <p id="lesson-introduction-title" className={`text-[0.65rem] font-semibold uppercase tracking-[0.2em] ${accent === 'amber' ? 'text-amber-300' : 'text-sky-300'}`}>Visual introduction</p>
                <p className="mt-1 text-xs text-slate-500">Moment {momentIndex + 1} of {lesson.moments.length}</p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to={`${courseRoute}?view=present&moment=${moment.id}`}
                  className="hidden min-h-10 items-center gap-2 rounded-full px-4 text-xs font-semibold text-slate-400 transition hover:bg-white/10 hover:text-white sm:inline-flex"
                  data-testid="present-lesson"
                >
                  <Presentation className="h-4 w-4" /> Presenter view
                </Link>
                <button ref={closeRef} type="button" onClick={closeIntroduction} className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition hover:bg-white/10 hover:text-white" aria-label="Close visual introduction" data-testid="close-lesson-introduction"><X className="h-4 w-4" /></button>
              </div>
            </header>

            <main key={moment.id} className="learning-enter overflow-y-auto px-6 py-8 md:px-10 md:py-10">
              <TeachingMomentContent moment={moment} accent={accent} />
            </main>

            <footer className="flex items-center justify-between gap-2 border-t border-white/10 px-3 py-3 sm:gap-3 sm:px-4 sm:py-4 md:px-8">
              <button type="button" onClick={() => setMomentIndex((index) => Math.max(index - 1, 0))} disabled={momentIndex === 0} className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 disabled:opacity-25 sm:px-4" aria-label="Previous introduction moment" data-testid="introduction-previous"><ArrowLeft className="h-4 w-4" /><span className="hidden sm:inline">Previous</span></button>
              <div className="hidden gap-1.5 sm:flex" aria-hidden="true">
                {lesson.moments.map((candidate, index) => <span key={candidate.id} className={`h-1.5 rounded-full transition-all ${index === momentIndex ? `w-7 ${accentProgress}` : 'w-1.5 bg-white/20'}`} />)}
              </div>
              {isLast ? (
                <button type="button" onClick={continueToExperiment} className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-slate-950 transition sm:px-5 ${accentButton}`} data-testid="introduction-continue"><span className="sm:hidden">Continue</span><span className="hidden sm:inline">Continue to experiment</span><ArrowRight className="h-4 w-4" /></button>
              ) : (
                <button type="button" onClick={() => setMomentIndex((index) => Math.min(index + 1, lesson.moments.length - 1))} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 sm:px-5" data-testid="introduction-next">Next <ArrowRight className="h-4 w-4" /></button>
              )}
            </footer>
          </section>
        </div>
      ), document.body) : null}
    </>
  );
}
