import { useState } from 'react';
import { BookOpenCheck, CheckCircle2, CircleAlert, Database, KeyRound, MessageSquareText, Sparkles, UserRoundCog } from 'lucide-react';
import { LabPageHeader } from './LabPageHeader';
import { LearningCheckpoint } from './LearningCheckpoint';
import { evaluateMemoryPlacement, MEMORY_DESTINATIONS, MEMORY_SCENARIOS, type MemoryDestination } from './memoryPlacement';

const destinationIcons: Record<MemoryDestination, typeof BookOpenCheck> = {
  turn: MessageSquareText,
  instructions: BookOpenCheck,
  memory: UserRoundCog,
  skill: Sparkles,
  external: Database,
  secret: KeyRound,
};

export function MemoryInstructionsLabPage() {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [destination, setDestination] = useState<MemoryDestination | null>(null);
  const scenario = MEMORY_SCENARIOS[scenarioIndex];
  const result = destination ? evaluateMemoryPlacement(scenario, destination) : null;

  const chooseScenario = (index: number) => {
    setScenarioIndex(index);
    setDestination(null);
  };

  return (
    <div className="space-y-6" data-testid="memory-instructions-lab-page">
      <LabPageHeader eyebrow="Agent context · step 2" title="Place durable information deliberately" description="Classify rules, preferences, workflows, evidence, and secrets by lifetime. Compare what belongs in the active turn, project instructions, memory, a skill, or an external system." aside="Persistence ≠ recall" />

      <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50/75 p-4 text-sm leading-6 text-amber-950" role="note">
        Required team rules belong in explicit project instructions. Memory can improve continuity, but it should not become an invisible policy engine or a secret store.
      </div>

      <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white/85">
        <div className="grid lg:grid-cols-[minmax(260px,0.65fr)_minmax(0,1.35fr)]">
          <div className="border-b border-stone-200 bg-stone-50/70 p-5 lg:border-b-0 lg:border-r md:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Choose information</p>
            <div className="mt-4 space-y-1">
              {MEMORY_SCENARIOS.map((candidate, index) => <button key={candidate.id} type="button" onClick={() => chooseScenario(index)} aria-pressed={scenarioIndex === index} className={`w-full border-l-2 px-4 py-3 text-left text-sm transition ${scenarioIndex === index ? 'border-slate-950 bg-white font-semibold text-slate-950' : 'border-stone-200 text-slate-600 hover:border-amber-400'}`} data-testid={`memory-scenario-${candidate.id}`}>{candidate.fact}</button>)}
            </div>
          </div>

          <div className="p-5 md:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Placement problem</p>
            <h2 className="mt-3 max-w-3xl text-2xl font-semibold leading-8 text-slate-950" data-testid="memory-fact">{scenario.fact}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">{scenario.context}</p>

            <div className="mt-7 grid gap-px overflow-hidden rounded-2xl bg-stone-200 sm:grid-cols-2 xl:grid-cols-3" role="group" aria-label="Information destination">
              {MEMORY_DESTINATIONS.map((candidate) => {
                const Icon = destinationIcons[candidate.id];
                const selected = destination === candidate.id;
                return <button key={candidate.id} type="button" onClick={() => setDestination(candidate.id)} aria-pressed={selected} className={`min-h-28 bg-white p-4 text-left transition hover:bg-amber-50 ${selected ? 'ring-2 ring-inset ring-amber-500' : ''}`} data-testid={`memory-destination-${candidate.id}`}><Icon className={`h-5 w-5 ${selected ? 'text-amber-700' : 'text-slate-400'}`} /><p className="mt-3 text-sm font-semibold text-slate-950">{candidate.label}</p><p className="mt-1 text-xs leading-5 text-slate-500">{candidate.lifetime}</p></button>;
              })}
            </div>

            <div className={`mt-6 min-h-28 border-l-4 p-5 ${result ? result.correct ? 'border-emerald-500 bg-emerald-50' : 'border-amber-500 bg-amber-50' : 'border-stone-300 bg-stone-50'}`} aria-live="polite" data-testid="memory-result">
              <div className="flex items-start gap-3">{result?.correct ? <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-700" /> : <CircleAlert className="mt-0.5 h-5 w-5 text-amber-700" />}<div><p className="font-semibold text-slate-950">{result ? result.correct ? 'Good placement' : 'Choose by lifetime and authority' : 'Place this information'}</p><p className="mt-1 text-sm leading-6 text-slate-600">{result?.explanation ?? 'Ask whether it is temporary, mandatory, reusable, exact, personal, or sensitive.'}</p></div></div>
            </div>
          </div>
        </div>

        <div className="grid border-t border-stone-200 bg-slate-950 text-sm text-slate-300 md:grid-cols-2">
          <div className="border-b border-white/10 p-5 md:border-b-0 md:border-r md:p-6"><p className="font-mono text-xs text-amber-300">CODEX</p><p className="mt-2"><strong className="text-white">AGENTS.md</strong> carries repository guidance; local memories carry learned context; skills load reusable workflows.</p></div>
          <div className="p-5 md:p-6"><p className="font-mono text-xs text-sky-300">CLAUDE CODE</p><p className="mt-2"><strong className="text-white">CLAUDE.md</strong> carries hierarchical instructions; auto memory stores project-local learned context.</p></div>
        </div>
      </section>

      <LearningCheckpoint id="memory-policy" question="Where should a non-negotiable repository rule live?" choices={[{ value: 'memory', label: 'Only in auto memory' }, { value: 'instructions', label: 'In explicit project instructions' }, { value: 'cache', label: 'In the prompt cache' }]} correctValue="instructions" explanation="Project instructions are inspectable, versionable, and consistently loaded. Use deterministic checks as well when the rule must be enforced." />

      <p className="text-xs leading-5 text-slate-500">Research basis: <a className="underline" href="https://learn.chatgpt.com/docs/customization/overview" target="_blank" rel="noreferrer">Codex customization</a>, <a className="underline" href="https://learn.chatgpt.com/docs/customization/memories" target="_blank" rel="noreferrer">Codex memories</a>, and <a className="underline" href="https://code.claude.com/docs/en/memory" target="_blank" rel="noreferrer">Claude Code memory</a>.</p>
    </div>
  );
}
