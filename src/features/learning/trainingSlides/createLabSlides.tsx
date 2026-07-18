/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { LEARNING_LABS } from '../learningCatalog';
import { LanguageHookVisual } from './LanguageHookVisual';
import { NeuralHookVisual } from './NeuralHookVisual';
import { AgentHookVisual } from './AgentHookVisual';
import type { LabNarrative, TrainingSlideDefinition } from './types';

function Formula({ children }: { children: ReactNode }) {
  return <span className="font-mono text-sky-300">{children}</span>;
}

function HookVisual({ narrative }: { narrative: LabNarrative }) {
  return (
    <>
      <LanguageHookVisual labId={narrative.id} />
      <NeuralHookVisual labId={narrative.id} />
      <AgentHookVisual labId={narrative.id} />
    </>
  );
}

function HookContent({ narrative }: { narrative: LabNarrative }) {
  return (
    <div className="mt-8 grid gap-9 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-center">
      <div>
        <p className="max-w-xl text-lg leading-8 text-slate-300">{narrative.hookCopy}</p>
        <p className="mt-6 border-l-2 border-amber-300 pl-5 text-base font-semibold leading-7 text-amber-100">{narrative.hookPrompt}</p>
      </div>
      <HookVisual narrative={narrative} />
    </div>
  );
}

function MechanismContent({ narrative }: { narrative: LabNarrative }) {
  return (
    <div className="mt-9">
      <div className="grid gap-px bg-white/10 md:grid-cols-2 xl:grid-cols-4">
        {narrative.mechanismSteps.map((step, index) => (
          <div key={`${index}-${step.label}`} className="bg-slate-950 p-5 md:p-6">
            <span className="text-xs font-semibold text-sky-300">0{index + 1} · {step.label}</span>
            <p className="mt-5 min-h-14 text-lg font-semibold"><Formula>{step.expression}</Formula></p>
            <p className="mt-3 text-sm leading-6 text-slate-400">{step.copy}</p>
          </div>
        ))}
      </div>
      <p className="mt-7 max-w-4xl border-l-2 border-sky-400 pl-5 text-lg leading-8 text-slate-200">{narrative.mechanismConclusion}</p>
    </div>
  );
}

function ExerciseContent({ narrative }: { narrative: LabNarrative }) {
  const lab = LEARNING_LABS.find((candidate) => candidate.id === narrative.id);
  if (!lab) return null;

  return (
    <div className="mt-9 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.72fr)] lg:items-end">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">Practical break · {narrative.duration}</p>
        <ol className="mt-6 space-y-4 text-lg leading-8 text-slate-200 md:text-xl">
          {narrative.tasks.map((task, index) => <li key={task} className="flex gap-4"><span className="text-sky-400">0{index + 1}</span><span>{task}</span></li>)}
        </ol>
        <p className="mt-7 border-l-2 border-amber-300 pl-5 text-sm leading-6 text-amber-100"><strong>Return question:</strong> {narrative.returnQuestion}</p>
      </div>
      <a href={lab.route} target="_blank" rel="noreferrer" className="group flex min-h-44 items-end justify-between bg-sky-400 p-6 text-slate-950 transition hover:-translate-y-1 hover:bg-sky-300 md:p-8" data-testid={`slides-exercise-${narrative.id}`}>
        <span>
          <span className="block text-xs font-semibold uppercase tracking-[0.2em] opacity-60">Opens in a new tab</span>
          <span className="mt-3 block text-2xl font-semibold md:text-3xl">{lab.shortTitle} Lab</span>
        </span>
        <ArrowRight className="h-7 w-7 transition group-hover:translate-x-1" />
      </a>
    </div>
  );
}

function DebriefContent({ narrative }: { narrative: LabNarrative }) {
  return (
    <div className="mt-9">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="border-t-2 border-sky-400 pt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">What the exercise demonstrates</p>
          <p className="mt-5 text-2xl font-semibold leading-9 text-white">{narrative.takeaway}</p>
        </div>
        <div className="border-t-2 border-amber-300 pt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">Where the model stops</p>
          <p className="mt-5 text-lg leading-8 text-slate-300">{narrative.limitation}</p>
        </div>
      </div>
      <div className="mt-9 flex items-center gap-4 border-t border-white/10 pt-6 text-slate-300">
        <ArrowRight className="h-5 w-5 shrink-0 text-sky-300" />
        <p><span className="mr-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Bridge forward</span>{narrative.bridge}</p>
      </div>
    </div>
  );
}

export function createLabSlides(narrative: LabNarrative): TrainingSlideDefinition[] {
  const lab = LEARNING_LABS.find((candidate) => candidate.id === narrative.id);
  if (!lab) throw new Error(`Missing learning lab ${narrative.id}`);

  const base = `${lab.trackOrder.toString().padStart(2, '0')} · ${lab.shortTitle}`;
  const shared = { trackId: lab.track, labId: narrative.id, chapterLabel: base };

  return [
    { ...shared, id: `${narrative.id}-hook`, kind: 'hook', kicker: `${narrative.chapter} · begin with a question`, title: narrative.hookTitle, content: <HookContent narrative={narrative} />, notes: narrative.hookNotes },
    { ...shared, id: `${narrative.id}-mechanism`, kind: 'mechanism', kicker: `${narrative.chapter} · smallest useful mechanism`, title: narrative.mechanismTitle, content: <MechanismContent narrative={narrative} />, notes: narrative.mechanismNotes },
    { ...shared, id: `${narrative.id}-exercise`, kind: 'exercise', kicker: `${narrative.chapter} · stop presenting`, title: narrative.exerciseTitle, content: <ExerciseContent narrative={narrative} />, notes: narrative.exerciseNotes },
    { ...shared, id: `${narrative.id}-debrief`, kind: 'debrief', kicker: `${narrative.chapter} · return and sharpen the claim`, title: 'What changed—and what did not?', content: <DebriefContent narrative={narrative} />, notes: narrative.debriefNotes },
  ];
}
