import { useCallback, useEffect, useState } from 'react';
import { Check, Cpu, LoaderCircle, Plus, RefreshCw } from 'lucide-react';
import { gpt2 } from '../../lib/api';
import type { Gpt2Prediction, Gpt2TraceResponse } from '../../types/gpt2';
import { Gpt2VectorStrip } from './Gpt2VectorStrip';
import { gpt2TraceError, visibleGpt2Token } from './gpt2TraceUi';

const DEFAULT_PROMPT = 'The animal did not cross the street because it was too';
const STAGES = [
  { id: 'pre', label: 'Before block', detail: 'State entering this transformer block' },
  { id: 'attention', label: '+ attention', detail: 'Attention update added to the same stream' },
  { id: 'mlp', label: '+ MLP', detail: 'MLP update added to the intermediate stream' },
] as const;

type Stage = typeof STAGES[number]['id'];

function predictionList(predictions: Gpt2Prediction[]) {
  const maximum = predictions[0]?.probability ?? 1;
  return predictions.map((prediction) => (
    <div key={prediction.id}>
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="font-mono text-white">{visibleGpt2Token(prediction.token)}</span>
        <span className="font-mono text-slate-400">{(prediction.probability * 100).toFixed(2)}%</span>
      </div>
      <div className="mt-2 h-1.5 bg-white/10"><div className="h-full bg-sky-400" style={{ width: `${prediction.probability / maximum * 100}%` }} /></div>
    </div>
  ));
}

export function Gpt2LiveResidualStream() {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [layer, setLayer] = useState(0);
  const [stage, setStage] = useState<Stage>('attention');
  const [trace, setTrace] = useState<Gpt2TraceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const inspect = useCallback(async (nextLayer = layer, selectedTokenIndex?: number) => {
    setLoading(true);
    setError(null);
    setLayer(nextLayer);
    try {
      setTrace(await gpt2.getTrace({ prompt, layer: nextLayer, head: 0, selectedTokenIndex }));
    } catch (requestError) {
      setError(gpt2TraceError(requestError));
    } finally {
      setLoading(false);
    }
  }, [layer, prompt]);

  useEffect(() => { void inspect(0); }, []); // Live mode is opened explicitly; capture the first block once.

  const selectedToken = trace?.tokens[trace.selectedTokenIndex];
  const stateValues = trace ? { pre: trace.residualPre, attention: trace.residualMid, mlp: trace.residualPost }[stage] : [];
  const addition = trace && stage !== 'pre' ? stage === 'attention'
    ? { before: trace.residualPre, update: trace.attentionOutput, after: trace.residualMid, updateLabel: 'Attention update' }
    : { before: trace.residualMid, update: trace.mlpOutput, after: trace.residualPost, updateLabel: 'MLP update' }
    : null;
  const lens = trace?.logitLens[stage] ?? [];
  const identityError = trace ? Math.max(trace.checks.residualMidMaxError, trace.checks.residualPostMaxError) : 0;
  const stageCopy = STAGES.find((candidate) => candidate.id === stage) ?? STAGES[0];

  return (
    <section className="overflow-hidden rounded-[2rem] bg-slate-950 text-white" data-testid="gpt2-live-residual">
      <div className="grid gap-5 border-b border-white/10 p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end md:p-7">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Prompt · up to 32 GPT-2 tokens</span>
          <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={2} className="mt-3 w-full resize-none rounded-2xl border border-white/15 bg-white/[0.05] px-4 py-3 text-sm leading-6 text-white outline-none transition focus:border-sky-400" />
        </label>
        <button type="button" onClick={() => void inspect()} disabled={loading || !prompt.trim()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-sky-400 px-5 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-wait disabled:opacity-60">
          {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {loading ? 'Capturing…' : 'Capture this layer'}
        </button>
      </div>

      {error ? <div className="border-b border-red-400/20 bg-red-400/10 p-5 text-sm text-red-100 md:px-7" role="alert">{error}</div> : null}

      {trace ? <>
        <div className="border-b border-white/10 p-5 md:p-7">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Selected token position</p><h2 className="mt-2 font-mono text-2xl font-semibold">{selectedToken ? visibleGpt2Token(selectedToken.text) : '—'}</h2></div>
            <p className="text-xs leading-5 text-slate-500">Choose a token, then inspect how its 768-dimensional state changes.</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {trace.tokens.map((token) => <button key={token.index} type="button" onClick={() => void inspect(trace.layer, token.index)} aria-pressed={token.index === trace.selectedTokenIndex} className={`min-h-10 rounded-xl border px-3 font-mono text-xs transition ${token.index === trace.selectedTokenIndex ? 'border-sky-300 bg-sky-400 text-slate-950' : 'border-white/10 text-slate-400 hover:border-sky-400 hover:text-white'}`}>{visibleGpt2Token(token.text)}</button>)}
          </div>
        </div>

        <div className="grid border-b border-white/10 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="p-5 lg:border-r lg:border-white/10 md:p-7">
            <label className="text-sm font-semibold text-slate-200">Transformer block <span className="ml-2 font-mono text-sky-300">{layer + 1} / {trace.layerCount}</span><input type="range" min="0" max={trace.layerCount - 1} value={layer} onChange={(event) => setLayer(Number(event.target.value))} className="mt-3 block w-full accent-sky-400" data-testid="gpt2-residual-layer" /></label>
            <div className="mt-3 grid grid-cols-6 gap-1 sm:grid-cols-12">
              {Array.from({ length: trace.layerCount }, (_, index) => <button key={index} type="button" onClick={() => void inspect(index)} aria-pressed={trace.layer === index} className={`min-h-9 rounded-lg text-xs font-semibold transition ${trace.layer === index ? 'bg-sky-400 text-slate-950' : 'bg-white/5 text-slate-500 hover:text-white'}`} data-testid={`gpt2-residual-block-${index}`}>{index + 1}</button>)}
            </div>
          </div>
          <div className="p-5 md:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Exact addition check</p>
            <p className="mt-3 font-mono text-xl text-white">max error {identityError.toExponential(1)}</p>
            <p className="mt-2 text-xs leading-5 text-slate-500">The captured block output equals the incoming stream plus the attention and MLP updates, up to floating-point error.</p>
          </div>
        </div>

        <div className="border-b border-white/10 p-5 md:p-7">
          <div className="flex flex-wrap gap-1" role="tablist" aria-label="Residual addition stage">
            {STAGES.map((candidate) => <button key={candidate.id} type="button" role="tab" aria-selected={stage === candidate.id} onClick={() => setStage(candidate.id)} className={`min-h-11 rounded-full px-4 text-sm font-semibold transition ${stage === candidate.id ? 'bg-white text-slate-950' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`} data-testid={`gpt2-residual-stage-${candidate.id}`}>{candidate.label}</button>)}
          </div>
          <div className="mt-7 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Captured residual snapshot</p><h3 className="mt-2 text-xl font-semibold">{stageCopy.detail}</h3></div><p className="font-mono text-xs text-slate-500">24 sampled coordinates / {trace.hiddenSize}</p></div>
          <div className="mt-5 grid grid-cols-6 gap-2 sm:grid-cols-8 xl:grid-cols-12" data-testid="gpt2-residual-heatmap">
            {stateValues.map((value, index) => {
              const intensity = Math.min(1, 0.16 + Math.abs(value) / Math.max(...stateValues.map(Math.abs), 0.0001));
              return <span key={trace.sampledDimensions[index]} title={`dimension ${trace.sampledDimensions[index]}: ${value.toFixed(5)}`} className="flex aspect-square flex-col items-center justify-center rounded-md border border-white/5 font-mono" style={{ backgroundColor: value >= 0 ? `rgba(56, 189, 248, ${intensity})` : `rgba(251, 191, 36, ${intensity})` }}><small className="text-[0.48rem] text-slate-950/55">d{trace.sampledDimensions[index]}</small><strong className="text-[0.55rem] text-slate-950">{value.toFixed(1)}</strong></span>;
            })}
          </div>
        </div>

        {addition ? <div className="border-b border-white/10 p-5 md:p-7" data-testid="gpt2-residual-equation">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-300"><Plus className="h-4 w-4" /> The update returns to the same stream</p>
          <div className="mt-6 grid items-center gap-5 lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
            <Gpt2VectorStrip label="State before" values={addition.before} /><span className="text-center text-2xl text-slate-600">+</span><Gpt2VectorStrip label={addition.updateLabel} values={addition.update} /><span className="text-center text-2xl text-slate-600">=</span><Gpt2VectorStrip label="State after" values={addition.after} />
          </div>
        </div> : null}

        <div className="grid lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="p-5 lg:border-r lg:border-white/10 md:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Logit lens at this exact state</p>
            <div className="mt-5 space-y-4" data-testid="gpt2-residual-candidates">{predictionList(lens)}</div>
          </div>
          <div className="p-5 md:p-7">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300"><Check className="h-4 w-4" /> Interpret carefully</p>
            <p className="mt-4 text-sm leading-6 text-slate-400">These candidates come from applying GPT-2’s final layer norm and vocabulary head to an intermediate captured state. That is a real calculation and a useful probe—not a claim that this block independently chose a word.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-emerald-400/20 bg-emerald-400/[0.07] px-5 py-4 text-sm md:px-7" data-testid="gpt2-residual-provenance"><span className="flex items-center gap-2 font-semibold text-emerald-200"><Cpu className="h-4 w-4" /> Captured from a real local GPT-2 forward pass</span><span className="font-mono text-xs text-emerald-100/60">{trace.modelLabel} · {trace.modelRevision} · block {trace.layer + 1}</span></div>
      </> : null}
    </section>
  );
}
