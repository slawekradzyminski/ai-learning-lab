import { useMemo, useState, type FormEvent } from 'react';
import { Axis3d, LoaderCircle, Radio, Sparkles } from 'lucide-react';
import { LabPageHeader } from './LabPageHeader';
import { EmbeddingSpace3DLauncher } from './EmbeddingSpace3DLauncher';
import {
  cosineSimilarityMatrix,
  GUIDED_EMBEDDING_INPUTS,
  GUIDED_EMBEDDING_VECTORS,
  projectEmbeddings2d,
} from './embeddingMath';
import { useLiveEmbeddings } from './useLearningModel';
import { LIVE_AI_RUNTIME_ENABLED } from '../../lib/runtimeCapabilities';

type EmbeddingMode = 'guided' | 'live';

const DEFAULT_LIVE_INPUTS = GUIDED_EMBEDDING_INPUTS.slice(0, 3).join('\n');

function shortLabel(text: string) {
  return text.length > 28 ? `${text.slice(0, 27)}…` : text;
}

export function EmbeddingsLabPage({ liveRuntimeEnabled = LIVE_AI_RUNTIME_ENABLED }: { liveRuntimeEnabled?: boolean } = {}) {
  const [mode, setMode] = useState<EmbeddingMode>('guided');
  const [model, setModel] = useState('embeddinggemma');
  const [inputText, setInputText] = useState(DEFAULT_LIVE_INPUTS);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);
  const live = useLiveEmbeddings();
  const requestedInputs = useMemo(() => inputText.split('\n').map((line) => line.trim()).filter(Boolean).slice(0, 8), [inputText]);
  const inputs = mode === 'guided' ? GUIDED_EMBEDDING_INPUTS : (live.result ? requestedInputs : []);
  const vectors = useMemo(
    () => mode === 'guided' ? GUIDED_EMBEDDING_VECTORS : (live.result?.vectors ?? []),
    [live.result, mode],
  );
  const similarity = useMemo(() => vectors.length > 1 ? cosineSimilarityMatrix(vectors) : [], [vectors]);
  const points = useMemo(() => vectors.length > 1 ? projectEmbeddings2d(vectors) : [], [vectors]);
  const selectedVector = vectors[selectedIndex] ?? vectors[0] ?? [];
  const selectedScale = Math.max(...selectedVector.slice(0, 32).map(Math.abs), 0.0001);

  const runLive = async (event: FormEvent) => {
    event.preventDefault();
    setLocalError(null);
    if (requestedInputs.length < 2) {
      setLocalError('Enter at least two non-empty lines to compare.');
      return;
    }
    if (requestedInputs.some((input) => input.length > 500)) {
      setLocalError('Each input must be at most 500 characters.');
      return;
    }
    setSelectedIndex(0);
    await live.run({ model, inputs: requestedInputs });
  };

  const resetLive = () => {
    live.reset();
    setLocalError(null);
  };

  return (
    <div data-testid="embeddings-lab-page">
      <LabPageHeader
        eyebrow="Semantic systems · step 1"
        title="Map semantic similarity"
        description="Compare transparent teaching vectors with live semantic embeddings for search and retrieval—separate from the token representations inside Bonsai."
        aside="Sentence → retrieval vector"
      />

      <div className="mb-5 rounded-[1.5rem] border border-sky-200 bg-sky-50/75 p-4 text-sm leading-6 text-sky-950" role="note" data-testid="embeddings-track-note">
        These sentence-level vectors are produced by EmbeddingGemma for similarity and retrieval. Bonsai creates and updates different token-level representations internally during generation; this lab is not an intermediate Bonsai pipeline stage.
      </div>

      <div className="mb-5 inline-flex rounded-full border border-stone-200 bg-white p-1" role="group" aria-label="Embedding source">
        <button type="button" onClick={() => { setMode('guided'); setSelectedIndex(0); }} aria-pressed={mode === 'guided'} className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold transition ${mode === 'guided' ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-stone-100'}`} data-testid="embeddings-mode-guided">
          <Sparkles className="h-4 w-4" /> Guided example
        </button>
        {liveRuntimeEnabled ? <button type="button" onClick={() => { setMode('live'); setSelectedIndex(0); }} aria-pressed={mode === 'live'} className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold transition ${mode === 'live' ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-stone-100'}`} data-testid="embeddings-mode-live">
          <Radio className="h-4 w-4" /> Live local model
        </button> : null}
      </div>

      {mode === 'live' ? (
        <form onSubmit={runLive} className="mb-6 grid gap-5 rounded-[2rem] border border-sky-200 bg-sky-50/70 p-5 lg:grid-cols-[minmax(0,0.35fr)_minmax(0,0.65fr)] md:p-7" data-testid="embeddings-live-form">
          <div>
            <label htmlFor="embeddings-model" className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Embedding model</label>
            <input id="embeddings-model" value={model} onChange={(event) => { setModel(event.target.value); resetLive(); }} className="mt-2 h-11 w-full rounded-xl border border-sky-200 bg-white px-3 font-mono text-sm text-slate-950" data-testid="embeddings-model" />
            <p className="mt-3 text-xs leading-5 text-slate-500">Bonsai generates text. A dedicated embedding model produces stable semantic vectors for search and RAG.</p>
          </div>
          <div>
            <label htmlFor="embeddings-inputs" className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">One text per line · 2–8 lines</label>
            <textarea id="embeddings-inputs" value={inputText} onChange={(event) => { setInputText(event.target.value); resetLive(); }} rows={5} className="mt-2 w-full resize-y rounded-xl border border-sky-200 bg-white px-3 py-3 text-sm leading-6 text-slate-950" data-testid="embeddings-inputs" />
            <button type="submit" disabled={live.loading} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-sky-600 px-5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-60" data-testid="embeddings-run">
              {live.loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Axis3d className="h-4 w-4" />}
              {live.loading ? 'Creating vectors…' : 'Embed and compare'}
            </button>
          </div>
        </form>
      ) : null}

      {(localError || live.error) && mode === 'live' ? (
        <div className="mb-6 rounded-[1.5rem] border border-red-200 bg-red-50 p-4 text-sm text-red-950" role="alert" data-testid="embeddings-error">{localError || live.error}</div>
      ) : null}

      {mode === 'live' && !live.result ? (
        <section className="rounded-[2rem] border border-dashed border-stone-300 bg-white/65 px-6 py-14 text-center" data-testid="embeddings-empty">
          <Axis3d className="mx-auto h-8 w-8 text-slate-400" />
          <h2 className="mt-4 text-xl font-semibold text-slate-950">No live vector space yet</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">Run the texts above. A failed request remains visible here and never substitutes the guided fixture.</p>
        </section>
      ) : (
        <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white/85" data-testid="embeddings-workspace">
          <div className="flex flex-col gap-3 border-b border-stone-200 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-7">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">{mode === 'guided' ? `${vectors[0]?.length ?? 0}-dimensional teaching fixture` : 'Live Ollama embeddings'}</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">Start with a simple map</h2>
            </div>
            <div className="text-left text-xs leading-5 text-slate-500 md:text-right" data-testid="embeddings-metadata">
              <p>{mode === 'guided' ? `Inspectable ${vectors[0]?.length ?? 0}D vectors` : live.result?.modelLabel}</p>
              <p>{vectors[0]?.length ?? 0} dimensions{live.result ? ` · ${live.result.promptTokenCount} prompt tokens` : ''}</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.72fr)]">
            <div className="p-5 md:p-7">
              <div className="relative h-[22rem] overflow-hidden rounded-[1.5rem] bg-slate-950" data-testid="embedding-map">
                <div className="absolute inset-x-8 top-1/2 h-px bg-white/10" />
                <div className="absolute inset-y-8 left-1/2 w-px bg-white/10" />
                <svg viewBox="0 0 600 360" className="absolute inset-0 h-full w-full" role="img" aria-label="Two-dimensional embedding projection">
                  {points.map((point, index) => {
                    const x = 300 + point.x * 220;
                    const y = 180 + point.y * 125;
                    const selected = selectedIndex === index;
                    return (
                      <g key={inputs[index]} role="button" tabIndex={0} onClick={() => setSelectedIndex(index)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setSelectedIndex(index); }} className="cursor-pointer" data-testid={`embedding-point-${index}`}>
                        <circle cx={x} cy={y} r={selected ? 14 : 10} fill={selected ? '#38bdf8' : '#64748b'} stroke="#f8fafc" strokeOpacity={selected ? 0.9 : 0.35} strokeWidth="2" />
                        <text x={x + 17} y={y + 5} fill={selected ? '#e0f2fe' : '#cbd5e1'} fontSize="12">{index + 1}</text>
                      </g>
                    );
                  })}
                </svg>
                <div className="absolute bottom-4 left-5 text-[0.65rem] uppercase tracking-[0.18em] text-slate-500">2D projection · relative position only</div>
              </div>

              <div className="mt-5 space-y-2">
                {inputs.map((input, index) => (
                  <button key={`${input}-${index}`} type="button" onClick={() => setSelectedIndex(index)} className={`grid w-full grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 rounded-xl px-3 py-3 text-left transition ${selectedIndex === index ? 'bg-sky-50 text-sky-950' : 'hover:bg-stone-50 text-slate-700'}`} data-testid={`embedding-input-${index}`}>
                    <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${selectedIndex === index ? 'bg-sky-500 text-slate-950' : 'bg-slate-200 text-slate-600'}`}>{index + 1}</span>
                    <span className="truncate text-sm font-medium">{input}</span>
                    <span className="text-xs text-slate-400">select</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-stone-200 p-5 lg:border-l lg:border-t-0 md:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Selected vector</p>
              <p className="mt-2 text-sm font-semibold text-slate-950">{shortLabel(inputs[selectedIndex] ?? '')}</p>
              <div className="mt-5 flex h-28 items-center gap-1 border-y border-stone-200 py-3" data-testid="embedding-vector-bars">
                {selectedVector.slice(0, 32).map((value, index) => (
                  <div key={index} className="relative h-full min-w-1 flex-1 bg-stone-100" title={`d${index + 1}: ${value.toFixed(4)}`}>
                    <span className={`absolute left-0 right-0 ${value >= 0 ? 'bottom-1/2 bg-sky-500' : 'top-1/2 bg-slate-500'}`} style={{ height: `${Math.max(3, Math.abs(value) / selectedScale * 50)}%` }} />
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-500">Showing {Math.min(32, selectedVector.length)} of {selectedVector.length} dimensions.</p>

              <div className="mt-7">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Cosine similarity</p>
                <div className="mt-3 grid gap-1" style={{ gridTemplateColumns: `2rem repeat(${inputs.length}, minmax(0, 1fr))` }} data-testid="embedding-similarity-matrix">
                  <span />
                  {inputs.map((_, index) => <span key={`head-${index}`} className="py-1 text-center text-xs font-semibold text-slate-400">{index + 1}</span>)}
                  {similarity.flatMap((row, rowIndex) => [
                    <span key={`row-${rowIndex}`} className="flex items-center justify-center text-xs font-semibold text-slate-400">{rowIndex + 1}</span>,
                    ...row.map((value, columnIndex) => (
                      <button key={`${rowIndex}-${columnIndex}`} type="button" onClick={() => setSelectedIndex(rowIndex)} className="aspect-square rounded-md text-[0.65rem] font-semibold tabular-nums text-slate-950" style={{ backgroundColor: `rgba(14, 165, 233, ${0.08 + Math.max(0, value) * 0.62})` }} aria-label={`Similarity ${rowIndex + 1} to ${columnIndex + 1}: ${value.toFixed(2)}`}>
                        {value.toFixed(2)}
                      </button>
                    )),
                  ])}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-stone-200 p-5 md:p-7">
            <EmbeddingSpace3DLauncher inputs={inputs} vectors={vectors} selectedIndex={selectedIndex} onSelect={setSelectedIndex} />
          </div>

          <div className="border-t border-stone-200 bg-stone-50/70 p-5 text-sm leading-6 text-slate-600 md:px-7">
            <strong className="font-semibold text-slate-950">What to notice:</strong> related texts form neighborhoods, but every screen view discards dimensions. Use the map to form a hypothesis; use cosine scores and task-specific retrieval tests to evaluate it.
          </div>
        </section>
      )}
    </div>
  );
}
