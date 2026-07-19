import { BookOpen, CheckCircle2, ChevronDown, Clock3, ExternalLink, FlaskConical, Route } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import 'katex/dist/katex.min.css';
import { MermaidDiagram } from '../trainingGuides/MermaidDiagram';
import type { CourseTheory, CourseTheoryDiagram } from './content/theoryTypes';

const markdownPlugins = [remarkGfm, remarkMath];

function ChapterDiagram({ diagram }: { diagram: CourseTheoryDiagram }) {
  return (
    <figure className="my-10 border-y border-stone-200 py-8" aria-labelledby={`${diagram.id}-caption`}>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-sky-700">{diagram.kind} diagram</p>
          <h4 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">{diagram.title}</h4>
        </div>
        <span className="rounded-full border border-stone-300 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-wide text-slate-500">{diagram.provenance}</span>
      </div>
      <MermaidDiagram chart={diagram.chart} testId={`course-chapter-diagram-${diagram.id}`} />
      <figcaption id={`${diagram.id}-caption`} className="mx-auto mt-4 max-w-3xl text-sm leading-6 text-slate-500">
        <span className="font-semibold text-slate-700">What to notice:</span> {diagram.caption}
        <span className="sr-only"> {diagram.alt}</span>
      </figcaption>
    </figure>
  );
}

function SourceList({ content }: { content: CourseTheory }) {
  return (
    <details className="group border-y border-stone-300" data-testid="course-chapter-sources">
      <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-slate-700 marker:content-none">
        Sources and further reading <span className="ml-auto font-mono text-xs font-normal text-slate-400">{content.sources.length}</span>
        <ChevronDown className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180" />
      </summary>
      <div className="divide-y divide-stone-200 border-t border-stone-200 pb-2">
        {content.sources.map((source) => (
          <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="group/source grid gap-2 py-5 sm:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)_auto] sm:gap-7">
            <span className="text-sm font-semibold leading-6 text-slate-800 group-hover/source:text-sky-700">{source.label}</span>
            <span className="text-sm leading-6 text-slate-500">{source.note}</span>
            <ExternalLink className="mt-1 hidden h-3.5 w-3.5 text-slate-400 sm:block" />
          </a>
        ))}
      </div>
    </details>
  );
}

export function CourseChapterReader({ content }: { content: CourseTheory }) {
  const chapter = content.chapter;
  if (!chapter) return null;

  const diagrams = new Map(chapter.diagrams.map((diagram) => [diagram.id, diagram]));
  const renderedDiagramIds = new Set<string>();

  const diagramsForSection = (ids: string[] = []) => ids
    .filter((id) => {
      if (renderedDiagramIds.has(id)) return false;
      renderedDiagramIds.add(id);
      return true;
    })
    .map((id) => diagrams.get(id))
    .filter((diagram): diagram is CourseTheoryDiagram => Boolean(diagram));

  return (
    <section className="border-y border-stone-300 py-12" data-testid="course-theory-chapter">
      <header className="grid gap-8 border-b border-stone-300 pb-10 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-end">
        <div className="max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">The complete explanation</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl" data-testid="course-theory-heading">{content.heading}</h2>
          <p className="mt-6 max-w-3xl border-l-2 border-sky-500 pl-5 text-lg font-semibold leading-8 text-slate-800">{content.takeaway}</p>
        </div>
        <dl className="grid grid-cols-2 gap-x-5 gap-y-4 border-t border-stone-200 pt-5 text-sm lg:grid-cols-1">
          <div className="flex items-center gap-3"><Clock3 className="h-4 w-4 text-sky-700" /><div><dt className="text-xs text-slate-400">Study time</dt><dd className="font-semibold text-slate-800">{chapter.estimatedMinutes} minutes</dd></div></div>
          <div className="flex items-center gap-3"><BookOpen className="h-4 w-4 text-sky-700" /><div><dt className="text-xs text-slate-400">Depth</dt><dd className="font-semibold text-slate-800">Essay + worked example</dd></div></div>
        </dl>
      </header>

      <div className="grid gap-8 border-b border-stone-300 py-8 lg:grid-cols-2 lg:gap-14">
        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Question this chapter answers</p>
          <p className="mt-3 text-lg font-semibold leading-8 text-slate-900">{chapter.question}</p>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Prerequisites</p>
          <p className="mt-3 text-sm leading-7 text-slate-600">{chapter.prerequisites.join(' · ')}</p>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Why this matters</p>
          <p className="mt-3 text-sm leading-7 text-slate-600">{content.whyItMatters}</p>
        </section>
        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">After studying, you can</p>
          <ul className="mt-3 space-y-3">
            {chapter.objectives.map((objective) => <li key={objective} className="flex gap-3 text-sm leading-6 text-slate-700"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-sky-600" />{objective}</li>)}
          </ul>
        </section>
      </div>

      <details className="group border-b border-stone-300 lg:hidden">
        <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between text-sm font-semibold text-slate-700 marker:content-none">
          Jump to a chapter section
          <ChevronDown className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180" />
        </summary>
        <ol className="grid gap-3 pb-6 sm:grid-cols-2">
          {chapter.sections.map((section, index) => <li key={section.id}><a href={`#${section.id}`} className="flex gap-3 text-xs leading-5 text-slate-600"><span className="font-mono text-slate-300">{String(index + 1).padStart(2, '0')}</span><span>{section.heading}</span></a></li>)}
        </ol>
      </details>

      <div className="grid gap-12 pt-10 lg:grid-cols-[13rem_minmax(0,1fr)] xl:gap-20">
        <aside className="hidden lg:block">
          <nav className="sticky top-6 border-l border-stone-300 pl-5" aria-label="Chapter contents">
            <p className="flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate-400"><Route className="h-3.5 w-3.5" /> In this chapter</p>
            <ol className="mt-5 space-y-3">
              {chapter.sections.map((section, index) => <li key={section.id}><a href={`#${section.id}`} className="group flex gap-3 text-xs leading-5 text-slate-500 hover:text-sky-700"><span className="font-mono text-slate-300 group-hover:text-sky-500">{String(index + 1).padStart(2, '0')}</span><span>{section.heading}</span></a></li>)}
            </ol>
            <a href="#chapter-practice" className="mt-5 flex gap-3 border-t border-stone-200 pt-4 text-xs font-semibold text-sky-700"><span className="font-mono text-sky-400">→</span>Practice</a>
          </nav>
        </aside>

        <div className="min-w-0 max-w-4xl">
          {chapter.sections.map((section, index) => (
            <section key={section.id} id={section.id} className="scroll-mt-24 border-b border-stone-200 pb-12 pt-4 first:pt-0">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-sky-700">{String(index + 1).padStart(2, '0')} · {section.eyebrow}</p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">{section.heading}</h3>
              <div className="course-chapter-prose prose prose-slate mt-6 max-w-none prose-headings:scroll-mt-24 prose-headings:font-semibold prose-headings:tracking-tight prose-p:leading-8 prose-a:text-sky-700 prose-strong:text-slate-900 prose-table:text-sm prose-th:text-slate-900 prose-td:align-top prose-code:text-sky-800">
                <ReactMarkdown remarkPlugins={markdownPlugins} rehypePlugins={[rehypeKatex]}>{section.body}</ReactMarkdown>
              </div>
              {diagramsForSection(section.diagramIds).map((diagram) => <ChapterDiagram key={diagram.id} diagram={diagram} />)}
            </section>
          ))}

          <section className="border-b border-stone-300 py-12" data-testid="course-chapter-misconceptions">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-amber-700">Misconception clinic</p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Explanations that sound right—but are not</h3>
            <div className="mt-7 divide-y divide-stone-200 border-y border-stone-200">
              {chapter.misconceptions.map((item) => (
                <details key={item.claim} className="group">
                  <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-5 py-3 text-sm font-semibold leading-6 text-slate-900 marker:content-none">“{item.claim}”<ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" /></summary>
                  <div className="grid gap-5 pb-6 text-sm leading-7 sm:grid-cols-3">
                    <p><span className="block text-xs font-semibold uppercase tracking-wide text-slate-400">Why it sounds plausible</span><span className="mt-1 block text-slate-600">{item.whyPlausible}</span></p>
                    <p><span className="block text-xs font-semibold uppercase tracking-wide text-emerald-700">Correction</span><span className="mt-1 block text-slate-700">{item.correction}</span></p>
                    <p><span className="block text-xs font-semibold uppercase tracking-wide text-sky-700">Diagnostic question</span><span className="mt-1 block text-slate-700">{item.diagnostic}</span></p>
                  </div>
                </details>
              ))}
            </div>
          </section>

          <section id="chapter-practice" className="scroll-mt-8 border-b border-stone-300 py-12" data-testid="course-chapter-exercises">
            <p className="flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-sky-700"><FlaskConical className="h-4 w-4" /> Retrieval and transfer practice</p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Commit to an answer before revealing the reasoning</h3>
            <div className="mt-7 divide-y divide-stone-200 border-y border-stone-200">
              {chapter.exercises.map((exercise, index) => (
                <details key={exercise.id} className="group" data-testid={`course-chapter-exercise-${exercise.id}`}>
                  <summary className="grid min-h-20 cursor-pointer list-none grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 py-4 marker:content-none">
                    <span className="font-mono text-xs text-sky-600">{String(index + 1).padStart(2, '0')}</span>
                    <span><span className="block text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-slate-400">{exercise.kind}</span><span className="mt-1 block text-sm font-semibold leading-6 text-slate-900">{exercise.prompt}</span></span>
                    <ChevronDown className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="ml-11 border-l-2 border-emerald-400 pb-6 pl-5">
                    <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-emerald-700">Reasoned answer</p>
                    <div className="prose prose-slate mt-2 max-w-none text-sm prose-p:leading-7"><ReactMarkdown remarkPlugins={markdownPlugins} rehypePlugins={[rehypeKatex]}>{exercise.answer}</ReactMarkdown></div>
                  </div>
                </details>
              ))}
            </div>
          </section>

          <section className="py-12" data-testid="course-chapter-glossary">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-slate-400">Working vocabulary</p>
            <dl className="mt-6 divide-y divide-stone-200 border-y border-stone-200">
              {chapter.glossary.map(({ term, definition }) => <div key={term} className="grid gap-2 py-4 sm:grid-cols-[11rem_minmax(0,1fr)]"><dt className="font-mono text-sm font-semibold text-slate-900">{term}</dt><dd className="text-sm leading-6 text-slate-600">{definition}</dd></div>)}
            </dl>
          </section>

          <SourceList content={content} />
        </div>
      </div>
    </section>
  );
}
