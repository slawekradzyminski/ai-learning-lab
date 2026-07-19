import { ArrowRight, BookOpenText, FlaskConical, Presentation, SquareActivity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../../components/ui/badge';
import { getSectionLabs, getSectionTracks, type LearningSectionId } from './learningCatalog';
import { TRAINING_SLIDES } from './trainingSlideCatalog';
import { AGENT_TRAINING_SLIDES } from './trainingSlides/agentCatalog';
import type { TrainingSlideDefinition, TrainingSlideKind } from './trainingSlides/types';
import { AGENT_COURSE_LESSONS, getAgentCourseRoute } from './agentCourse/agentCourseCatalog';
import { LLM_COURSE_LESSONS, getLlmCourseRoute } from './course/llmCourseCatalog';

type Curriculum = 'llm' | 'agent';

function slideNumber(slides: TrainingSlideDefinition[], labId: string, kind: TrainingSlideKind): number | undefined {
  const index = slides.findIndex((slide) => slide.labId === labId && slide.kind === kind);
  return index >= 0 ? index + 1 : undefined;
}

function MaterialLink({ to, label }: { to: string; label: string }) {
  return <Link to={to} className="inline-flex min-h-10 items-center gap-1.5 border-b border-stone-300 px-1 text-xs font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950">{label}<ArrowRight className="h-3.5 w-3.5" /></Link>;
}

export function CourseMaterialsPage({ curriculum }: { curriculum: Curriculum }) {
  const sectionId: LearningSectionId = curriculum === 'agent' ? 'agent' : 'llm';
  const labs = getSectionLabs(sectionId);
  const tracks = getSectionTracks(sectionId);
  const slides = curriculum === 'agent' ? AGENT_TRAINING_SLIDES : TRAINING_SLIDES;
  const slidesRoute = curriculum === 'agent' ? '/learn/how-ai-agent-works/slides' : '/learn/how-llm-works/slides';
  const guideRoute = curriculum === 'agent' ? '/learn/how-ai-agent-works/guide' : '/learn/how-llm-works/guide';
  const courseRoute = curriculum === 'agent' ? '/learn/how-ai-agent-works/course/agent-loop' : '/learn/how-llm-works/course/prediction-goal';
  const canonicalLessons = curriculum === 'agent'
    ? AGENT_COURSE_LESSONS.map((lesson) => ({ ...lesson, route: getAgentCourseRoute(lesson.id) }))
    : LLM_COURSE_LESSONS.map((lesson) => ({ ...lesson, route: getLlmCourseRoute(lesson.id) }));
  const accent = curriculum === 'agent' ? 'amber' : 'sky';

  return (
    <div className="pb-16" data-testid={`course-materials-${curriculum}`}>
      <header className="border-b border-stone-300 pb-8">
        <Badge variant="outline" tone="tracking">Complete extracted curriculum</Badge>
        <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 md:text-6xl">{curriculum === 'agent' ? 'AI agent course materials' : 'LLM course materials'}</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">Every interactive lab, presentation chapter, practical handoff, and researched theory section is indexed here. Nothing is hidden behind the slide controls.</p>

        <div className="mt-8 grid gap-px overflow-hidden rounded-3xl border border-stone-200 bg-stone-200 sm:grid-cols-4">
          {[
            { icon: SquareActivity, value: labs.length, label: 'interactive labs' },
            { icon: Presentation, value: slides.length, label: 'instructor slides' },
            { icon: BookOpenText, value: canonicalLessons.length, label: 'long-form chapters' },
            { icon: FlaskConical, value: labs.length, label: 'practical exercises' },
          ].map(({ icon: Icon, value, label }) => <div key={label} className="bg-white px-5 py-5"><Icon className={`h-5 w-5 ${accent === 'amber' ? 'text-amber-600' : 'text-sky-600'}`} /><p className="mt-4 text-3xl font-semibold text-slate-950">{value}</p><p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p></div>)}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link to={courseRoute} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-amber-300 px-5 text-sm font-semibold text-slate-950"><SquareActivity className="h-4 w-4" /> Start guided course</Link>
          <Link to={`${slidesRoute}?slide=1`} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white"><Presentation className="h-4 w-4" /> Open complete deck</Link>
          <Link to={`${guideRoute}?slide=1`} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-stone-300 bg-white px-5 text-sm font-semibold text-slate-800"><BookOpenText className="h-4 w-4" /> Open complete theory guide</Link>
        </div>
      </header>

      <div className="mt-10 space-y-12">
        <section data-testid={`materials-canonical-course-${curriculum}`}>
          <div className={`border-l-4 pl-4 ${accent === 'amber' ? 'border-amber-500' : 'border-sky-500'}`}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Canonical learner path</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Course chapters</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Each route keeps the experiment, complete essay, diagrams, exercises, checkpoint, and presenter handoff in one sequence.</p>
          </div>
          <ol className="mt-5 divide-y divide-stone-200 border-y border-stone-200">
            {canonicalLessons.map((lesson, index) => (
              <li key={lesson.id}>
                <Link to={lesson.route} className="group grid gap-2 py-4 sm:grid-cols-[3rem_minmax(12rem,0.7fr)_minmax(0,1.3fr)_auto] sm:items-center" data-testid={`materials-course-lesson-${lesson.id}`}>
                  <span className="font-mono text-xs text-slate-400">{String(index + 1).padStart(2, '0')}</span>
                  <span className="text-sm font-semibold text-slate-900 group-hover:text-amber-700">{lesson.shortTitle}</span>
                  <span className="text-sm leading-6 text-slate-500">{lesson.question}</span>
                  <ArrowRight className="hidden h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 sm:block" />
                </Link>
              </li>
            ))}
          </ol>
        </section>

        {tracks.map((track) => (
          <section key={track.id} data-testid={`materials-track-${track.id}`}>
            <div className={`border-l-4 pl-4 ${accent === 'amber' ? 'border-amber-500' : 'border-sky-500'}`}><p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{track.label}</p><h2 className="mt-2 text-2xl font-semibold text-slate-950">{track.title}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{track.description}</p></div>
            <div className="mt-5 divide-y divide-stone-200 border-y border-stone-200">
              {labs.filter((lab) => lab.track === track.id).map((lab) => {
                const hook = slideNumber(slides, lab.id, 'hook');
                const mechanism = slideNumber(slides, lab.id, 'mechanism');
                const exercise = slideNumber(slides, lab.id, 'exercise');
                const debrief = slideNumber(slides, lab.id, 'debrief');
                return (
                  <article key={lab.id} className="grid gap-5 bg-white/65 px-4 py-6 md:grid-cols-[minmax(0,1fr)_minmax(24rem,auto)] md:items-center md:px-6" data-testid={`materials-lab-${lab.id}`}>
                    <div><p className={`text-[0.65rem] font-semibold uppercase tracking-[0.2em] ${accent === 'amber' ? 'text-amber-700' : 'text-sky-700'}`}>{String(lab.order).padStart(2, '0')} · {lab.eyebrow}</p><h3 className="mt-2 text-xl font-semibold text-slate-950">{lab.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{lab.description}</p></div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 md:justify-end">
                      <MaterialLink to={lab.route} label="Interactive lab" />
                      {hook ? <MaterialLink to={`${slidesRoute}?slide=${hook}`} label="Question" /> : null}
                      {mechanism ? <MaterialLink to={`${slidesRoute}?slide=${mechanism}`} label="Mechanism" /> : null}
                      {exercise ? <MaterialLink to={`${slidesRoute}?slide=${exercise}`} label="Exercise" /> : null}
                      {debrief ? <MaterialLink to={`${slidesRoute}?slide=${debrief}`} label="Debrief" /> : null}
                      {exercise ? <MaterialLink to={`${guideRoute}?slide=${exercise}`} label="Theory" /> : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
