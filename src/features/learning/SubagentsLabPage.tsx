import { useMemo, useState } from 'react';
import { Bot, Boxes, GitMerge, Timer, TriangleAlert, UsersRound } from 'lucide-react';
import { LabPageHeader } from './LabPageHeader';
import { LearningCheckpoint } from './LearningCheckpoint';
import { simulateDelegation, type DelegationScenario } from './subagentSimulation';

export function SubagentsLabPage() {
  const [scenario, setScenario] = useState<DelegationScenario>('bounded');
  const [parallel, setParallel] = useState(true);
  const [isolated, setIsolated] = useState(false);
  const simulation = useMemo(() => simulateDelegation(scenario, parallel, isolated), [scenario, parallel, isolated]);

  return (
    <div className="space-y-6" data-testid="subagents-lab-page">
      <LabPageHeader eyebrow="Agent runtime · step 2" title="Delegate without losing control" description="Compare sequential and parallel work, separate parent and child context, and expose the write conflicts that orchestration must resolve." aside="Faster ≠ cheaper" />

      <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50/75 p-4 text-sm leading-6 text-amber-950" role="note">
        Subagents keep noisy investigation out of the parent context and can reduce elapsed time. They still consume tokens, need bounded tasks, and can collide when they share writable files.
      </div>

      <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white/85">
        <div className="flex flex-wrap items-end justify-between gap-5 border-b border-stone-200 p-5 md:p-7">
          <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Delegation design</p><h2 className="mt-2 text-2xl font-semibold text-slate-950">Change coordination, not task complexity.</h2></div>
          <div className="flex flex-wrap gap-2">
            <div className="inline-flex rounded-full border border-stone-200 bg-stone-50 p-1">{(['bounded', 'overlap'] as const).map((value) => <button key={value} type="button" onClick={() => setScenario(value)} aria-pressed={scenario === value} className={`min-h-10 rounded-full px-4 text-sm font-semibold capitalize ${scenario === value ? 'bg-slate-950 text-white' : 'text-slate-600'}`} data-testid={`subagent-scenario-${value}`}>{value === 'bounded' ? 'Bounded tasks' : 'Overlapping edits'}</button>)}</div>
            <label className="flex min-h-11 items-center gap-2 rounded-full border border-stone-200 px-4 text-sm font-semibold text-slate-700"><input type="checkbox" checked={parallel} onChange={(event) => setParallel(event.target.checked)} className="h-4 w-4 accent-amber-600" data-testid="subagent-parallel" /> Parallel</label>
            <label className="flex min-h-11 items-center gap-2 rounded-full border border-stone-200 px-4 text-sm font-semibold text-slate-700"><input type="checkbox" checked={isolated} onChange={(event) => setIsolated(event.target.checked)} className="h-4 w-4 accent-amber-600" data-testid="subagent-isolated" /> Isolated worktrees</label>
          </div>
        </div>

        <div className="bg-slate-950 p-5 text-white md:p-7">
          <div className="flex items-center gap-3 text-sm text-slate-400"><Bot className="h-5 w-5 text-sky-300" /><span><strong className="text-white">Parent agent</strong> sends bounded task prompts and receives compact result summaries.</span></div>
          <div className={`mt-6 grid gap-3 ${parallel ? 'md:grid-cols-3' : ''}`} data-testid="subagent-tasks">
            {simulation.tasks.map((task, index) => <div key={task.id} className="relative border border-white/15 bg-white/[0.035] p-5"><span className="font-mono text-xs text-amber-300">child {index + 1}</span><p className="mt-3 font-semibold">{task.label}</p><p className="mt-2 text-xs text-slate-500">{task.minutes} min · {task.tokens.toLocaleString()} tokens</p><p className="mt-4 min-h-5 font-mono text-[0.68rem] text-slate-400">{task.writes.length ? `writes ${task.writes.join(', ')}` : 'read-only investigation'}</p></div>)}
          </div>
          <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-5 text-sm text-slate-400"><GitMerge className="h-5 w-5 text-emerald-300" /><span>Each child returns a result, not its entire working context. The parent remains responsible for synthesis and verification.</span></div>
        </div>

        <div className="grid gap-px bg-stone-200 sm:grid-cols-3">
          <div className="bg-white p-5"><Timer className="h-5 w-5 text-amber-700" /><p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-500">Elapsed time</p><p className="mt-1 font-mono text-2xl text-slate-950" data-testid="subagent-time">{simulation.elapsedMinutes} min</p></div>
          <div className="bg-white p-5"><Boxes className="h-5 w-5 text-sky-700" /><p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-500">Total child tokens</p><p className="mt-1 font-mono text-2xl text-slate-950">{simulation.totalTokens.toLocaleString()}</p></div>
          <div className="bg-white p-5"><UsersRound className="h-5 w-5 text-emerald-700" /><p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-500">Parent context</p><p className="mt-1 font-mono text-2xl text-slate-950">{simulation.parentContextTokens.toLocaleString()}</p></div>
        </div>

        <div className={`flex items-start gap-3 border-t p-5 md:px-7 ${simulation.conflict ? 'border-red-200 bg-red-50 text-red-950' : simulation.mergeRequired ? 'border-amber-200 bg-amber-50 text-amber-950' : 'border-emerald-200 bg-emerald-50 text-emerald-950'}`} data-testid="subagent-conflict">
          {simulation.conflict ? <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" /> : <GitMerge className="mt-0.5 h-5 w-5 shrink-0" />}<p className="text-sm leading-6"><strong>{simulation.conflict ? `Write collision on ${simulation.conflictPath}.` : simulation.mergeRequired ? 'Writes are isolated, but an intentional merge is still required.' : 'No shared-write conflict in this task split.'}</strong> {simulation.conflict ? 'Parallel execution alone does not provide filesystem isolation.' : 'The parent can review outcomes before integrating them.'}</p>
        </div>
      </section>

      <LearningCheckpoint id="subagent-cost" question="What usually happens to total token use when independent work runs in parallel subagents?" choices={[{ value: 'zero', label: 'It falls to nearly zero' }, { value: 'same-or-more', label: 'It stays similar or increases' }, { value: 'shared', label: 'All agents share one hidden context' }]} correctValue="same-or-more" explanation="Parallelism can reduce wall-clock time and parent-context noise, but each child still consumes its own context and output tokens." />

      <p className="text-xs leading-5 text-slate-500">Research basis: <a className="underline" href="https://learn.chatgpt.com/docs/agent-configuration/subagents" target="_blank" rel="noreferrer">Codex subagents</a>, <a className="underline" href="https://code.claude.com/docs/en/sub-agents" target="_blank" rel="noreferrer">Claude Code subagents</a>, and <a className="underline" href="https://code.claude.com/docs/en/worktrees" target="_blank" rel="noreferrer">worktree isolation</a>.</p>
    </div>
  );
}
