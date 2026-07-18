import { useState } from 'react';
import { CheckCircle2, CircleAlert, Play, TerminalSquare } from 'lucide-react';
import { LabPageHeader } from './LabPageHeader';
import { LearningCheckpoint } from './LearningCheckpoint';
import { evaluateHookSelection, HOOK_EVENTS, HOOK_SCENARIOS, type HookEvent } from './hookLifecycle';

export function HooksLifecycleLabPage() {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [event, setEvent] = useState<HookEvent>('pre-tool');
  const [executed, setExecuted] = useState(false);
  const scenario = HOOK_SCENARIOS[scenarioIndex];
  const result = evaluateHookSelection(scenario, event);

  const chooseScenario = (index: number) => {
    setScenarioIndex(index);
    setEvent(HOOK_SCENARIOS[index].expectedEvent);
    setExecuted(false);
  };

  return (
    <div className="space-y-6" data-testid="hooks-lifecycle-lab-page">
      <LabPageHeader eyebrow="Agent safety · step 1" title="Attach deterministic logic to the lifecycle" description="Choose the earliest event that has enough evidence and control to block, transform, validate, log, or restore agent behavior." aside="Prompt → event → hook" />

      <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50/75 p-4 text-sm leading-6 text-amber-950" role="note">
        Hooks run around the probabilistic loop. They complement instructions and permissions; they do not make every specialized tool path or external system automatically safe.
      </div>

      <section className="overflow-hidden rounded-[2rem] bg-slate-950 text-white">
        <div className="border-b border-white/10 p-5 md:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">Lifecycle timeline</p>
          <div className="mt-5 overflow-x-auto pb-2">
            <div className="flex min-w-max items-center gap-1">
              {HOOK_EVENTS.map((candidate, index) => <div key={candidate.id} className="flex items-center"><button type="button" onClick={() => { setEvent(candidate.id); setExecuted(false); }} aria-pressed={event === candidate.id} className={`min-h-20 w-36 border px-3 text-left transition ${event === candidate.id ? 'border-amber-300 bg-amber-300 text-slate-950' : 'border-white/15 bg-white/[0.03] text-slate-300'}`} data-testid={`hook-event-${candidate.id}`}><span className="block text-[0.6rem] uppercase tracking-[0.14em] opacity-60">{candidate.phase}</span><span className="mt-2 block whitespace-nowrap font-mono text-[0.68rem] font-semibold">{candidate.label}</span></button>{index < HOOK_EVENTS.length - 1 ? <span className="mx-1 h-px w-4 bg-white/20" /> : null}</div>)}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[minmax(260px,0.65fr)_minmax(0,1.35fr)]">
          <div className="border-b border-white/10 p-5 lg:border-b-0 lg:border-r md:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Choose a rule</p>
            <div className="mt-4 space-y-1">
              {HOOK_SCENARIOS.map((candidate, index) => <button key={candidate.id} type="button" onClick={() => chooseScenario(index)} aria-pressed={scenarioIndex === index} className={`w-full border-l-2 px-4 py-3 text-left transition ${scenarioIndex === index ? 'border-amber-300 bg-white/[0.06] text-white' : 'border-white/10 text-slate-400 hover:text-white'}`} data-testid={`hook-scenario-${candidate.id}`}><span className="block text-sm font-semibold">{candidate.title}</span><span className="mt-1 block text-xs leading-5 opacity-70">{candidate.proposal}</span></button>)}
            </div>
          </div>

          <div className="p-5 md:p-7">
            <div className="flex items-start gap-3"><TerminalSquare className="mt-1 h-6 w-6 shrink-0 text-amber-300" /><div><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Hook objective</p><h2 className="mt-2 text-2xl font-semibold">{scenario.title}</h2><p className="mt-2 text-sm leading-6 text-slate-400">{scenario.proposal}</p></div></div>

            <div className={`mt-7 border-l-4 p-5 ${result.correct ? 'border-emerald-300 bg-emerald-300/[0.08]' : 'border-amber-300 bg-amber-300/[0.08]'}`} data-testid="hook-selection-result">
              <div className="flex items-start gap-3">{result.correct ? <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-300" /> : <CircleAlert className="mt-0.5 h-5 w-5 text-amber-300" />}<div><p className="font-semibold">{result.correct ? 'The event has the right evidence and timing.' : 'This event is too early or too late.'}</p><p className="mt-1 text-sm leading-6 text-slate-300">{result.message}</p></div></div>
            </div>

            <button type="button" disabled={!result.correct} onClick={() => setExecuted(true)} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-amber-300 px-5 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-35" data-testid="hook-run"><Play className="h-4 w-4" /> Simulate event</button>
            <p className={`mt-4 min-h-12 border-t border-white/10 pt-4 text-sm leading-6 ${executed ? 'text-emerald-300' : 'text-slate-500'}`} aria-live="polite" data-testid="hook-execution">{executed ? scenario.effect : 'Select the right event, then run the hook.'}</p>
          </div>
        </div>

        <div className="grid border-t border-white/10 text-sm md:grid-cols-2"><div className="border-b border-white/10 p-5 md:border-b-0 md:border-r md:p-6"><strong className="text-amber-300">Codex:</strong> documented command hooks can observe and alter lifecycle events.</div><div className="p-5 md:p-6"><strong className="text-sky-300">Claude Code:</strong> command, prompt, agent, and HTTP handlers support different automation shapes.</div></div>
      </section>

      <LearningCheckpoint id="hook-boundary" question="Which mechanism can stop a protected file write before execution?" choices={[{ value: 'post', label: 'A PostToolUse formatter' }, { value: 'pre', label: 'A PreToolUse guard' }, { value: 'memory', label: 'Auto memory alone' }]} correctValue="pre" explanation="A pre-tool hook can inspect the proposed call and block it before the side effect. Permissions and sandboxing should still provide independent boundaries." />

      <p className="text-xs leading-5 text-slate-500">Research basis: <a className="underline" href="https://learn.chatgpt.com/docs/hooks" target="_blank" rel="noreferrer">Codex hooks</a> and <a className="underline" href="https://code.claude.com/docs/en/hooks" target="_blank" rel="noreferrer">Claude Code hooks</a>.</p>
    </div>
  );
}
