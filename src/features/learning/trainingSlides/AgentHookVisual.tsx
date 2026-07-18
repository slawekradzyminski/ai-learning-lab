import { ArrowRight, Bot, Braces, CheckCircle2, Database, FlaskConical, GitMerge, MemoryStick, ShieldCheck, UsersRound, Webhook, Wrench } from 'lucide-react';
import type { LearningLabId } from '../learningCatalog';

function AgentLoopVisual() {
  const nodes = [{ label: 'Model', icon: Bot }, { label: 'Harness', icon: Braces }, { label: 'Tool', icon: Wrench }, { label: 'Result', icon: Database }];
  return <div className="flex flex-wrap items-center justify-center gap-2">{nodes.map(({ label, icon: Icon }, index) => <div key={label} className="flex items-center gap-2"><div className={`flex h-24 w-24 flex-col items-center justify-center border ${index === 0 ? 'border-sky-300/40 bg-sky-300/[0.06]' : 'border-amber-300/35 bg-amber-300/[0.05]'}`}><Icon className={`h-6 w-6 ${index === 0 ? 'text-sky-300' : 'text-amber-300'}`} /><span className="mt-2 text-xs font-semibold">{label}</span></div>{index < nodes.length - 1 ? <ArrowRight className="h-4 w-4 text-slate-600" /> : null}</div>)}</div>;
}

function ContextVisual() {
  const items = [['system', 100], ['goal', 100], ['tools', 82], ['history', 62], ['results', 48], ['memory', 31]];
  return <div className="mx-auto max-w-xl border border-white/15 p-5"><p className="text-xs uppercase tracking-[0.2em] text-amber-300">context budget</p><div className="mt-4 space-y-2">{items.map(([label, width]) => <div key={String(label)} className="grid grid-cols-[5rem_1fr] items-center gap-3"><span className="font-mono text-xs text-slate-500">{label}</span><span className="h-5 bg-amber-300/20"><span className="block h-full bg-amber-300" style={{ width: `${width}%` }} /></span></div>)}</div></div>;
}

function SubagentVisual() {
  return <div className="mx-auto max-w-2xl"><div className="flex items-center justify-center gap-3"><Bot className="h-7 w-7 text-sky-300" /><span className="font-semibold">parent context</span></div><div className="mx-auto my-4 h-8 w-px bg-white/20" /><div className="grid grid-cols-3 gap-3">{['research', 'implement', 'verify'].map((label) => <div key={label} className="border border-amber-300/30 p-4 text-center"><UsersRound className="mx-auto h-5 w-5 text-amber-300" /><p className="mt-2 text-xs">{label}</p></div>)}</div><div className="mt-4 flex items-center justify-center gap-2 text-sm text-emerald-300"><GitMerge className="h-4 w-4" /> verified summaries return</div></div>;
}

function MemoryVisual() {
  return <div className="mx-auto grid max-w-2xl gap-px bg-white/10 sm:grid-cols-3">{[['AGENTS.md', 'required rule'], ['memory', 'learned preference'], ['external state', 'exact evidence']].map(([label, copy], index) => <div key={label} className="bg-slate-950 p-5"><MemoryStick className={`h-5 w-5 ${index === 0 ? 'text-amber-300' : index === 1 ? 'text-sky-300' : 'text-emerald-300'}`} /><p className="mt-4 font-mono text-sm text-white">{label}</p><p className="mt-2 text-xs text-slate-500">{copy}</p></div>)}</div>;
}

function HookVisual() {
  const events = ['prompt', 'pre-tool', 'post-tool', 'compact', 'stop'];
  return <div className="flex flex-wrap items-center justify-center gap-2">{events.map((event, index) => <div key={event} className="flex items-center gap-2"><div className={`border px-4 py-5 text-center ${event === 'pre-tool' ? 'border-amber-300 bg-amber-300 text-slate-950' : 'border-white/15 text-slate-400'}`}><Webhook className="mx-auto h-5 w-5" /><p className="mt-2 font-mono text-xs">{event}</p></div>{index < events.length - 1 ? <ArrowRight className="h-4 w-4 text-slate-600" /> : null}</div>)}</div>;
}

function BoundaryVisual() {
  return <div className="flex flex-wrap items-center justify-center gap-4"><div className="border border-sky-300/30 p-5 text-center"><Bot className="mx-auto h-7 w-7 text-sky-300" /><p className="mt-2 text-sm">tool proposal</p></div><ArrowRight className="h-5 w-5 text-slate-600" /><div className="border border-amber-300/40 p-5 text-center"><ShieldCheck className="mx-auto h-7 w-7 text-amber-300" /><p className="mt-2 text-sm">schema + policy</p></div><ArrowRight className="h-5 w-5 text-slate-600" /><div className="border border-emerald-300/40 p-5 text-center"><CheckCircle2 className="mx-auto h-7 w-7 text-emerald-300" /><p className="mt-2 text-sm">observable effect</p></div></div>;
}

function EvaluationVisual() {
  const outcomes = [true, true, false, true, true, true, false, true, true, false, true, true, true, true, false, true, true, true, true, false];
  return <div className="mx-auto max-w-2xl border border-white/15 p-5"><div className="flex items-center justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.2em] text-amber-300">20 repeated trials</p><p className="mt-2 text-sm text-slate-400">A score points back to traces and outcomes.</p></div><FlaskConical className="h-7 w-7 text-amber-300" /></div><div className="mt-5 grid grid-cols-10 gap-1.5">{outcomes.map((passed, index) => <span key={index} className={`aspect-square ${passed ? 'bg-emerald-400' : 'bg-red-400'}`} title={`Trial ${index + 1}: ${passed ? 'pass' : 'fail'}`} />)}</div><div className="mt-5 grid grid-cols-2 gap-px bg-white/10"><div className="bg-slate-950 p-4"><p className="font-mono text-xs text-slate-500">pass@3</p><p className="mt-1 text-xl font-semibold text-emerald-300">one works</p></div><div className="bg-slate-950 p-4"><p className="font-mono text-xs text-slate-500">pass³</p><p className="mt-1 text-xl font-semibold text-amber-300">all work</p></div></div></div>;
}

export function AgentHookVisual({ labId }: { labId: LearningLabId }) {
  switch (labId) {
    case 'agent-loop': return <AgentLoopVisual />;
    case 'subagents': return <SubagentVisual />;
    case 'context-harness': return <ContextVisual />;
    case 'memory-instructions': return <MemoryVisual />;
    case 'hooks-lifecycle': return <HookVisual />;
    case 'tool-boundaries': return <BoundaryVisual />;
    case 'agent-evals': return <EvaluationVisual />;
    default: return null;
  }
}
