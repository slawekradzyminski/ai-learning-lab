import { useState } from 'react';
import { CheckCircle2, ChevronDown, FileCheck2, ShieldCheck, SquareActivity, TestTube2 } from 'lucide-react';
import { AGENT_COURSE_SCENARIO } from './content/agentCourseBible';

const review = [
  { boundary: 'Goal contract', decision: 'Three verified laptops under €900; write one report; never purchase or contact a vendor.', evidence: 'Acceptance checklist and forbidden-effect assertions', icon: FileCheck2 },
  { boundary: 'Context contract', decision: 'Include current criteria and sourced product records; label untrusted seller text as evidence, never instructions.', evidence: 'Serialized context packet with source and retrieval time', icon: SquareActivity },
  { boundary: 'Tool contract', decision: 'Expose two scoped reads and one workspace write. Do not expose purchase_product.', evidence: 'Tool registry, schema validation, authorization trace', icon: ShieldCheck },
  { boundary: 'Evaluation contract', decision: 'Grade terminal state and trajectory across repeated trials.', evidence: 'Report checks, citation checks, forbidden-call checks, cost and reliability', icon: TestTube2 },
] as const;

export function AgentCourseCapstoneActivity() {
  const [revealed, setRevealed] = useState(false);

  return (
    <section className="overflow-hidden border-y border-stone-300 bg-white/65" data-testid="agent-course-capstone-activity">
      <div className="grid gap-8 bg-slate-950 p-6 text-white md:grid-cols-[minmax(0,1fr)_17rem] md:p-9">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">Architecture review</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">Defend every transition before you reveal the reference design.</h2>
          <p className="mt-5 max-w-3xl font-mono text-sm leading-7 text-slate-300">{AGENT_COURSE_SCENARIO.userGoal}</p>
        </div>
        <div className="border-l border-white/15 pl-5 text-sm leading-6 text-slate-400">
          <p className="font-semibold text-white">Your review must prove</p>
          <p className="mt-2">useful outcome · current evidence · bounded effects · observable trace · repeatable evaluation</p>
        </div>
      </div>

      <div className="p-6 md:p-9">
        <ol className="grid gap-4 md:grid-cols-2">
          {['Write a measurable task and terminal-state contract.', 'Draw the model–harness–tool ownership boundary.', 'List each tool, effect class, permission, approval, and timeout.', 'Specify context sources, authority, provenance, and expiry.', 'Trace one success, one stale-evidence failure, and one denied action.', 'Define graders for outcome, trajectory, forbidden effects, reliability, and cost.'].map((item, index) => (
            <li key={item} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 border-b border-stone-200 pb-4 text-sm leading-6 text-slate-700"><span className="font-mono text-xs text-amber-700">{String(index + 1).padStart(2, '0')}</span>{item}</li>
          ))}
        </ol>

        <button type="button" onClick={() => setRevealed((value) => !value)} className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-amber-300 px-5 text-sm font-semibold text-slate-950" aria-expanded={revealed} data-testid="agent-capstone-reveal">
          {revealed ? 'Hide reference review' : 'Reveal reference review'} <ChevronDown className={`h-4 w-4 transition-transform ${revealed ? 'rotate-180' : ''}`} />
        </button>

        {revealed ? (
          <div className="learning-reveal mt-7 divide-y divide-stone-200 border-y border-stone-200" data-testid="agent-capstone-review">
            {review.map(({ boundary, decision, evidence, icon: Icon }) => (
              <article key={boundary} className="grid gap-4 py-5 md:grid-cols-[13rem_minmax(0,1fr)_minmax(15rem,0.75fr)] md:gap-7">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-950"><Icon className="h-4 w-4 text-amber-700" />{boundary}</h3>
                <p className="text-sm leading-6 text-slate-700">{decision}</p>
                <p className="flex gap-2 text-xs leading-5 text-slate-500"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />{evidence}</p>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
