import { useEffect, useRef } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { LEARNING_SECTIONS, getLearningLab, getSectionLabs } from './learningCatalog';
import { cn } from '../../lib/utils';

function BackToPlatform() {
  return (
    <a href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-slate-950" data-testid="back-to-awesome-localstack" data-navigation="document">
      <ArrowLeft className="h-3.5 w-3.5" /> Awesome LocalStack
    </a>
  );
}

export function LearningLayout() {
  const location = useLocation();
  const labNavigation = useRef<HTMLElement>(null);
  const activeLabLink = useRef<HTMLAnchorElement>(null);
  const currentLab = getLearningLab(location.pathname);
  const isTrainingSlides = location.pathname === '/learn/training-slides' || location.pathname.endsWith('/slides');
  const isCourse = location.pathname.startsWith('/learn/how-llm-works/course') || location.pathname.startsWith('/learn/how-ai-agent-works/course');
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

  if (isCourse) {
    return <div data-testid="learning-course-layout"><Outlet /></div>;
  }

  if (!currentLab) {
    return (
      <div className="pb-10" data-testid="learning-layout">
        <header className="flex min-h-12 items-center justify-between border-b border-stone-200">
          <Link to="/learn" className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-950" aria-label="AI Learning Lab home">AI Learning Lab</Link>
          <BackToPlatform />
        </header>
        <Outlet />
      </div>
    );
  }

  return (
    <div className="pb-10" data-testid="learning-layout">
      <div className="mb-3"><BackToPlatform /></div>
      <div className="mb-5 flex flex-col gap-4 border-b border-stone-200/80 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to="/learn"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-slate-600 transition hover:-translate-x-0.5 hover:border-stone-300 hover:text-slate-950"
            aria-label="Back to AI Lab overview"
            data-testid="learning-home-link"
          >
            <ArrowLeft className="h-4 w-4" />
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
