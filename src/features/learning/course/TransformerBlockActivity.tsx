import { useMemo, useState } from 'react';

const base = [0.79, 0.03];
const attention = [0.18, 0.31];
const mlp = [-0.07, 0.22];

const format = (values: number[]) => `[${values.map((value) => value.toFixed(2)).join(', ')}]`;

export function TransformerBlockActivity() {
  const [useAttention, setUseAttention] = useState(true);
  const [useMlp, setUseMlp] = useState(true);
  const output = useMemo(() => base.map((value, index) => value + (useAttention ? attention[index] : 0) + (useMlp ? mlp[index] : 0)), [useAttention, useMlp]);

  return (
    <section className="rounded-[2rem] bg-slate-950 p-5 text-white md:p-8" data-testid="transformer-block-activity">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">One position · one block</p><h3 className="mt-3 text-2xl font-semibold">Toggle each learned update.</h3></div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setUseAttention((value) => !value)} aria-pressed={useAttention} className={`min-h-11 rounded-full px-4 text-sm font-semibold ${useAttention ? 'bg-sky-400 text-slate-950' : 'border border-white/15 text-slate-400'}`} data-testid="block-attention-toggle">Attention</button>
          <button type="button" onClick={() => setUseMlp((value) => !value)} aria-pressed={useMlp} className={`min-h-11 rounded-full px-4 text-sm font-semibold ${useMlp ? 'bg-amber-300 text-slate-950' : 'border border-white/15 text-slate-400'}`} data-testid="block-mlp-toggle">MLP</button>
        </div>
      </div>
      <div className="mt-8 grid gap-px overflow-hidden rounded-2xl bg-white/10 md:grid-cols-4">
        <div className="bg-slate-900 p-5"><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Input R</p><p className="mt-3 font-mono text-lg">{format(base)}</p></div>
        <div className="bg-slate-900 p-5"><p className="text-xs uppercase tracking-[0.16em] text-sky-300">Communicate</p><p className="mt-3 font-mono text-lg">{useAttention ? `+ ${format(attention)}` : 'skipped'}</p></div>
        <div className="bg-slate-900 p-5"><p className="text-xs uppercase tracking-[0.16em] text-amber-300">Compute locally</p><p className="mt-3 font-mono text-lg">{useMlp ? `+ ${format(mlp)}` : 'skipped'}</p></div>
        <div className="bg-slate-900 p-5"><p className="text-xs uppercase tracking-[0.16em] text-emerald-300">Output R next</p><p className="mt-3 font-mono text-lg text-emerald-200" data-testid="block-output">{format(output)}</p></div>
      </div>
    </section>
  );
}
