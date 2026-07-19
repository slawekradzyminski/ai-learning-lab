import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LearningLibrary } from './LearningLibrary';
import { LLM_COURSE_LESSONS, getLlmCourseRoute } from './course/llmCourseCatalog';
import { LLM_COURSE_PROMPT } from './course/courseScenario';
import { AGENT_COURSE_LESSONS, getAgentCourseRoute } from './agentCourse/agentCourseCatalog';

export function LearningHomePage() {
  return (
    <div data-testid="learning-home-page">
      <section className="learning-enter grid min-h-[68svh] content-center border-b border-stone-300 py-16 md:min-h-[72svh] md:grid-cols-[minmax(0,1fr)_18rem] md:items-end md:gap-16" data-testid="learning-hero">
        <div className="max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">AI Learning Lab · 10 guided lessons</p>
          <h1 className="mt-6 text-5xl font-semibold leading-[1.02] tracking-[-0.045em] text-slate-950 sm:text-6xl lg:text-7xl" data-testid="learning-home-title">Follow one token through an LLM.</h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600">Start with text. Leave with a practical mental model of tokens, attention, prediction, and learning.</p>
          <Link to={getLlmCourseRoute(LLM_COURSE_LESSONS[0].id)} className="group mt-9 inline-flex min-h-12 items-center gap-3 rounded-full bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-sky-700" data-testid="learning-start-llm">
            Start the course <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-14 border-l border-stone-300 pl-5 font-mono text-sm leading-7 text-slate-500 md:mt-0" aria-label="Course sentence">
          <span className="block text-[0.62rem] font-sans font-semibold uppercase tracking-[0.2em] text-slate-400">One sentence, ten transformations</span>
          <span className="mt-3 block">{LLM_COURSE_PROMPT}<span className="learning-cursor ml-1 text-sky-700">…</span></span>
        </div>
      </section>

      <section className="scroll-mt-20 py-16 md:py-24" id="how-llm-works" data-testid="learning-canonical-llm-course">
        <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">The core path</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">One question at a time.</h2>
            <p className="mt-4 max-w-md text-base leading-7 text-slate-600">Each lesson asks you to predict, inspect the mechanism, and check your understanding before continuing.</p>
          </div>

          <div className="border-t border-stone-300">
            <Link to={getLlmCourseRoute(LLM_COURSE_LESSONS[0].id)} className="group flex items-center justify-between gap-6 border-b border-stone-300 py-6" data-testid="course-primary-path">
              <span><span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Lesson 01</span><span className="mt-2 block text-xl font-semibold text-slate-950">What does a language model actually predict?</span></span>
              <ArrowRight className="h-5 w-5 shrink-0 text-sky-700 transition-transform group-hover:translate-x-1" />
            </Link>
            <details className="group">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between text-sm font-semibold text-slate-600 marker:content-none">
                View the full 10-lesson path
                <span className="text-sky-700 transition-transform group-open:rotate-45">＋</span>
              </summary>
              <ol className="learning-reveal grid border-t border-stone-200 sm:grid-cols-2">
                {LLM_COURSE_LESSONS.map((lesson, index) => (
                  <li key={lesson.id}>
                    <Link to={getLlmCourseRoute(lesson.id)} className="group flex gap-4 border-b border-stone-200 py-4 pr-5 text-sm" data-testid={`course-path-${lesson.id}`}>
                      <span className="font-mono text-xs text-slate-400">{String(index + 1).padStart(2, '0')}</span>
                      <span className="font-semibold text-slate-700 group-hover:text-sky-700">{lesson.shortTitle}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            </details>
          </div>
        </div>
      </section>

      <section className="scroll-mt-20 border-t border-stone-300 py-16 md:py-20" id="how-ai-agent-works" data-testid="learning-canonical-agent-course">
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">After the model</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Follow one goal through an agent.</h2>
            <p className="mt-4 max-w-md text-base leading-7 text-slate-600">Learn how a runtime constructs context, mediates tools, delegates work, records evidence, and decides when to stop.</p>
          </div>
          <div className="border-t border-stone-300">
            <Link to={getAgentCourseRoute(AGENT_COURSE_LESSONS[0].id)} className="group flex items-center justify-between gap-6 border-b border-stone-300 py-6" data-testid="learning-start-agent">
              <span><span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Agent lesson 01</span><span className="mt-2 block text-xl font-semibold text-slate-950">What makes an LLM response become an agent run?</span></span>
              <ArrowRight className="h-5 w-5 shrink-0 text-amber-700 transition-transform group-hover:translate-x-1" />
            </Link>
            <details className="group">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between text-sm font-semibold text-slate-600 marker:content-none">View the full 8-lesson path<span className="text-amber-700 transition-transform group-open:rotate-45">＋</span></summary>
              <ol className="learning-reveal grid border-t border-stone-200 sm:grid-cols-2">
                {AGENT_COURSE_LESSONS.map((lesson, index) => <li key={lesson.id}><Link to={getAgentCourseRoute(lesson.id)} className="group flex gap-4 border-b border-stone-200 py-4 pr-5 text-sm" data-testid={`agent-course-path-${lesson.id}`}><span className="font-mono text-xs text-slate-400">{String(index + 1).padStart(2, '0')}</span><span className="font-semibold text-slate-700 group-hover:text-amber-700">{lesson.shortTitle}</span></Link></li>)}
              </ol>
            </details>
          </div>
        </div>
      </section>

      <LearningLibrary />
    </div>
  );
}
