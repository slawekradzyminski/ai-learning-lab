import { Bot, Braces, Eye, FlaskConical, ShieldCheck, Wrench } from 'lucide-react';
import type { TrainingSlideDefinition } from './types';

export const agentOpeningSlide: TrainingSlideDefinition = {
  id: 'agent-opening', kind: 'opening', chapterLabel: 'How AI Agent works? · instructor sequence',
  kicker: 'Companion narrative · seven practical exercises', title: 'The model is only one part of the agent.',
  content: <div className="mt-9 grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-end"><p className="max-w-xl text-lg leading-8 text-slate-300">We will keep two boundaries visible: what the model proposes and what the harness actually supplies, validates, executes, records, or stops.</p><div className="grid grid-cols-2 gap-px bg-white/10 md:grid-cols-4">{[[Bot, 'Propose'], [Braces, 'Orchestrate'], [Wrench, 'Act'], [Eye, 'Observe']].map(([Icon, label]) => { const Component = Icon as typeof Bot; return <div key={String(label)} className="bg-slate-950 p-5"><Component className="h-6 w-6 text-amber-300" /><p className="mt-4 text-lg font-semibold">{String(label)}</p></div>; })}</div></div>,
  notes: 'Ask participants to stop saying “the AI did it” and name the model, harness, tool, environment, and user boundary precisely.',
};

export const agentRecapSlide: TrainingSlideDefinition = {
  id: 'agent-recap', kind: 'recap', chapterLabel: 'Closing synthesis', kicker: 'Seven labs · four engineering responsibilities',
  title: 'A capable model needs a legible, bounded harness.',
  content: <div className="mt-9 grid gap-px bg-white/10 md:grid-cols-2 xl:grid-cols-4"><div className="bg-slate-950 p-6"><Bot className="h-7 w-7 text-sky-300" /><p className="mt-5 text-xl font-semibold">Decision</p><p className="mt-3 text-sm leading-6 text-slate-400">The model proposes the next message, tool call, or completion.</p></div><div className="bg-slate-950 p-6"><Braces className="h-7 w-7 text-amber-300" /><p className="mt-5 text-xl font-semibold">Orchestration</p><p className="mt-3 text-sm leading-6 text-slate-400">The harness manages context, turns, errors, persistence, and stop conditions.</p></div><div className="bg-slate-950 p-6"><ShieldCheck className="h-7 w-7 text-emerald-300" /><p className="mt-5 text-xl font-semibold">Control</p><p className="mt-3 text-sm leading-6 text-slate-400">Schemas, permissions, approvals, and isolation bound real effects.</p></div><div className="bg-slate-950 p-6"><FlaskConical className="h-7 w-7 text-violet-300" /><p className="mt-5 text-xl font-semibold">Evaluation</p><p className="mt-3 text-sm leading-6 text-slate-400">Repeated tasks, outcome graders, traces, cost, and latency establish reliability.</p></div><p className="bg-slate-950 p-6 text-lg leading-8 text-slate-200 md:col-span-2 xl:col-span-4"><strong className="text-white">Final question:</strong> which failure belongs to the model, which to the harness, which to the environment, and which to the evaluation itself?</p></div>,
  notes: 'End with a trace/outcome distinction: a fluent transcript is not proof that the intended state change occurred.',
};
