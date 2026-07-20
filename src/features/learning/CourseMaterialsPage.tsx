import { ArrowRight, BookOpenText, FlaskConical, SquareActivity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../../components/ui/badge';
import { getSectionLabs, getSectionTracks, type LearningSectionId } from './learningCatalog';
import { AGENT_COURSE_LESSONS, getAgentCourseRoute } from './agentCourse/agentCourseCatalog';
import { LLM_COURSE_LESSONS, getLlmCourseRoute } from './course/llmCourseCatalog';

type Curriculum = 'llm' | 'agent';

function MaterialLink({ to, label }: { to: string; label: string }) {
  return <Link to={to} className="inline-flex min-h-10 items-center gap-1.5 border-b border-stone-300 px-1 text-xs font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950">{label}<ArrowRight className="h-3.5 w-3.5" /></Link>;
}

export function CourseMaterialsPage({ curriculum }: { curriculum: Curriculum }) {
  const sectionId: LearningSectionId = curriculum === 'agent' ? 'agent' : 'llm';
  const labs = getSectionLabs(sectionId);
  const tracks = getSectionTracks(sectionId);
  const courseRoute = curriculum === 'agent' ? '/learn/how-ai-agent-works/course/agent-loop' : '/learn/how-llm-works/course/prediction-goal';
  const canonicalLessons = curriculum === 'agent'
    ? AGENT_COURSE_LESSONS.map((lesson) => ({ ...lesson, route: getAgentCourseRoute(lesson.id) }))
    : LLM_COURSE_LESSONS.map((lesson) => ({ ...lesson, route: getLlmCourseRoute(lesson.id) }));
  const accent = curriculum === 'agent' ? 'amber' : 'sky';

  return (
    <div className="pb-16" data-testid={`course-materials-${curriculum}`}>
      <header className="border-b border-stone-300 pb-8">
        <Badge variant="outline" tone="tracking">One integrated curriculum</Badge>
        <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 md:text-6xl">{curriculum === 'agent' ? 'AI agent course materials' : 'LLM course materials'}</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">Every lesson moves through a concise mechanism, experiment, and checkpoint. The complete theory chapter remains available afterward as optional reference.</p>

        <div className="mt-8 grid gap-px overflow-hidden rounded-3xl border border-stone-200 bg-stone-200 sm:grid-cols-3">
          {[
            { icon: SquareActivity, value: labs.length, label: 'interactive labs' },
            { icon: BookOpenText, value: canonicalLessons.length, label: 'long-form chapters' },
            { icon: FlaskConical, value: canonicalLessons.length, label: 'guided lesson activities' },
          ].map(({ icon: Icon, value, label }) => <div key={label} className="bg-white px-5 py-5"><Icon className={`h-5 w-5 ${accent === 'amber' ? 'text-amber-600' : 'text-sky-600'}`} /><p className="mt-4 text-3xl font-semibold text-slate-950">{value}</p><p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p></div>)}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link to={courseRoute} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-amber-300 px-5 text-sm font-semibold text-slate-950"><SquareActivity className="h-4 w-4" /> Start guided course</Link>
        </div>
      </header>

      <div className="mt-10 space-y-12">
        <section data-testid={`materials-canonical-course-${curriculum}`}>
          <div className={`border-l-4 pl-4 ${accent === 'amber' ? 'border-amber-500' : 'border-sky-500'}`}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Canonical learner path</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Course chapters</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Each route keeps the mandatory learning loop concise and loads the long-form chapter only when the learner opens the deep dive.</p>
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
                const canonicalLesson = canonicalLessons.find((lesson) => ('labId' in lesson ? lesson.labId === lab.id : lesson.id === lab.id));
                return (
                  <article key={lab.id} className="grid gap-5 bg-white/65 px-4 py-6 md:grid-cols-[minmax(0,1fr)_minmax(24rem,auto)] md:items-center md:px-6" data-testid={`materials-lab-${lab.id}`}>
                    <div><p className={`text-[0.65rem] font-semibold uppercase tracking-[0.2em] ${accent === 'amber' ? 'text-amber-700' : 'text-sky-700'}`}>{String(lab.order).padStart(2, '0')} · {lab.eyebrow}</p><h3 className="mt-2 text-xl font-semibold text-slate-950">{lab.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{lab.description}</p></div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 md:justify-end">
                      <MaterialLink to={lab.route} label="Interactive lab" />
                      {canonicalLesson ? <MaterialLink to={canonicalLesson.route} label="Integrated lesson" /> : null}
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
