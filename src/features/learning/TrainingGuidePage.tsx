import { Children, isValidElement, useMemo } from 'react';
import { ArrowLeft, ArrowRight, Presentation } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { Link, useSearchParams } from 'react-router-dom';
import 'katex/dist/katex.min.css';
import { TRAINING_SLIDES } from './trainingSlideCatalog';
import { AGENT_TRAINING_SLIDES } from './trainingSlides/agentCatalog';
import { buildTrainingGuide, type TrainingCurriculum } from './trainingGuides/buildTrainingGuide';
import { MermaidDiagram } from './trainingGuides/MermaidDiagram';

function clampSlide(value: number, count: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(Math.max(Math.trunc(value), 0), count - 1);
}

export function TrainingGuidePage({ curriculum = 'llm' }: { curriculum?: TrainingCurriculum }) {
  const slides = curriculum === 'agent' ? AGENT_TRAINING_SLIDES : TRAINING_SLIDES;
  const guide = useMemo(() => buildTrainingGuide(slides, curriculum), [curriculum, slides]);
  const [searchParams, setSearchParams] = useSearchParams();
  const currentIndex = clampSlide(Number(searchParams.get('slide') ?? '1') - 1, guide.length);
  const section = guide[currentIndex];
  const slidesRoute = curriculum === 'agent' ? '/learn/how-ai-agent-works/slides' : '/learn/how-llm-works/slides';

  const goTo = (index: number) => {
    setSearchParams({ slide: String(clampSlide(index, guide.length) + 1) });
    window.scrollTo?.({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mx-auto max-w-7xl pb-16" data-testid="training-guide-page">
      <header className="border-b border-slate-300 pb-7 pt-3">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className={`text-xs font-semibold uppercase tracking-[0.24em] ${curriculum === 'agent' ? 'text-amber-700' : 'text-sky-700'}`}>Instructor companion · researched theory</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">{curriculum === 'agent' ? 'How AI Agents Work' : 'How LLMs Work'}</h1>
            <p className="mt-3 text-sm text-slate-600">Slide {currentIndex + 1} of {guide.length} · {curriculum === 'agent' ? 'practical theory, product decisions, diagrams, and primary sources' : 'book notes, focused mathematics, diagrams, and primary sources'}</p>
          </div>
          <Link to={`${slidesRoute}?slide=${currentIndex + 1}`} className="inline-flex min-h-11 items-center gap-2 self-start border-b border-slate-950 px-1 text-sm font-semibold text-slate-950 transition hover:gap-3" data-testid="guide-back-to-slide">
            <Presentation className="h-4 w-4" /> Open this slide
          </Link>
        </div>
      </header>

      <div className="grid gap-10 pt-8 lg:grid-cols-[17rem_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100svh-7rem)] lg:overflow-y-auto lg:pr-4">
          <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-slate-500">Slide index</p>
          <nav className="space-y-px" aria-label="Theory guide slides">
            {guide.map((item, index) => (
              <button key={item.id} type="button" onClick={() => goTo(index)} className={`block w-full border-l-2 px-3 py-2 text-left text-xs leading-5 transition ${index === currentIndex ? 'border-slate-950 bg-white font-semibold text-slate-950' : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-950'}`} aria-current={index === currentIndex ? 'page' : undefined} data-testid={`guide-jump-${index + 1}`}>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 bg-white px-6 py-8 shadow-[0_24px_80px_-60px_rgba(15,23,42,0.55)] sm:px-10 md:py-12" data-testid={`guide-section-${currentIndex + 1}`}>
          <article className="prose prose-slate max-w-none prose-headings:tracking-tight prose-h1:text-4xl prose-h1:leading-tight prose-h3:mt-10 prose-h3:text-lg prose-p:leading-8 prose-a:text-sky-700 prose-a:decoration-sky-300 prose-blockquote:border-amber-400 prose-blockquote:bg-amber-50 prose-blockquote:px-5 prose-blockquote:py-1 prose-code:text-sky-800">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                pre({ children, ...props }) {
                  const child = Children.toArray(children)[0];
                  if (isValidElement<{ className?: string; children?: unknown }>(child) && child.props.className === 'language-mermaid') {
                    return <MermaidDiagram chart={String(child.props.children ?? '')} />;
                  }
                  return <pre {...props}>{children}</pre>;
                },
              }}
            >
              {section.markdown}
            </ReactMarkdown>
          </article>

          <footer className="mt-14 grid grid-cols-2 border-t border-stone-200 pt-5">
            <button type="button" disabled={currentIndex === 0} onClick={() => goTo(currentIndex - 1)} className="inline-flex min-h-11 items-center gap-2 justify-self-start text-sm font-semibold text-slate-600 hover:text-slate-950 disabled:opacity-25" data-testid="guide-previous"><ArrowLeft className="h-4 w-4" /> Previous theory</button>
            <button type="button" disabled={currentIndex === guide.length - 1} onClick={() => goTo(currentIndex + 1)} className="inline-flex min-h-11 items-center gap-2 justify-self-end text-sm font-semibold text-slate-950 disabled:opacity-25" data-testid="guide-next">Next theory <ArrowRight className="h-4 w-4" /></button>
          </footer>
        </main>
      </div>
    </div>
  );
}
