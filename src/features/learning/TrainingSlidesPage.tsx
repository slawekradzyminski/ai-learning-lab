import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpenText, Expand, Eye, EyeOff, Grid2X2, X } from 'lucide-react';
import {
  TRAINING_SLIDES,
  TRAINING_TRACK_ORDER,
  getLabShortTitle,
  getTrackLabel,
  type TrainingSlideKind,
} from './trainingSlideCatalog';
import { AGENT_TRAINING_SLIDES, AGENT_TRAINING_TRACK_ORDER } from './trainingSlides/agentCatalog';

const kindLabels: Record<TrainingSlideKind, string> = {
  opening: 'Opening',
  track: 'Track map',
  hook: 'Question',
  mechanism: 'Mechanism',
  exercise: 'Practice',
  debrief: 'Debrief',
  recap: 'Synthesis',
};

function clampSlide(index: number, slideCount: number): number {
  if (!Number.isFinite(index)) return 0;
  return Math.min(Math.max(Math.trunc(index), 0), slideCount - 1);
}

function kickerColor(kind: TrainingSlideKind): string {
  if (kind === 'exercise') return 'text-amber-300';
  if (kind === 'debrief') return 'text-emerald-300';
  return 'text-sky-300';
}

export function TrainingSlidesPage({ curriculum = 'llm' }: { curriculum?: 'llm' | 'agent' }) {
  const selectedDeck = curriculum;
  const slides = selectedDeck === 'agent' ? AGENT_TRAINING_SLIDES : TRAINING_SLIDES;
  const trackOrder = selectedDeck === 'agent' ? AGENT_TRAINING_TRACK_ORDER : TRAINING_TRACK_ORDER;
  const deck = useRef<HTMLDivElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const querySlide = Number(searchParams.get('slide') ?? '1') - 1;
  const currentIndex = clampSlide(querySlide, slides.length);
  const [showNotes, setShowNotes] = useState(false);
  const [showOverview, setShowOverview] = useState(false);
  const [fullscreenError, setFullscreenError] = useState<string | null>(null);
  const slide = slides[currentIndex];
  const guideRoute = selectedDeck === 'agent' ? '/learn/how-ai-agent-works/guide' : '/learn/how-llm-works/guide';

  const goTo = useCallback((index: number) => {
    const next = clampSlide(index, slides.length);
    setSearchParams({ slide: String(next + 1) }, { replace: true });
    setShowOverview(false);
  }, [setSearchParams, slides.length]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof Element && target.matches('input, textarea, select')) return;
      if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') {
        if (event.key === ' ' && target instanceof Element && target.closest('button, a')) return;
        event.preventDefault();
        goTo(currentIndex + 1);
      } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        event.preventDefault();
        goTo(currentIndex - 1);
      } else if (event.key === 'Home') {
        event.preventDefault();
        goTo(0);
      } else if (event.key === 'End') {
        event.preventDefault();
        goTo(slides.length - 1);
      } else if (event.key.toLowerCase() === 'n') {
        setShowNotes((visible) => !visible);
      } else if (event.key.toLowerCase() === 'o') {
        setShowOverview((visible) => !visible);
      } else if (event.key === 'Escape') {
        setShowOverview(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentIndex, goTo, slides.length]);

  const requestFullscreen = async () => {
    setFullscreenError(null);
    try {
      if (!document.fullscreenElement) await deck.current?.requestFullscreen();
      else await document.exitFullscreen();
    } catch {
      setFullscreenError('Full-screen mode is unavailable in this browser.');
    }
  };

  const overviewTracks = useMemo(() => trackOrder.map((trackId) => ({
    trackId,
    slides: slides.map((candidate, index) => ({ candidate, index })).filter(({ candidate }) => candidate.trackId === trackId),
  })), [slides, trackOrder]);

  return (
    <div ref={deck} className="relative min-h-[calc(100svh-6rem)] overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-[0_40px_120px_-70px_rgba(15,23,42,1)]" data-testid="training-slides-page">
      <style>{`@keyframes training-slide-enter { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } } .training-slide-enter { animation: training-slide-enter 260ms ease-out both; } [data-testid="training-slides-page"]:fullscreen { min-height: 100svh; border-radius: 0; } @media (prefers-reduced-motion: reduce) { .training-slide-enter { animation: none; } }`}</style>
      <div className="absolute inset-x-0 top-0 h-1 bg-white/10"><div className={`h-full transition-[width] duration-300 motion-reduce:transition-none ${selectedDeck === 'agent' ? 'bg-amber-300' : 'bg-sky-400'}`} style={{ width: `${((currentIndex + 1) / slides.length) * 100}%` }} data-testid="slides-progress" /></div>

      <header className="relative z-20 flex items-center justify-between gap-3 border-b border-white/10 px-4 py-4 md:px-7">
        <div className="flex min-w-0 items-center gap-3"><Link to="/learn" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-slate-300 hover:bg-white/10" aria-label="Back to AI Lab"><ArrowLeft className="h-4 w-4" /></Link><div className="min-w-0"><p className={`truncate text-xs font-semibold uppercase tracking-[0.2em] ${selectedDeck === 'agent' ? 'text-amber-300' : 'text-sky-300'}`}>{slide.chapterLabel}</p><p className="text-xs text-slate-500">{currentIndex + 1} / {slides.length} · {kindLabels[slide.kind]}</p></div></div>
        <div className="flex items-center gap-1">
          <Link to={`${guideRoute}?slide=${currentIndex + 1}`} target="_blank" rel="noreferrer" className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Open theory guide for this slide" title="Open researched theory" data-testid="slides-theory-guide"><BookOpenText className="h-4 w-4" /></Link>
          <button type="button" onClick={() => setShowOverview((visible) => !visible)} className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Open slide overview" data-testid="slides-overview-toggle"><Grid2X2 className="h-4 w-4" /></button>
          <button type="button" onClick={() => setShowNotes((visible) => !visible)} className={`inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10 ${showNotes ? 'text-sky-300' : 'text-slate-400'}`} aria-label="Toggle instructor notes" aria-pressed={showNotes} data-testid="slides-notes-toggle">{showNotes ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
          <button type="button" onClick={requestFullscreen} className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Toggle full screen" data-testid="slides-fullscreen"><Expand className="h-4 w-4" /></button>
        </div>
      </header>

      <main key={slide.id} className="training-slide-enter relative z-10 flex min-h-[calc(100svh-15rem)] flex-col justify-center px-6 py-10 md:px-12 md:py-14 lg:px-16" aria-live="polite" data-testid={`training-slide-${currentIndex + 1}`}>
        <div className="mx-auto w-full max-w-6xl" data-testid="training-slide-frame">
          <p className={`text-xs font-semibold uppercase tracking-[0.25em] ${kickerColor(slide.kind)}`}>{slide.kicker}</p>
          <h1 className="mt-5 max-w-5xl text-3xl font-semibold leading-[1.08] tracking-tight md:text-5xl lg:text-6xl" data-testid="slides-title">{slide.title}</h1>
          {slide.content}
        </div>
      </main>

      {showNotes ? <aside className="relative z-20 border-t border-amber-300/20 bg-amber-300/[0.07] px-6 py-4 text-sm leading-6 text-amber-100 md:px-12" data-testid="slides-notes"><span className="mr-2 font-semibold uppercase tracking-[0.16em] text-amber-300">Instructor cue</span>{slide.notes}</aside> : null}
      {fullscreenError ? <p className="relative z-20 px-6 pb-3 text-xs text-amber-300" role="alert">{fullscreenError}</p> : null}

      <footer className="relative z-20 flex items-center justify-between gap-3 border-t border-white/10 px-4 py-4 md:px-7">
        <button type="button" onClick={() => goTo(currentIndex - 1)} disabled={currentIndex === 0} className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-slate-300 hover:bg-white/10 disabled:opacity-25" data-testid="slides-previous"><ArrowLeft className="h-4 w-4" /> Previous</button>
        <p className="hidden text-xs text-slate-600 sm:block">← → navigate · N notes · O overview</p>
        <button type="button" onClick={() => goTo(currentIndex + 1)} disabled={currentIndex === slides.length - 1} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-slate-950 disabled:opacity-25" data-testid="slides-next">Next <ArrowRight className="h-4 w-4" /></button>
      </footer>

      {showOverview ? (
        <div className="absolute inset-0 z-30 overflow-y-auto bg-slate-950 p-5 md:p-8" data-testid="slides-overview">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-center justify-between"><div><p className={`text-xs font-semibold uppercase tracking-[0.22em] ${selectedDeck === 'agent' ? 'text-amber-300' : 'text-sky-300'}`}>Jump to a teaching moment</p><h2 className="mt-2 text-3xl font-semibold">{slides.length}-slide {selectedDeck === 'agent' ? 'agent harness' : 'LLM'} curriculum map</h2></div><button type="button" onClick={() => setShowOverview(false)} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15" aria-label="Close slide overview"><X className="h-5 w-5" /></button></div>

            <div className="mt-8 grid gap-2 sm:grid-cols-2"><button type="button" onClick={() => goTo(0)} className={`p-4 text-left ${currentIndex === 0 ? 'bg-sky-400 text-slate-950' : 'border border-white/10 hover:bg-white/[0.04]'}`} data-testid="slides-jump-1"><span className="text-xs font-semibold uppercase tracking-[0.16em]">Opening</span><span className="mt-1 block font-semibold">{slides[0].title}</span></button><button type="button" onClick={() => goTo(slides.length - 1)} className={`p-4 text-left ${currentIndex === slides.length - 1 ? 'bg-sky-400 text-slate-950' : 'border border-white/10 hover:bg-white/[0.04]'}`} data-testid={`slides-jump-${slides.length}`}><span className="text-xs font-semibold uppercase tracking-[0.16em]">Closing</span><span className="mt-1 block font-semibold">{slides[slides.length - 1]?.title}</span></button></div>

            <div className="mt-10 space-y-12">{overviewTracks.map(({ trackId, slides }) => {
              const trackSlide = slides.find(({ candidate }) => candidate.kind === 'track');
              const labIds = [...new Set(slides.flatMap(({ candidate }) => candidate.labId ? [candidate.labId] : []))];
              return <section key={trackId} data-testid={`slides-overview-track-${trackId}`}><div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/15 pb-4"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">{getTrackLabel(trackId)}</p><h3 className="mt-2 text-2xl font-semibold">{labIds.length} {labIds.length === 1 ? 'chapter' : 'chapters'}</h3></div>{trackSlide ? <button type="button" onClick={() => goTo(trackSlide.index)} className="border-b border-sky-300 px-3 py-2 text-sm font-semibold text-sky-300" data-testid={`slides-jump-${trackSlide.index + 1}`}>Open track map · {trackSlide.index + 1}</button> : null}</div>
                <div className="mt-5 grid gap-5 lg:grid-cols-2">{labIds.map((labId) => {
                  const labSlides = slides.filter(({ candidate }) => candidate.labId === labId);
                  return <div key={labId} className="border border-white/10 p-4" data-testid={`slides-overview-lab-${labId}`}><p className="text-sm font-semibold text-white">{getLabShortTitle(labId)}</p><div className="mt-3 grid grid-cols-2 gap-1 sm:grid-cols-4">{labSlides.map(({ candidate, index }) => <button key={candidate.id} type="button" onClick={() => goTo(index)} className={`min-h-16 p-2 text-left text-xs transition ${index === currentIndex ? 'bg-sky-400 text-slate-950' : candidate.kind === 'exercise' ? 'bg-amber-300/10 text-amber-200 hover:bg-amber-300/20' : 'bg-white/[0.035] text-slate-400 hover:bg-white/[0.08]'}`} data-testid={`slides-jump-${index + 1}`}><span className="block font-mono opacity-60">{String(index + 1).padStart(2, '0')}</span><span className="mt-1 block font-semibold capitalize">{candidate.kind}</span></button>)}</div></div>;
                })}</div>
              </section>;
            })}</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
