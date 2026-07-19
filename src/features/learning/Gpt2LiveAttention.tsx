import { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, Check, Cpu, LoaderCircle, RefreshCw } from 'lucide-react';
import { gpt2 } from '../../lib/api';
import type { Gpt2TraceResponse } from '../../types/gpt2';
import { Gpt2VectorStrip } from './Gpt2VectorStrip';
import { gpt2TraceError, visibleGpt2Token } from './gpt2TraceUi';

const DEFAULT_PROMPT = 'The animal did not cross the street because it was too';

export function Gpt2LiveAttention() {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [layer, setLayer] = useState(0);
  const [head, setHead] = useState(0);
  const [trace, setTrace] = useState<Gpt2TraceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const inspect = useCallback(async (selectedTokenIndex?: number) => {
    setLoading(true);
    setError(null);
    try {
      setTrace(await gpt2.getTrace({ prompt, layer, head, selectedTokenIndex }));
    } catch (requestError) {
      setError(gpt2TraceError(requestError));
    } finally {
      setLoading(false);
    }
  }, [head, layer, prompt]);

  useEffect(() => { void inspect(); }, []); // Load once when the learner explicitly opens live mode.

  const selectedToken = trace?.tokens[trace.selectedTokenIndex];
  const strongestIndex = useMemo(() => {
    if (!trace) return -1;
    return trace.attentionRow.reduce((best, value, index, row) => value > row[best] ? index : best, 0);
  }, [trace]);
  const maximumPrediction = trace?.predictions[0]?.probability ?? 1;

  return (
    <section className="overflow-hidden rounded-[2rem] bg-slate-950 text-white" data-testid="gpt2-live-attention">
      <div className="grid gap-5 border-b border-white/10 p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end md:p-7">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Prompt · up to 32 GPT-2 tokens</span>
          <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={2} className="mt-3 w-full resize-none rounded-2xl border border-white/15 bg-white/[0.05] px-4 py-3 text-sm leading-6 text-white outline-none transition focus:border-sky-400" />
        </label>
        <button type="button" onClick={() => void inspect()} disabled={loading || !prompt.trim()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-sky-400 px-5 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-wait disabled:opacity-60">
          {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {loading ? 'Capturing…' : 'Capture trace'}
        </button>
      </div>

      <div className="grid gap-5 border-b border-white/10 p-5 md:grid-cols-2 md:p-7">
        <label className="text-sm font-semibold text-slate-200">Layer <span className="ml-2 font-mono text-sky-300">{layer + 1} / 12</span><input type="range" min="0" max="11" value={layer} onChange={(event) => setLayer(Number(event.target.value))} className="mt-3 block w-full accent-sky-400" /></label>
        <label className="text-sm font-semibold text-slate-200">Attention head <span className="ml-2 font-mono text-sky-300">{head + 1} / 12</span><input type="range" min="0" max="11" value={head} onChange={(event) => setHead(Number(event.target.value))} className="mt-3 block w-full accent-sky-400" /></label>
      </div>

      {error ? <div className="border-b border-red-400/20 bg-red-400/10 p-5 text-sm text-red-100 md:px-7" role="alert">{error}</div> : null}

      {trace ? <>
        <div className="grid lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
          <div className="border-b border-white/10 p-5 lg:border-b-0 lg:border-r md:p-7">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Captured attention pattern</p><h2 className="mt-2 text-xl font-semibold">Where each token reads from</h2></div>
              <p className="text-xs text-slate-500">rows read · columns provide context</p>
            </div>
            <div className="mt-6 overflow-x-auto pb-2">
              <div className="grid min-w-max gap-1.5" style={{ gridTemplateColumns: `5.5rem repeat(${trace.tokens.length}, 4.4rem)` }}>
                <span />
                {trace.tokens.map((token) => <span key={`column-${token.index}`} title={token.text} className="truncate px-1 text-center font-mono text-[0.65rem] text-slate-400">{visibleGpt2Token(token.text)}</span>)}
                {trace.attentionMatrix.flatMap((row, rowIndex) => [
                  <button key={`row-${rowIndex}`} type="button" onClick={() => void inspect(rowIndex)} className={`truncate rounded-lg px-2 text-left font-mono text-xs font-semibold ${rowIndex === trace.selectedTokenIndex ? 'bg-sky-400 text-slate-950' : 'text-slate-400 hover:text-white'}`}>{visibleGpt2Token(trace.tokens[rowIndex].text)}</button>,
                  ...row.map((weight, columnIndex) => {
                    const future = columnIndex > rowIndex;
                    return <button key={`${rowIndex}-${columnIndex}`} type="button" onClick={() => void inspect(rowIndex)} aria-label={`${trace.tokens[rowIndex].text} attends to ${trace.tokens[columnIndex].text}: ${(weight * 100).toFixed(2)} percent`} className={`aspect-square rounded-lg border font-mono text-[0.62rem] transition ${rowIndex === trace.selectedTokenIndex ? 'border-sky-300/60' : 'border-white/5'} ${future ? 'text-slate-700' : 'text-white'}`} style={future ? undefined : { backgroundColor: `rgba(14, 165, 233, ${0.06 + weight * 0.94})` }}>{future ? '—' : `${(weight * 100).toFixed(0)}`}</button>;
                  }),
                ])}
              </div>
            </div>
          </div>

          <aside className="p-5 md:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Selected read</p>
            <h2 className="mt-2 font-mono text-2xl font-semibold">{selectedToken ? visibleGpt2Token(selectedToken.text) : '—'}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">This token gives its largest attention weight to <strong className="text-white">{strongestIndex >= 0 ? visibleGpt2Token(trace.tokens[strongestIndex].text) : '—'}</strong> in this head.</p>
            <div className="mt-6 space-y-3">
              {trace.attentionRow.map((weight, index) => <div key={`weight-${index}`} className="grid grid-cols-[5rem_1fr_3rem] items-center gap-2 text-xs"><span className="truncate font-mono text-slate-400">{visibleGpt2Token(trace.tokens[index].text)}</span><span className="h-1.5 bg-white/10"><span className="block h-full bg-sky-400" style={{ width: `${weight * 100}%` }} /></span><span className="text-right font-mono text-slate-400">{(weight * 100).toFixed(1)}%</span></div>)}
            </div>
          </aside>
        </div>

        <div className="grid border-t border-white/10 lg:grid-cols-2">
          <div className="p-5 lg:border-r lg:border-white/10 md:p-7">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-300"><Activity className="h-4 w-4" /> What GPT-2 predicts here</p>
            <div className="mt-5 space-y-4">
              {trace.predictions.map((prediction) => <div key={prediction.id}><div className="flex justify-between gap-4 text-sm"><span className="font-mono text-white">{visibleGpt2Token(prediction.token)}</span><span className="font-mono text-slate-400">{(prediction.probability * 100).toFixed(2)}%</span></div><div className="mt-2 h-1.5 bg-white/10"><div className="h-full bg-sky-400" style={{ width: `${prediction.probability / maximumPrediction * 100}%` }} /></div></div>)}
            </div>
          </div>
          <div className="p-5 md:p-7">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300"><Check className="h-4 w-4" /> Trace integrity</p>
            <dl className="mt-5 grid grid-cols-2 gap-4 text-sm"><div><dt className="text-slate-500">Row sum</dt><dd className="mt-1 font-mono text-white">{trace.checks.attentionRowSum.toFixed(6)}</dd></div><div><dt className="text-slate-500">Future mass</dt><dd className="mt-1 font-mono text-white">{trace.checks.futureAttentionMass.toExponential(1)}</dd></div><div><dt className="text-slate-500">QK reconstruction error</dt><dd className="mt-1 font-mono text-white">{trace.checks.attentionReconstructionMaxError.toExponential(1)}</dd></div><div><dt className="text-slate-500">Residual identity error</dt><dd className="mt-1 font-mono text-white">{Math.max(trace.checks.residualMidMaxError, trace.checks.residualPostMaxError).toExponential(1)}</dd></div></dl>
          </div>
        </div>

        <details className="border-t border-white/10 p-5 md:p-7">
          <summary className="cursor-pointer text-sm font-semibold text-slate-300">Inspect sampled activation vectors</summary>
          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4"><Gpt2VectorStrip label="Token embedding" values={trace.tokenEmbedding} /><Gpt2VectorStrip label="Position embedding" values={trace.positionEmbedding} /><Gpt2VectorStrip label="After attention" values={trace.residualMid} /><Gpt2VectorStrip label="After MLP" values={trace.residualPost} /></div>
          <p className="mt-4 text-xs leading-5 text-slate-500">These are 24 evenly sampled coordinates from the real 768-dimensional residual stream. Blue is positive, amber is negative; coordinates do not have fixed human-readable meanings.</p>
        </details>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-emerald-400/20 bg-emerald-400/[0.07] px-5 py-4 text-sm md:px-7" data-testid="gpt2-live-provenance"><span className="flex items-center gap-2 font-semibold text-emerald-200"><Cpu className="h-4 w-4" /> Captured from a real local model</span><span className="font-mono text-xs text-emerald-100/60">{trace.modelLabel} · {trace.modelRevision} · layer {trace.layer + 1} · head {trace.head + 1}</span></div>
      </> : null}
    </section>
  );
}
