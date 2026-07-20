import { FlaskConical, Microscope } from 'lucide-react';
import type { CourseTheory } from './content/theoryTypes';

type Accent = 'sky' | 'amber';

const accentStyles = {
  sky: { text: 'text-sky-700', border: 'border-sky-500' },
  amber: { text: 'text-amber-700', border: 'border-amber-500' },
};

export type ExperimentEvidence = {
  label: string;
  detail: string;
};

export function MechanismBrief({ content, accent }: { content: CourseTheory; accent: Accent }) {
  const styles = accentStyles[accent];
  return (
    <section className="grid gap-7 py-4 md:grid-cols-[12rem_minmax(0,1fr)]" data-testid="lesson-mechanism">
      <p className={`text-[0.65rem] font-semibold uppercase tracking-[0.2em] ${styles.text}`}>01 · Smallest useful mechanism</p>
      <div className="max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{content.heading}</h2>
        <p className="mt-4 text-base leading-8 text-slate-700">{content.explanation}</p>
        <p className={`mt-5 border-l-2 ${styles.border} pl-5 text-sm font-semibold leading-7 text-slate-800`}>{content.takeaway}</p>
      </div>
    </section>
  );
}

export function ExperimentHeading({ evidence, accent }: { evidence: ExperimentEvidence; accent: Accent }) {
  const styles = accentStyles[accent];
  return (
    <header className="flex flex-col gap-4 border-t border-stone-300 pt-8 sm:flex-row sm:items-end sm:justify-between" data-testid="lesson-experiment-heading">
      <div>
        <p className={`flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] ${styles.text}`}><FlaskConical className="h-4 w-4" /> 02 · Experiment</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Test the prediction</h2>
      </div>
      <div className="max-w-2xl border-l border-stone-300 pl-4" data-testid="experiment-evidence-source">
        <p className="flex items-center gap-2 text-xs font-semibold text-slate-900"><Microscope className={`h-4 w-4 ${styles.text}`} /> {evidence.label}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{evidence.detail}</p>
      </div>
    </header>
  );
}
