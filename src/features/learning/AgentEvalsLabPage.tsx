import { useMemo, useState } from 'react';
import {
  Bot,
  Braces,
  CheckCircle2,
  CircleX,
  FlaskConical,
  Play,
  RefreshCcw,
  Scale,
  ShieldCheck,
  Sparkles,
  Timer,
  Wrench,
} from 'lucide-react';
import { LabPageHeader } from './LabPageHeader';
import { LearningCheckpoint } from './LearningCheckpoint';
import {
  runTeachingEval,
  type EvalActor,
  type EvalGraderKind,
  type EvalPromptProfile,
  type EvalSuite,
  type EvalToolQuality,
} from './agentEvaluation';

const actorIcon: Record<EvalActor, typeof Bot> = {
  harness: Braces,
  model: Bot,
  tool: Wrench,
  grader: Scale,
};

const graderLabel: Record<EvalGraderKind, string> = {
  code: 'deterministic',
  model: 'model rubric',
  human: 'human sample',
};

function percent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function ChoiceGroup<T extends string>({
  label,
  values,
  value,
  onChange,
  testIdPrefix,
}: {
  label: string;
  values: Array<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
  testIdPrefix: string;
}) {
  return (
    <div>
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <div className="mt-2 inline-flex rounded-full border border-stone-200 bg-stone-50 p-1" role="group" aria-label={label}>
        {values.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={value === option.value}
            className={`min-h-10 rounded-full px-4 text-xs font-semibold transition sm:text-sm ${value === option.value ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-600 hover:text-slate-950'}`}
            data-testid={`${testIdPrefix}-${option.value}`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ReliabilityBar({ label, value, tone }: { label: string; value: number; tone: 'sky' | 'amber' | 'emerald' }) {
  const color = tone === 'sky' ? 'bg-sky-400' : tone === 'amber' ? 'bg-amber-300' : 'bg-emerald-400';
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-xs"><span className="text-slate-400">{label}</span><strong className="tabular-nums text-white">{percent(value)}</strong></div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className={`h-full rounded-full transition-[width] duration-500 ${color}`} style={{ width: percent(value) }} /></div>
    </div>
  );
}

export function AgentEvalsLabPage() {
  const [promptProfile, setPromptProfile] = useState<EvalPromptProfile>('focused');
  const [toolQuality, setToolQuality] = useState<EvalToolQuality>('clear');
  const [suite, setSuite] = useState<EvalSuite>('regression');
  const [batch, setBatch] = useState(0);
  const [selectedTrial, setSelectedTrial] = useState(0);
  const run = useMemo(() => runTeachingEval(promptProfile, toolQuality, suite, batch), [batch, promptProfile, suite, toolQuality]);
  const trial = run.trials[selectedTrial];

  const rerun = () => {
    setBatch((value) => value + 1);
    setSelectedTrial(0);
  };

  return (
    <div className="space-y-6" data-testid="agent-evals-lab-page">
      <style>{`@keyframes eval-reveal { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      <LabPageHeader eyebrow="Agent evaluation · step 1" title="Measure outcomes, not confidence" description="Run the same agent setup across 20 controlled trials. Inspect traces, grade observable outcomes, and separate one lucky success from repeatable reliability." aside="Mocked · deterministic teaching data" />

      <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50/75 p-4 text-sm leading-6 text-amber-950" role="note">
        The trials are seeded simulations, not benchmark claims about a real model. Their purpose is to make task, trial, trace, outcome, grader, <span className="font-mono">pass@k</span>, and <span className="font-mono">pass^k</span> inspectable.
      </div>

      <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white/85">
        <div className="grid gap-5 border-b border-stone-200 p-5 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end md:p-7">
          <ChoiceGroup label="Prompt strategy" values={[{ value: 'focused', label: 'Focused' }, { value: 'critique-loop', label: 'Critique loop' }]} value={promptProfile} onChange={(value) => { setPromptProfile(value); setSelectedTrial(0); }} testIdPrefix="eval-prompt" />
          <ChoiceGroup label="Tool descriptions" values={[{ value: 'clear', label: 'Explicit' }, { value: 'ambiguous', label: 'Ambiguous' }]} value={toolQuality} onChange={(value) => { setToolQuality(value); setSelectedTrial(0); }} testIdPrefix="eval-tools" />
          <ChoiceGroup label="Evaluation suite" values={[{ value: 'regression', label: 'Regression' }, { value: 'capability', label: 'Capability' }]} value={suite} onChange={(value) => { setSuite(value); setSelectedTrial(0); }} testIdPrefix="eval-suite" />
          <button type="button" onClick={rerun} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-amber-300 px-5 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-amber-200" data-testid="eval-run">
            {batch === 0 ? <Play className="h-4 w-4" /> : <RefreshCcw className="h-4 w-4" />} Run 20 trials
          </button>
        </div>

        <div className="bg-slate-950 p-5 text-white md:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">Batch {batch + 1} · aggregate evidence</p><h2 className="mt-2 text-2xl font-semibold">Reliability changes even when the prose improves.</h2></div>
            <p className="max-w-md text-sm leading-6 text-slate-400">A critique turn raises response quality here, but adds latency, cost, and another opportunity for the run to fail.</p>
          </div>

          <div className="mt-7 grid gap-px bg-white/10 sm:grid-cols-3 xl:grid-cols-6">
            {[
              ['Pass@1', percent(run.successRate), 'observed success'],
              ['Mean quality', `${run.meanQuality}/100`, 'rubric average'],
              ['Pass@3', percent(run.passAt3), 'at least one works'],
              ['Pass³', percent(run.passPower3), 'all three work'],
              ['p95 latency', `${run.p95LatencySeconds.toFixed(1)}s`, 'slow-tail trial'],
              ['Batch cost', `$${run.totalCostUsd.toFixed(2)}`, '20 simulated runs'],
            ].map(([label, value, note]) => <div key={label} className="bg-slate-950 px-4 py-5"><p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold tabular-nums" data-testid={`eval-metric-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>{value}</p><p className="mt-1 text-xs text-slate-500">{note}</p></div>)}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <ReliabilityBar label="One attempt succeeds" value={run.successRate} tone="sky" />
            <ReliabilityBar label="At least one of three succeeds" value={run.passAt3} tone="emerald" />
            <ReliabilityBar label="All three attempts succeed" value={run.passPower3} tone="amber" />
          </div>
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1.3fr)_minmax(330px,0.7fr)]">
          <div className="border-b border-stone-200 p-5 lg:border-b-0 lg:border-r md:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Twenty trials · select one</p><h3 className="mt-2 text-xl font-semibold text-slate-950">The aggregate score is only an index into evidence.</h3></div>
              <div className="flex items-center gap-4 text-xs text-slate-500"><span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> pass</span><span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-500" /> fail</span></div>
            </div>

            <div className="mt-5 grid grid-cols-5 gap-2 sm:grid-cols-10" data-testid="eval-trial-grid">
              {run.trials.map((candidate, index) => (
                <button key={`${batch}-${candidate.id}`} type="button" onClick={() => setSelectedTrial(index)} aria-pressed={selectedTrial === index} aria-label={`Trial ${candidate.id}: ${candidate.success ? 'passed' : 'failed'}`} className={`aspect-square rounded-xl text-xs font-semibold tabular-nums text-white transition hover:-translate-y-0.5 ${candidate.success ? 'bg-emerald-600' : 'bg-red-600'} ${selectedTrial === index ? 'ring-2 ring-slate-950 ring-offset-2' : 'opacity-75 hover:opacity-100'}`} data-testid={`eval-trial-${candidate.id}`}>{candidate.id}</button>
              ))}
            </div>

            <div key={`${batch}-${selectedTrial}`} className="mt-7 motion-safe:animate-[eval-reveal_240ms_ease-out]" data-testid="eval-selected-trial">
              <div className="flex items-start justify-between gap-4 border-b border-stone-200 pb-4">
                <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Trial {trial.id} · {trial.success ? 'passed' : 'failed'}</p><p className="mt-2 font-semibold text-slate-950">{trial.task}</p></div>
                {trial.success ? <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600" /> : <CircleX className="h-6 w-6 shrink-0 text-red-600" />}
              </div>
              <ol className="mt-5 space-y-4">
                {trial.trace.map((step, index) => {
                  const Icon = actorIcon[step.actor];
                  return <li key={`${step.actor}-${index}`} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-slate-600"><Icon className="h-4 w-4" /></span><div className="border-b border-stone-100 pb-4"><p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-400">{step.actor}</p><p className="mt-1 font-semibold text-slate-900">{step.label}</p><p className="mt-1 text-sm leading-6 text-slate-600">{step.detail}</p></div></li>;
                })}
              </ol>
            </div>
          </div>

          <aside className="bg-stone-50/70 p-5 md:p-7" aria-label="Trial graders">
            <div className="flex items-center gap-3"><FlaskConical className="h-5 w-5 text-amber-700" /><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Grader evidence</p><h3 className="mt-1 font-semibold text-slate-950">Different graders answer different questions.</h3></div></div>
            <div className="mt-5 space-y-3">
              {trial.grades.map((grade) => (
                <div key={grade.id} className={`border-l-2 bg-white p-4 ${grade.passed ? 'border-emerald-500' : 'border-red-500'}`} data-testid={`eval-grade-${grade.id}`}>
                  <div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-slate-950">{grade.label}</p><p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-slate-400">{graderLabel[grade.kind]}</p></div><span className={`font-mono text-sm font-semibold ${grade.passed ? 'text-emerald-700' : 'text-red-700'}`}>{grade.score}</span></div>
                  <p className="mt-3 text-xs leading-5 text-slate-600">{grade.evidence}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 border-t border-stone-200 pt-5 text-xs leading-5 text-slate-500"><strong className="text-slate-700">Calibration rule:</strong> deterministic graders verify exact state, model graders scale subjective review, and sampled human review checks whether the rubric remains valid.</div>
          </aside>
        </div>
      </section>

      <section className="grid gap-px overflow-hidden rounded-[2rem] bg-stone-200 sm:grid-cols-3">
        <div className="bg-white p-6"><Sparkles className="h-5 w-5 text-sky-600" /><p className="mt-4 font-semibold text-slate-950">Capability eval</p><p className="mt-2 text-sm leading-6 text-slate-600">Asks what the agent cannot do reliably yet. It should leave room for improvement.</p></div>
        <div className="bg-white p-6"><ShieldCheck className="h-5 w-5 text-emerald-600" /><p className="mt-4 font-semibold text-slate-950">Regression eval</p><p className="mt-2 text-sm leading-6 text-slate-600">Protects behavior that already works. Expected success should be close to 100%.</p></div>
        <div className="bg-white p-6"><Timer className="h-5 w-5 text-amber-700" /><p className="mt-4 font-semibold text-slate-950">Production signal</p><p className="mt-2 text-sm leading-6 text-slate-600">Adds real latency, cost, user feedback, monitoring, and changing task distributions.</p></div>
      </section>

      <LearningCheckpoint id="agent-eval-evidence" question="An agent passes once in three attempts. Which metric reveals whether all three attempts are reliable?" choices={[{ value: 'pass-at-k', label: 'pass@3: at least one attempt succeeds' }, { value: 'pass-power-k', label: 'pass³: all three attempts succeed' }, { value: 'quality', label: 'Mean response quality only' }]} correctValue="pass-power-k" explanation="pass@k rewards having at least one successful attempt. pass^k measures consistency by requiring every attempt to succeed, so it falls as k grows whenever per-trial success is below 100%." />

      <p className="text-xs leading-5 text-slate-500">Research basis: <a className="underline" href="https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents" target="_blank" rel="noreferrer">Anthropic’s agent evaluation guide</a> and <a className="underline" href="https://platform.openai.com/docs/guides/evals" target="_blank" rel="noreferrer">OpenAI’s evaluation guidance</a>. The displayed results are intentionally mocked and must not be interpreted as vendor or model benchmarks.</p>
    </div>
  );
}
