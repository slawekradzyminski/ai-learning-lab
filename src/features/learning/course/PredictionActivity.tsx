import { useState } from 'react';
import { LLM_COURSE_PROMPT } from './courseScenario';

const candidates = [
  { token: ' tired', probability: 0.48 },
  { token: ' frightened', probability: 0.21 },
  { token: ' late', probability: 0.14 },
  { token: ' small', probability: 0.09 },
  { token: ' dark', probability: 0.08 },
];

export function PredictionActivity() {
  const [prediction, setPrediction] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  return (
    <section className="overflow-hidden rounded-[2rem] bg-slate-950 text-white" data-testid="course-prediction-activity">
      <div className="border-b border-white/10 px-5 py-6 md:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">One unfinished sentence</p>
        <p className="mt-4 max-w-4xl font-mono text-xl leading-9 md:text-2xl">{LLM_COURSE_PROMPT}<span className="ml-1 animate-pulse text-sky-300">▍</span></p>
      </div>
      <div className="grid gap-8 p-5 lg:grid-cols-[0.8fr_1.2fr] md:p-8">
        <div>
          <h3 className="text-xl font-semibold">Commit before reveal</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">Choose the continuation you expect to rank first.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {candidates.map(({ token }) => (
              <button key={token} type="button" onClick={() => { setPrediction(token); setRevealed(false); }} aria-pressed={prediction === token} className={`min-h-11 rounded-full px-4 font-mono text-sm transition ${prediction === token ? 'bg-sky-400 text-slate-950' : 'border border-white/15 text-slate-200 hover:border-sky-400'}`}>
                {token.trim()}
              </button>
            ))}
          </div>
          <button type="button" disabled={!prediction} onClick={() => setRevealed(true)} className="mt-5 min-h-11 rounded-full bg-white px-5 text-sm font-semibold text-slate-950 disabled:opacity-40" data-testid="course-prediction-reveal">Reveal distribution</button>
        </div>
        <div className="min-h-64 border-l-0 border-white/10 lg:border-l lg:pl-8" aria-live="polite">
          {revealed ? (
            <div className="space-y-4" data-testid="course-prediction-distribution">
              {candidates.map(({ token, probability }) => (
                <div key={token}>
                  <div className="mb-1.5 flex justify-between font-mono text-sm"><span>{token.trim()}</span><span className="text-slate-400">{(probability * 100).toFixed(0)}%</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-sky-400 transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${probability * 100}%` }} /></div>
                </div>
              ))}
              <p className="pt-2 text-sm leading-6 text-slate-400">Your prediction was <span className="font-mono text-white">{prediction?.trim()}</span>. The course will now follow how the model constructs this distribution.</p>
            </div>
          ) : <p className="flex h-full min-h-48 items-center text-sm text-slate-500">The distribution stays hidden until you commit.</p>}
        </div>
      </div>
    </section>
  );
}
