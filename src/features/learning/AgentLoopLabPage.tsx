import { useMemo, useState } from 'react';
import { AlertTriangle, ArrowRight, Bot, Check, ChevronRight, Play, Radio, RotateCcw, Wrench } from 'lucide-react';
import { LabPageHeader } from './LabPageHeader';
import { LearningCheckpoint } from './LearningCheckpoint';
import { getAgentTrace, type AgentActor } from './agentHarnessMath';

const actorStyle: Record<AgentActor, string> = {
  user: 'border-slate-300 bg-white text-slate-950',
  harness: 'border-amber-300 bg-amber-50 text-amber-950',
  model: 'border-sky-300 bg-sky-50 text-sky-950',
  tool: 'border-emerald-300 bg-emerald-50 text-emerald-950',
  final: 'border-slate-950 bg-slate-950 text-white',
};

export function AgentLoopLabPage() {
  const [includeFailure, setIncludeFailure] = useState(false);
  const [step, setStep] = useState(0);
  const trace = useMemo(() => getAgentTrace(includeFailure), [includeFailure]);
  const visible = trace.slice(0, step + 1);
  const current = trace[Math.min(step, trace.length - 1)];

  const reset = (failure = includeFailure) => {
    setIncludeFailure(failure);
    setStep(0);
  };

  return (
    <div className="space-y-6" data-testid="agent-loop-lab-page">
      <LabPageHeader eyebrow="Agent runtime · step 1" title="Step through the agent loop" description="Separate the model’s proposals from the harness code that assembles context, executes tools, returns observations, and decides whether another turn is allowed." aside="Model ↔ harness ↔ environment" />

      <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50/75 p-4 text-sm leading-6 text-amber-950" role="note">
        This guided trace follows the runtime structure documented by ccunpacked.dev and primary agent guides. It exposes orchestration—not private model reasoning.
      </div>

      <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white/85">
        <div className="flex flex-col gap-4 border-b border-stone-200 p-5 md:flex-row md:items-center md:justify-between md:px-7">
          <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Guided run</p><h2 className="mt-2 text-xl font-semibold text-slate-950">Research three laptops under €900—without purchasing</h2></div>
          <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-slate-700">
            <input type="checkbox" checked={includeFailure} onChange={(event) => reset(event.target.checked)} className="h-5 w-5 accent-amber-600" data-testid="agent-loop-failure-toggle" /> Inject a tool failure
          </label>
        </div>

        <div className="grid lg:grid-cols-[minmax(0,0.8fr)_minmax(360px,1.2fr)]">
          <div className="border-b border-stone-200 bg-slate-950 p-5 text-white lg:border-b-0 lg:border-r md:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Current boundary</p>
            <p className="mt-5 text-sm text-slate-500">step {step + 1} / {trace.length}</p>
            <h3 className="mt-2 text-2xl font-semibold" data-testid="agent-loop-current-label">{current.label}</h3>
            <p className="mt-4 text-sm leading-7 text-slate-300" data-testid="agent-loop-current-detail">{current.detail}</p>
            {current.payload ? <pre className="mt-5 overflow-x-auto rounded-xl bg-white/[0.06] p-4 font-mono text-xs leading-6 text-sky-100">{current.payload}</pre> : null}

            <div className="mt-8 flex flex-wrap gap-2">
              <button type="button" onClick={() => setStep((value) => Math.min(value + 1, trace.length - 1))} disabled={step === trace.length - 1} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-amber-300 px-5 text-sm font-semibold text-slate-950 disabled:opacity-35" data-testid="agent-loop-next">Next boundary <ChevronRight className="h-4 w-4" /></button>
              <button type="button" onClick={() => setStep(trace.length - 1)} disabled={step === trace.length - 1} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-4 text-sm font-semibold text-white disabled:opacity-35" data-testid="agent-loop-run"><Play className="h-4 w-4" /> Run to stop</button>
              <button type="button" onClick={() => setStep(0)} className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-slate-400 hover:bg-white/10"><RotateCcw className="h-4 w-4" /> Reset</button>
            </div>
          </div>

          <ol className="space-y-3 p-5 md:p-7" data-testid="agent-loop-trace">
            {visible.map((item, index) => (
              <li key={`${item.label}-${index}`} className={`grid grid-cols-[2.25rem_minmax(0,1fr)] gap-3 rounded-2xl border p-4 ${actorStyle[item.actor]}`} data-testid={`agent-loop-step-${index}`}>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5">{item.actor === 'model' ? <Bot className="h-4 w-4" /> : item.actor === 'tool' ? <Wrench className="h-4 w-4" /> : item.actor === 'final' ? <Check className="h-4 w-4" /> : item.actor === 'harness' ? <AlertTriangle className="h-4 w-4" /> : index + 1}</span>
                <div><p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-55">{item.actor}</p><p className="mt-1 font-semibold">{item.label}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <LearningCheckpoint id="agent-loop-owner" question="Who actually executes a proposed tool call?" choices={[{ value: 'model', label: 'The language model itself' }, { value: 'harness', label: 'Deterministic harness/application code' }, { value: 'prompt', label: 'The system prompt' }]} correctValue="harness" explanation="The model emits structured output. The harness parses it, validates it, checks policy, invokes application code, and returns the result as a new observation." />

      <section className="grid gap-5 rounded-[2rem] bg-slate-950 p-6 text-white md:grid-cols-[1fr_auto] md:items-center md:p-8">
        <div><p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300"><Radio className="h-4 w-4" /> Guided → live</p><h2 className="mt-3 text-2xl font-semibold">Run the real Bonsai tool loop.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">This lab keeps every boundary deterministic and inspectable. The existing tool-chat experience uses the live local model and application tools, so outputs can vary.</p></div>
        <a href="/llm/tools" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-amber-300 px-5 text-sm font-semibold text-slate-950" data-testid="agent-loop-live-link" data-navigation="document">Open live tool chat <ArrowRight className="h-4 w-4" /></a>
      </section>

      <p className="text-xs leading-5 text-slate-500">Research basis: <a className="underline" href="https://ccunpacked.dev/" target="_blank" rel="noreferrer">Claude Code Unpacked agent loop</a> and <a className="underline" href="https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/" target="_blank" rel="noreferrer">OpenAI’s practical guide to building agents</a>.</p>
    </div>
  );
}
