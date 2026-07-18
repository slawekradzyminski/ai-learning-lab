import { useEffect, useRef } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { ArrowLeft, BrainCircuit, Presentation } from 'lucide-react';
import { LEARNING_SECTIONS, getLearningLab, getSectionLabs } from './learningCatalog';
import { cn } from '../../lib/utils';

export function LearningLayout() {
  const location = useLocation();
  const labNavigation = useRef<HTMLElement>(null);
  const activeLabLink = useRef<HTMLAnchorElement>(null);
  const currentLab = getLearningLab(location.pathname);
  const isTrainingSlides = location.pathname === '/learn/training-slides' || location.pathname.endsWith('/slides');
  const sectionLabs = currentLab ? getSectionLabs(currentLab.section) : [];
  const section = currentLab ? LEARNING_SECTIONS.find(({ id }) => id === currentLab.section) : undefined;

  useEffect(() => {
    const navigation = labNavigation.current;
    const activeLink = activeLabLink.current;
    if (!navigation || !activeLink) return;
    const navigationRect = navigation.getBoundingClientRect();
    const activeLinkRect = activeLink.getBoundingClientRect();
    navigation.scrollTo?.({
      left: navigation.scrollLeft + activeLinkRect.left - navigationRect.left - navigation.clientWidth / 2 + activeLinkRect.width / 2,
      behavior: 'auto',
    });
  }, [location.pathname]);

  if (isTrainingSlides) {
    return <div className="pb-6" data-testid="learning-slides-layout"><Outlet /></div>;
  }

  if (!currentLab) {
    return (
      <div className="pb-10" data-testid="learning-layout">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-stone-200/80 pb-5">
          <Link to="/learn" className="flex items-center gap-3" aria-label="AI Learning Lab home">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sky-300"><BrainCircuit className="h-5 w-5" /></span>
            <span><span className="block text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">AI Learning Lab</span><span className="mt-1 block text-sm text-slate-600">Practical workshops for models and agents</span></span>
          </Link>
          <nav className="flex items-center gap-2" aria-label="Course shortcuts">
            <Link to="/learn/how-llm-works/slides?slide=1" className="inline-flex min-h-10 items-center gap-2 rounded-full border border-stone-300 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-stone-50"><Presentation className="h-4 w-4" /> LLM course</Link>
            <Link to="/learn/how-ai-agent-works/slides?slide=1" className="inline-flex min-h-10 items-center gap-2 rounded-full bg-amber-500 px-4 text-xs font-semibold text-slate-950 hover:bg-amber-400"><Presentation className="h-4 w-4" /> Agents course</Link>
          </nav>
        </header>
        <Outlet />
      </div>
    );
  }

  return (
    <div className="pb-10" data-testid="learning-layout">
      <div className="mb-5 flex flex-col gap-4 border-b border-stone-200/80 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to="/learn"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-slate-600 transition hover:-translate-x-0.5 hover:border-stone-300 hover:text-slate-950"
            aria-label="Back to AI Lab overview"
            data-testid="learning-home-link"
          >
            {currentLab ? <ArrowLeft className="h-4 w-4" /> : <BrainCircuit className="h-4 w-4" />}
          </Link>
          <div className="min-w-0">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-sky-700">{section?.title ?? 'AI Learning Lab'}</p>
            <p className="truncate text-sm text-slate-600">
              {sectionLabs.findIndex(({ id }) => id === currentLab.id) + 1} of {sectionLabs.length} · {currentLab.shortTitle}
            </p>
          </div>
        </div>

        <nav ref={labNavigation} className="-mx-1 overflow-x-auto px-1 pb-1" aria-label="AI Learning Lab" data-testid="learning-subnav">
          <div className="flex min-w-max items-center gap-1 rounded-full border border-stone-200 bg-white/80 p-1">
            {sectionLabs.map((lab) => {
              const active = location.pathname === lab.route;
              return (
                <Link
                  ref={active ? activeLabLink : undefined}
                  key={lab.id}
                  to={lab.route}
                  className={cn(
                    'rounded-full px-3 py-2 text-xs font-semibold transition sm:px-4 sm:text-sm',
                    active
                      ? 'bg-slate-950 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-stone-100 hover:text-slate-950',
                  )}
                  aria-current={active ? 'page' : undefined}
                  data-testid={`learning-nav-${lab.id}`}
                >
                  {lab.shortTitle}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      <Outlet />
    </div>
  );
}
