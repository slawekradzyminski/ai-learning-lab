import { ChevronDown, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import 'katex/dist/katex.min.css';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { CourseChapterReader } from './CourseChapterReader';
import { COURSE_CHAPTER_LOADERS } from './content/chapterLoaders';
import type { CourseTheoryChapter } from './content/theoryTypes';
import type { LlmCourseLesson } from './llmCourseCatalog';

export function CourseLessonNotes({ lesson }: { lesson: LlmCourseLesson }) {
  const content = lesson.educational;
  const [loaded, setLoaded] = useState<{ lessonId: string; chapter: CourseTheoryChapter } | null>(null);
  const [failedLessonId, setFailedLessonId] = useState<string | null>(null);
  const chapter = content.chapter ?? (loaded?.lessonId === lesson.id ? loaded.chapter : undefined);

  useEffect(() => {
    let active = true;
    const loader = COURSE_CHAPTER_LOADERS[lesson.id];
    if (!content.chapter && loader) {
      loader()
        .then((nextChapter) => {
          if (active) setLoaded({ lessonId: lesson.id, chapter: nextChapter });
        })
        .catch(() => {
          if (active) setFailedLessonId(lesson.id);
        });
    }
    return () => {
      active = false;
    };
  }, [content.chapter, lesson.id]);

  if (chapter) return <div data-testid="course-lesson-notes"><CourseChapterReader content={{ ...content, chapter }} /></div>;

  if (failedLessonId !== lesson.id) {
    return (
      <section className="border-y border-stone-300 py-12" data-testid="course-lesson-notes" aria-live="polite">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Loading the complete explanation</p>
        <div className="mt-5 h-px w-full overflow-hidden bg-stone-200"><div className="h-full w-1/3 animate-pulse bg-sky-500 motion-reduce:animate-none" /></div>
      </section>
    );
  }

  return (
    <section className="border-y border-stone-300 py-10" data-testid="course-lesson-notes">
      <header className="max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">What the experiment showed</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950" data-testid="course-theory-heading">{content.heading}</h2>
        <p className="mt-5 border-l-2 border-sky-500 pl-5 text-lg font-semibold leading-8 text-slate-800">{content.takeaway}</p>
        <p className="mt-7 text-base leading-8 text-slate-700">{content.explanation}</p>
      </header>

      {content.diagram ? (
        <figure className="my-10" aria-label={content.diagram.alt}>
          <MermaidDiagram chart={content.diagram.chart} testId="course-theory-diagram" />
          <figcaption className="mx-auto max-w-3xl text-center text-xs leading-5 text-slate-500"><span className="font-semibold text-slate-700">Read it left to right:</span> {content.diagram.alt}</figcaption>
        </figure>
      ) : null}

      <div className="grid gap-10 border-y border-stone-200 py-8 md:grid-cols-2">
        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Why this matters</p>
          <p className="mt-3 text-sm leading-7 text-slate-700">{content.whyItMatters}</p>
        </section>
        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Common misconception</p>
          <p className="mt-3 text-sm font-semibold leading-7 text-slate-900">“{content.misconception.claim}”</p>
          <p className="mt-2 text-sm leading-7 text-slate-600">{content.misconception.correction}</p>
        </section>
      </div>

      <details className="group border-b border-stone-200">
        <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between text-sm font-semibold text-slate-700 marker:content-none">
          Explore one more variation
          <ChevronDown className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180" />
        </summary>
        <p className="max-w-3xl pb-6 text-sm leading-7 text-slate-600">{content.tryThis}</p>
      </details>

      {content.mathNote ? (
        <details className="group border-b border-stone-200">
          <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between text-sm font-semibold text-slate-600 marker:content-none">
            Optional compact notation
            <ChevronDown className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180" />
          </summary>
          <div className="prose prose-slate max-w-3xl pb-6 text-sm prose-p:leading-7"><ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{content.mathNote}</ReactMarkdown></div>
        </details>
      ) : null}

      <details className="group border-b border-stone-200">
        <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between text-sm font-semibold text-slate-600 marker:content-none">
          Sources and further reading <span className="ml-2 text-xs font-normal text-slate-400">({content.sources.length})</span>
          <ChevronDown className="ml-auto h-4 w-4 text-slate-400 transition-transform group-open:rotate-180" />
        </summary>
        <div className="divide-y divide-stone-200 border-t border-stone-200 pb-2">
          {content.sources.map((source) => (
            <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="group/source grid gap-2 py-4 sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)_auto] sm:items-start sm:gap-6">
              <span className="text-sm font-semibold leading-6 text-slate-800 group-hover/source:text-sky-700">{source.label}</span>
              <span className="text-sm leading-6 text-slate-500">{source.note}</span>
              <ExternalLink className="mt-1 hidden h-3.5 w-3.5 text-slate-400 sm:block" />
            </a>
          ))}
        </div>
      </details>
    </section>
  );
}
