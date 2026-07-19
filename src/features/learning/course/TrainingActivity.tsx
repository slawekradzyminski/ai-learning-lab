import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function TrainingActivity() {
  const [probability, setProbability] = useState(0.18);
  const loss = -Math.log(probability);

  return (
    <section className="grid overflow-hidden rounded-[2rem] border border-stone-200 bg-white lg:grid-cols-[1fr_0.72fr]" data-testid="training-activity">
      <div className="p-5 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Observed target · “tired”</p>
        <h3 className="mt-3 text-2xl font-semibold text-slate-950">Move the target probability.</h3>
        <label htmlFor="target-probability" className="mt-7 block text-sm font-semibold text-slate-700">Probability assigned to the observed token</label>
        <input id="target-probability" type="range" min="0.01" max="0.99" step="0.01" value={probability} onChange={(event) => setProbability(Number(event.target.value))} className="mt-4 w-full accent-sky-600" data-testid="training-probability" />
        <div className="mt-5 grid grid-cols-2 gap-5 border-t border-stone-200 pt-5"><div><p className="text-xs text-slate-500">p(tired)</p><p className="mt-1 font-mono text-3xl">{probability.toFixed(2)}</p></div><div><p className="text-xs text-slate-500">loss = −ln(p)</p><p className="mt-1 font-mono text-3xl text-sky-700" data-testid="training-loss">{loss.toFixed(3)}</p></div></div>
      </div>
      <div className="bg-slate-950 p-5 text-white md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Go deeper</p>
        <p className="mt-3 text-sm leading-6 text-slate-300">Backpropagation computes which parameters contributed to this loss. An optimizer decides how to update them.</p>
        <div className="mt-7 divide-y divide-white/10 border-y border-white/10">
          <Link to="/learn/backpropagation" className="flex min-h-14 items-center justify-between text-sm font-semibold hover:text-sky-300">Trace credit backward <ArrowRight className="h-4 w-4" /></Link>
          <Link to="/learn/gradient-descent" className="flex min-h-14 items-center justify-between text-sm font-semibold hover:text-sky-300">Walk the optimizer step <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </div>
    </section>
  );
}
