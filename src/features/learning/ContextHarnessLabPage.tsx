import { useMemo, useState } from 'react';
import { Archive, Check, ChevronsDown, PackageOpen, RefreshCw, X } from 'lucide-react';
import { LabPageHeader } from './LabPageHeader';
import { LearningCheckpoint } from './LearningCheckpoint';
import { assembleContext } from './agentHarnessMath';
import { CONTEXT_LIFECYCLE_OUTCOMES, getContextLifecycleOutcome, type ContextLifecycleAction } from './contextLifecycle';

export function ContextHarnessLabPage() {
  const [budget, setBudget] = useState(170);
  const [compact, setCompact] = useState(false);
  const [action, setAction] = useState<ContextLifecycleAction>('next-turn');
  const assembly = useMemo(() => assembleContext(budget, compact), [budget, compact]);
  const outcome = getContextLifecycleOutcome(action);
  const fill = Math.min(100, (assembly.used / budget) * 100);

  return (
    <div className="space-y-6" data-testid="context-harness-lab-page">
      <LabPageHeader eyebrow="Agent context · step 1" title="Trace the context lifecycle" description="Build the next inference call, then compare what is cached, compacted, restored, reloaded, or lost when the harness changes state." aside="Context ≠ cache ≠ memory" />

      <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50/75 p-4 text-sm leading-6 text-amber-950" role="note">
        The model has no direct view of your repository, browser, memory files, or tool registry. It sees the serialized context the harness constructs for this turn.
      </div>

      <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white/85">
        <div className="grid gap-6 border-b border-stone-200 p-5 md:grid-cols-[1fr_auto] md:items-end md:p-7">
          <div>
            <label htmlFor="context-budget" className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Teaching context budget · {budget} units</label>
            <input id="context-budget" type="range" min="90" max="290" step="10" value={budget} onChange={(event) => setBudget(Number(event.target.value))} className="mt-4 w-full accent-amber-600" data-testid="context-budget" />
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-stone-100"><div className="h-full bg-amber-400 transition-all" style={{ width: `${fill}%` }} /></div>
            <p className="mt-2 font-mono text-xs text-slate-500" data-testid="context-budget-used">{assembly.used} used · {Math.max(0, budget - assembly.used)} free</p>
          </div>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-full border border-stone-200 px-4 text-sm font-semibold text-slate-700">
            <input type="checkbox" checked={compact} onChange={(event) => setCompact(event.target.checked)} className="h-5 w-5 accent-amber-600" data-testid="context-compact" /> Compact optional context
          </label>
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1.1fr)_minmax(330px,0.7fr)]">
          <div className="p-5 md:p-7">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700"><Check className="h-4 w-4" /> Included in the next call</p>
            <div className="mt-5 space-y-2" data-testid="context-included">
              {assembly.included.map((segment, index) => (
                <div key={segment.id} className="grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-stone-200 py-4 last:border-b-0">
                  <span className="font-mono text-xs text-slate-400">{String(index + 1).padStart(2, '0')}</span>
                  <div><p className="font-semibold text-slate-950">{segment.label}{segment.required ? <span className="ml-2 text-[0.65rem] uppercase tracking-[0.14em] text-amber-700">required</span> : null}</p><p className="mt-1 text-sm leading-5 text-slate-500">{segment.copy}</p></div>
                  <span className="rounded-full bg-stone-100 px-3 py-1 font-mono text-xs text-slate-600">{segment.effectiveCost}</span>
                </div>
              ))}
            </div>
          </div>

          <aside className="border-t border-stone-200 bg-slate-950 p-5 text-white lg:border-l lg:border-t-0 md:p-7">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400"><PackageOpen className="h-4 w-4" /> Outside this call</p>
            <div className="mt-5 space-y-3" data-testid="context-excluded">
              {assembly.excluded.length ? assembly.excluded.map((segment) => <div key={segment.id} className="flex items-start gap-3 border-b border-white/10 pb-3"><X className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" /><div><p className="text-sm font-semibold text-slate-300">{segment.label}</p><p className="mt-1 text-xs leading-5 text-slate-500">Not forgotten globally; simply absent from this inference call.</p></div></div>) : <p className="text-sm leading-6 text-slate-400">Everything fits—but more context is not automatically better context.</p>}
            </div>
            <div className="mt-7 border-l-2 border-amber-300 pl-4"><p className="flex items-center gap-2 text-sm font-semibold text-amber-200"><Archive className="h-4 w-4" /> Compaction changes fidelity</p><p className="mt-2 text-xs leading-5 text-slate-400">A summary can preserve decisions while dropping exact wording, raw outputs, or edge cases. Persistent files provide a different bridge across sessions.</p></div>
          </aside>
        </div>

        <div className="flex items-center gap-3 border-t border-stone-200 bg-stone-50 px-5 py-4 text-sm text-slate-600 md:px-7"><ChevronsDown className="h-5 w-5 text-amber-600" /><span><strong className="text-slate-950">Ordering is part of the harness.</strong> Required instructions and the current goal survive before lower-priority raw history.</span></div>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-slate-950 text-white" data-testid="context-lifecycle">
        <div className="border-b border-white/10 p-5 md:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">Across turns</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div><h2 className="text-2xl font-semibold">Context, cache, and persistence have different lifetimes.</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">Choose an operation and inspect what the next inference can reuse, what must be serialized again, and what survives outside the model.</p></div>
            <span className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] ${outcome.cache === 'warm' ? 'bg-emerald-300 text-emerald-950' : outcome.cache === 'partial' ? 'bg-amber-300 text-amber-950' : 'bg-white/10 text-slate-300'}`} data-testid="context-cache-state">{outcome.cache} cache</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-[minmax(260px,0.7fr)_minmax(0,1.3fr)]">
          <div className="border-b border-white/10 p-5 lg:border-b-0 lg:border-r md:p-7">
            <div className="space-y-1">
              {CONTEXT_LIFECYCLE_OUTCOMES.map((candidate) => <button key={candidate.action} type="button" onClick={() => setAction(candidate.action)} aria-pressed={action === candidate.action} className={`w-full border-l-2 px-4 py-3 text-left text-sm font-semibold transition ${action === candidate.action ? 'border-amber-300 bg-white/[0.07] text-white' : 'border-white/10 text-slate-400 hover:border-white/30 hover:text-white'}`} data-testid={`context-action-${candidate.action}`}>{candidate.label}</button>)}
            </div>
          </div>

          <div className="p-5 md:p-7">
            <div className="grid gap-4 sm:grid-cols-3">
              {[['Input', outcome.inputTokens], ['Cached prefix', outcome.cachedTokens], ['Summary', outcome.summaryTokens]].map(([label, value]) => <div key={String(label)} className="border-t border-white/15 pt-3"><p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p><p className="mt-2 font-mono text-2xl text-white">{value}</p><p className="text-xs text-slate-500">teaching tokens</p></div>)}
            </div>
            <div className="mt-7 space-y-4" data-testid="context-lifecycle-outcome">
              {[['Prompt cache', outcome.cacheCopy], ['Model context', outcome.contextCopy], ['External persistence', outcome.persistenceCopy]].map(([label, copy], index) => <div key={String(label)} className="grid gap-2 border-b border-white/10 pb-4 last:border-b-0 sm:grid-cols-[10rem_minmax(0,1fr)]"><p className={`text-sm font-semibold ${index === 0 ? 'text-amber-300' : index === 1 ? 'text-sky-300' : 'text-emerald-300'}`}>{label}</p><p className="text-sm leading-6 text-slate-300">{copy}</p></div>)}
            </div>
          </div>
        </div>
        <div className="flex items-start gap-3 border-t border-white/10 px-5 py-4 text-sm text-slate-400 md:px-7"><RefreshCw className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" /><p><strong className="text-white">Cache is reused computation, not remembered knowledge.</strong> A session can be restored after its inference cache is cold, and a warm cache does not make information durable.</p></div>
      </section>

      <LearningCheckpoint id="context-owner" question="When an old tool result disappears after compaction, did the model forget it?" choices={[{ value: 'weights', label: 'Yes—the model weights were erased' }, { value: 'call', label: 'It is absent from this call’s context' }, { value: 'cache', label: 'The KV cache permanently stored it elsewhere' }]} correctValue="call" explanation="A model call only conditions on the context supplied for that call. The harness may retain the original result in external state, a trace, or a file even when it is omitted or summarized." />

      <p className="text-xs leading-5 text-slate-500">Research basis: <a className="underline" href="https://openai.com/index/unrolling-the-codex-agent-loop/" target="_blank" rel="noreferrer">OpenAI’s Codex agent loop</a>, <a className="underline" href="https://code.claude.com/docs/en/prompt-caching" target="_blank" rel="noreferrer">Claude Code prompt caching</a>, and <a className="underline" href="https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents" target="_blank" rel="noreferrer">long-running agent harnesses</a>.</p>
    </div>
  );
}
