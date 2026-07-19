import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Maximize2, X } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { TeachingMomentContent } from './TeachingMomentCanvas';
import type { LessonTeachingMoments } from './types';

type Accent = 'sky' | 'amber';

export type PresentableLesson = {
  id: string;
  shortTitle: string;
  question: string;
};

export function LessonPresentation({
  curriculumLabel,
  lessons,
  lesson,
  momentsByLesson,
  getRoute,
  accent,
}: {
  curriculumLabel: string;
  lessons: PresentableLesson[];
  lesson: PresentableLesson;
  momentsByLesson: Record<string, LessonTeachingMoments>;
  getRoute: (lessonId: string) => string;
  accent: Accent;
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const frame = useRef<HTMLDivElement>(null);
  const lessonIndex = lessons.findIndex(({ id }) => id === lesson.id);
  const lessonMoments = momentsByLesson[lesson.id].moments;
  const requestedMoment = searchParams.get('moment');
  const requestedIndex = lessonMoments.findIndex(({ id }) => id === requestedMoment);
  const momentIndex = requestedIndex >= 0 ? requestedIndex : 0;
  const moment = lessonMoments[momentIndex];
  const [showNotes, setShowNotes] = useState(searchParams.get('notes') === '1');
  const flatSequence = useMemo(() => lessons.flatMap((candidate) => momentsByLesson[candidate.id].moments.map((candidateMoment) => ({ lesson: candidate, moment: candidateMoment }))), [lessons, momentsByLesson]);
  const sequenceIndex = flatSequence.findIndex((candidate) => candidate.lesson.id === lesson.id && candidate.moment.id === moment.id);
  const previous = flatSequence[sequenceIndex - 1];
  const next = flatSequence[sequenceIndex + 1];

  const goTo = (target: typeof previous) => {
    if (!target) return;
    navigate(`${getRoute(target.lesson.id)}?view=present&moment=${target.moment.id}`);
  };

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof Element && target.matches('input, textarea, select')) return;
      if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') {
        if (event.key === ' ' && target instanceof Element && target.closest('button, a')) return;
        event.preventDefault();
        goTo(next);
      } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        event.preventDefault();
        goTo(previous);
      } else if (event.key.toLowerCase() === 'n') {
        setShowNotes((visible) => !visible);
      } else if (event.key === 'Escape') {
        navigate(`${getRoute(lesson.id)}#lesson-moment-${moment.id}`);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  const requestFullscreen = async () => {
    if (!document.fullscreenElement) await frame.current?.requestFullscreen();
    else await document.exitFullscreen();
  };

  const accentText = accent === 'amber' ? 'text-amber-300' : 'text-sky-300';
  const accentBackground = accent === 'amber' ? 'bg-amber-300' : 'bg-sky-400';

  return (
    <div ref={frame} className="relative flex min-h-[calc(100svh-1rem)] flex-col overflow-hidden rounded-[2rem] bg-slate-950 text-white" data-testid="lesson-presentation">
      <div className="h-1 bg-white/10"><div className={`h-full transition-[width] duration-300 ${accentBackground}`} style={{ width: `${((sequenceIndex + 1) / flatSequence.length) * 100}%` }} /></div>
      <header className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-4 md:px-7">
        <div className="min-w-0">
          <p className={`truncate text-xs font-semibold uppercase tracking-[0.2em] ${accentText}`}>{curriculumLabel} · Lesson {String(lessonIndex + 1).padStart(2, '0')}</p>
          <p className="mt-1 truncate text-xs text-slate-500">{lesson.shortTitle} · moment {momentIndex + 1} of {lessonMoments.length}</p>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setShowNotes((visible) => !visible)} className={`inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10 ${showNotes ? accentText : 'text-slate-400'}`} aria-label="Toggle presenter notes" aria-pressed={showNotes} data-testid="presentation-notes-toggle">{showNotes ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
          <button type="button" onClick={requestFullscreen} className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Toggle full screen"><Maximize2 className="h-4 w-4" /></button>
          <Link to={`${getRoute(lesson.id)}#lesson-moment-${moment.id}`} className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Exit presentation" data-testid="presentation-exit"><X className="h-4 w-4" /></Link>
        </div>
      </header>

      <main key={`${lesson.id}-${moment.id}`} className="learning-enter flex flex-1 items-center px-6 py-10 md:px-12 md:py-14 lg:px-16">
        <TeachingMomentContent moment={moment} accent={accent} present />
      </main>

      {showNotes ? <aside className="border-t border-amber-300/20 bg-amber-300/[0.07] px-6 py-4 text-sm leading-6 text-amber-100 md:px-12" data-testid="presentation-notes"><span className="mr-2 font-semibold uppercase tracking-[0.16em] text-amber-300">Presenter cue</span>{moment.presenterCue}</aside> : null}

      <footer className="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-4 md:px-7">
        <button type="button" onClick={() => goTo(previous)} disabled={!previous} className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-slate-300 hover:bg-white/10 disabled:opacity-25" data-testid="presentation-previous"><ArrowLeft className="h-4 w-4" /> Previous</button>
        <p className="hidden max-w-md truncate text-center text-xs text-slate-600 md:block">{lesson.question}</p>
        <button type="button" onClick={() => goTo(next)} disabled={!next} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-slate-950 disabled:opacity-25" data-testid="presentation-next">Next <ArrowRight className="h-4 w-4" /></button>
      </footer>
    </div>
  );
}
