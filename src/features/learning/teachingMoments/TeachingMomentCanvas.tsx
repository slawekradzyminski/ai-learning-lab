import { ArrowRight, Presentation } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { LessonTeachingMoments, TeachingMoment, TeachingMomentKind } from './types';

type Accent = 'sky' | 'amber';

const kindLabels: Record<TeachingMomentKind, string> = {
  hook: 'Begin with a question',
  mechanism: 'Smallest useful mechanism',
  practice: 'Commit before trying',
  debrief: 'What changed—and what did not',
};

function accentClasses(accent: Accent) {
  return accent === 'amber'
    ? { text: 'text-amber-300', border: 'border-amber-300', soft: 'bg-amber-300/10 text-amber-100' }
    : { text: 'text-sky-300', border: 'border-sky-400', soft: 'bg-sky-400/10 text-sky-100' };
}

export function TeachingMomentContent({
  moment,
  accent,
  present = false,
}: {
  moment: TeachingMoment;
  accent: Accent;
  present?: boolean;
}) {
  const color = accentClasses(accent);

  return (
    <div className={present ? 'mx-auto w-full max-w-6xl' : ''} data-testid={`teaching-moment-${moment.id}`}>
      <p className={`text-[0.65rem] font-semibold uppercase tracking-[0.24em] ${color.text}`}>
        {moment.eyebrow} · {kindLabels[moment.kind]}
      </p>
      <h2 className={`mt-4 max-w-5xl font-semibold leading-[1.08] tracking-[-0.035em] text-white ${present ? 'text-4xl md:text-6xl' : 'text-3xl md:text-5xl'}`}>
        {moment.title}
      </h2>
      <p className={`mt-6 max-w-3xl leading-8 text-slate-300 ${present ? 'text-lg md:text-xl' : 'text-base'}`}>{moment.summary}</p>

      {moment.steps?.length ? (
        <div className={`mt-8 grid gap-px bg-white/10 ${moment.steps.length > 2 ? 'md:grid-cols-2 xl:grid-cols-4' : 'md:grid-cols-2'}`}>
          {moment.steps.map((step, index) => (
            <div key={`${moment.id}-${step.label}`} className="bg-slate-950 p-5 md:p-6">
              <p className={`text-[0.65rem] font-semibold uppercase tracking-[0.18em] ${color.text}`}>{String(index + 1).padStart(2, '0')} · {step.label}</p>
              <p className="mt-4 font-mono text-base font-semibold leading-7 text-white md:text-lg">{step.expression}</p>
              <p className="mt-3 text-sm leading-6 text-slate-400">{step.copy}</p>
            </div>
          ))}
        </div>
      ) : null}

      {moment.prompt ? <p className={`mt-7 border-l-2 ${color.border} pl-5 text-base font-semibold leading-7 text-white`}>{moment.prompt}</p> : null}
      <p className={`mt-7 max-w-4xl border-l-2 ${color.border} pl-5 text-base leading-7 text-slate-200`}><span className={`mr-2 text-xs font-semibold uppercase tracking-[0.18em] ${color.text}`}>Retain</span>{moment.takeaway}</p>
    </div>
  );
}

function MomentSection({ moment, accent }: { moment: TeachingMoment; accent: Accent }) {
  return (
    <section id={`lesson-moment-${moment.id}`} className="scroll-mt-6 border-t border-white/10 px-6 py-10 first:border-t-0 md:px-10 md:py-12">
      <TeachingMomentContent moment={moment} accent={accent} />
    </section>
  );
}

export function LessonTeachingSequence({
  lesson,
  accent,
  courseRoute,
}: {
  lesson: LessonTeachingMoments;
  accent: Accent;
  courseRoute: string;
}) {
  const openingMoments = lesson.moments.slice(0, 3);
  return (
    <section data-testid="lesson-teaching-sequence">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-slate-400">Teaching sequence</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">See the idea before you operate it.</h2>
        </div>
        <Link
          to={`${courseRoute}?view=present&moment=${lesson.moments[0].id}`}
          className="group inline-flex min-h-11 items-center gap-2 border-b border-slate-950 px-1 text-sm font-semibold text-slate-900"
          data-testid="present-lesson"
        >
          <Presentation className="h-4 w-4" /> Present this lesson <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
      <div className="overflow-hidden rounded-[2rem] bg-slate-950 shadow-[0_36px_90px_-64px_rgba(15,23,42,0.9)]">
        {openingMoments.map((moment) => <MomentSection key={moment.id} moment={moment} accent={accent} />)}
      </div>
    </section>
  );
}

export function LessonDebriefMoment({ lesson, accent }: { lesson: LessonTeachingMoments; accent: Accent }) {
  const moment = lesson.moments[3];
  return (
    <section className="overflow-hidden rounded-[2rem] bg-slate-950" data-testid="lesson-debrief-moment">
      <MomentSection moment={moment} accent={accent} />
    </section>
  );
}
