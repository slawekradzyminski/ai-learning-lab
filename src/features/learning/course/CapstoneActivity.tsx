import { useState } from 'react';

const impacts = [
  ['Text and token IDs', 'Change immediately and deterministically in the tokenizer.'],
  ['Embedding lookup', 'Uses different rows for any changed token IDs.'],
  ['Attention and residual states', 'Require a new forward pass; exact values are model-dependent.'],
  ['Logits and probabilities', 'Require inference and may change across the entire vocabulary.'],
  ['KV cache', 'Must represent the modified prefix; stale rows cannot be silently reused.'],
  ['Model parameters', 'Stay fixed during ordinary inference.'],
];

export function CapstoneActivity() {
  const [subject, setSubject] = useState<'animal' | 'robot' | 'child'>('robot');
  return (
    <section className="overflow-hidden rounded-[2rem] bg-slate-950 text-white" data-testid="capstone-activity">
      <div className="border-b border-white/10 p-5 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Intervention</p>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">For every row, name whether your evidence comes from a hand calculation, the GPT-2 course trace, or a local Bonsai comparison.</p>
        <div className="mt-4 flex flex-wrap items-center gap-3 font-mono text-lg">
          <span>The</span>
          <select value={subject} onChange={(event) => setSubject(event.target.value as typeof subject)} className="h-11 rounded-xl border border-sky-400 bg-slate-900 px-3 text-sky-200" data-testid="capstone-subject"><option value="animal">animal</option><option value="robot">robot</option><option value="child">child</option></select>
          <span>did not cross the street because it was too …</span>
        </div>
      </div>
      <div className="divide-y divide-white/10">
        {impacts.map(([stage, effect], index) => <div key={stage} className="grid gap-2 px-5 py-4 md:grid-cols-[2rem_14rem_1fr] md:px-8"><span className="font-mono text-xs text-sky-400">0{index + 1}</span><span className="font-semibold">{stage}</span><span className="text-sm leading-6 text-slate-400">{effect}</span></div>)}
      </div>
    </section>
  );
}
