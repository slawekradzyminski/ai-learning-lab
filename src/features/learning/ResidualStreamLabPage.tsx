import { useState } from 'react';
import { ArrowRight, BookOpen, ScanSearch } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LabPageHeader } from './LabPageHeader';
import { LearningCheckpoint } from './LearningCheckpoint';
import { RESIDUAL_LAYERS, RESIDUAL_PROMPT_TOKENS, residualLayerAt } from './residualStreamMath';

function valueColor(value: number): string {
  if (value >= 1) return 'bg-sky-400 text-slate-950';
  if (value >= 0.25) return 'bg-sky-300/55 text-sky-950';
  if (value <= -0.8) return 'bg-amber-400 text-slate-950';
  if (value <= -0.2) return 'bg-amber-200/70 text-amber-950';
  return 'bg-stone-100 text-slate-400';
}

export function ResidualStreamLabPage() {
  const [selectedLayer, setSelectedLayer] = useState(0);
  const layer = residualLayerAt(selectedLayer);
  const maxProbability = Math.max(...layer.candidates.map(({ probability }) => probability));

  return (
    <div className="space-y-6" data-testid="residual-stream-lab-page">
      <LabPageHeader
        eyebrow="Language systems · step 3"
        title="Watch the prediction form"
        description="Scrub through a compact teaching trace of the last token’s residual stream, then apply an intermediate vocabulary projection—a logit lens—to see candidate continuations change."
        aside="Embedding + updates → logits"
      />

      <div className="rounded-[1.5rem] border border-sky-200 bg-sky-50/75 p-4 text-sm leading-6 text-sky-950" role="note" data-testid="residual-provenance">
        This is an inspectable teaching trace inspired by Chapter 7 of <em>The Welch Labs Illustrated Guide to AI</em>. Bonsai’s hidden states are not exposed by the current runtime, so these values are illustrative—not captured Bonsai activations.
      </div>

      <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white/85" data-testid="residual-workspace">
        <div className="border-b border-stone-200 px-5 py-5 md:px-7">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Prompt · final position selected</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {RESIDUAL_PROMPT_TOKENS.map((token, index) => <span key={`${token}-${index}`} className={`rounded-xl border px-3 py-2 font-mono text-sm ${index === RESIDUAL_PROMPT_TOKENS.length - 1 ? 'border-sky-400 bg-sky-50 text-sky-950' : 'border-stone-200 text-slate-600'}`}>{token}</span>)}
          </div>
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1.08fr)_minmax(340px,0.72fr)]">
          <div className="p-5 md:p-7">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Residual stream snapshot</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950" data-testid="residual-stage">{layer.stage}</h2>
                <p className="mt-1 text-sm text-slate-600">{layer.update}</p>
              </div>
              <p className="font-mono text-sm text-slate-500">layer {layer.layer} / {RESIDUAL_LAYERS.length - 1}</p>
            </div>

            <div className="mt-6 grid grid-cols-8 gap-1" data-testid="residual-heatmap">
              {layer.vector.map((value, index) => <span key={`${layer.layer}-${index}`} title={`dimension ${index + 1}: ${value}`} className={`flex aspect-square items-center justify-center rounded-sm font-mono text-[0.55rem] ${valueColor(value)}`}>{value.toFixed(1)}</span>)}
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">48 visible teaching dimensions stand in for thousands of coordinates. Position and color are visual encodings, not named human concepts.</p>

            <label htmlFor="residual-layer" className="mt-7 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Move through the transformer</label>
            <input id="residual-layer" type="range" min="0" max={RESIDUAL_LAYERS.length - 1} value={selectedLayer} onChange={(event) => setSelectedLayer(Number(event.target.value))} className="mt-3 w-full accent-sky-600" data-testid="residual-layer-slider" />
            <div className="mt-3 grid grid-cols-7 gap-1">
              {RESIDUAL_LAYERS.map((candidate) => <button key={candidate.layer} type="button" onClick={() => setSelectedLayer(candidate.layer)} aria-pressed={candidate.layer === layer.layer} className={`min-h-10 rounded-lg text-xs font-semibold transition ${candidate.layer === layer.layer ? 'bg-slate-950 text-white' : 'bg-stone-100 text-slate-500 hover:bg-stone-200'}`} data-testid={`residual-layer-${candidate.layer}`}>{candidate.layer}</button>)}
            </div>
          </div>

          <div className="border-t border-stone-200 bg-slate-950 p-5 text-white lg:border-l lg:border-t-0 md:p-7">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-300"><ScanSearch className="h-4 w-4" /> Teaching logit lens</p>
            <h3 className="mt-3 text-xl font-semibold">If we decoded here…</h3>
            <div className="mt-6 space-y-5" data-testid="residual-candidates">
              {layer.candidates.map(({ token, probability }, index) => (
                <div key={token}>
                  <div className="flex items-center justify-between gap-4"><span className="font-mono text-base">{token}</span><span className="font-mono text-sm text-slate-400">{(probability * 100).toFixed(0)}%</span></div>
                  <div className="mt-2 h-2 bg-white/10"><div className={`h-full transition-all duration-300 ${index === 0 ? 'bg-sky-400' : 'bg-slate-600'}`} style={{ width: `${(probability / maxProbability) * 100}%` }} /></div>
                </div>
              ))}
            </div>
            <p className="mt-7 border-l-2 border-amber-300 pl-4 text-sm leading-6 text-slate-300" data-testid="residual-interpretation">{layer.interpretation}</p>
            <p className="mt-6 text-xs leading-5 text-slate-500">An intermediate projection is a probe. It does not prove that a layer “believes” a word or that each coordinate has a stable human meaning.</p>
          </div>
        </div>
      </section>

      <LearningCheckpoint id="residual-update" question="What persists between transformer blocks?" choices={[{ value: 'probabilities', label: 'The final probability distribution' }, { value: 'stream', label: 'A token-position matrix updated by residual additions' }, { value: 'queries', label: 'Every query from every earlier layer' }]} correctValue="stream" explanation="Each block reads the current residual stream and adds an update. The final state is normalized and unembedded into vocabulary logits." />

      <section className="grid gap-5 rounded-[2rem] bg-slate-950 p-6 text-white md:grid-cols-[1fr_auto] md:items-center md:p-8">
        <div><p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-300"><BookOpen className="h-4 w-4" /> Representation bridge</p><h2 className="mt-3 text-2xl font-semibold">Now turn the final state into a choice.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">The next-token lab starts where this one stops: logits become probabilities, then decoding selects one token.</p></div>
        <Link to="/learn/next-token" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-sky-400 px-5 text-sm font-semibold text-slate-950">Open next-token lab <ArrowRight className="h-4 w-4" /></Link>
      </section>
    </div>
  );
}
