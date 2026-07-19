import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Cpu, LoaderCircle, Search, Sparkles } from 'lucide-react';
import { gpt2 } from '../../../lib/api';
import type { Gpt2EmbeddingForestResponse, Gpt2EmbeddingSpaceResponse } from '../../../types/gpt2';
import { gpt2TraceError, visibleGpt2Token } from '../gpt2TraceUi';
import { FocusedEmbeddingPlot } from './FocusedEmbeddingPlot';
import { Gpt2EmbeddingForest } from './Gpt2EmbeddingForest';

export function Gpt2EmbeddingExplorer() {
  const [query, setQuery] = useState('dog');
  const [space, setSpace] = useState<Gpt2EmbeddingSpaceResponse | null>(null);
  const [forest, setForest] = useState<Gpt2EmbeddingForestResponse | null>(null);
  const [showForest, setShowForest] = useState(false);
  const [forestLoading, setForestLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const inspect = useCallback(async (request: { query?: string; tokenId?: number }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await gpt2.getEmbeddingSpace({ ...request, neighborCount: 14 });
      setSpace(response);
      setQuery(response.points[0]?.text.trim() || response.points[0]?.vocabularyForm || query);
    } catch (requestError) {
      setError(gpt2TraceError(requestError));
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => { void inspect({ query: 'dog' }); }, []); // The learner explicitly selected the full-local source.

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (query.trim()) void inspect({ query: query.trim() });
  };
  const selected = space?.points.find(({ id }) => id === space.selectedTokenId);
  const neighbors = space?.points.filter(({ id }) => id !== space.selectedTokenId) ?? [];

  const toggleForest = async () => {
    if (showForest) {
      setShowForest(false);
      return;
    }
    if (forest) {
      setShowForest(true);
      return;
    }
    setForestLoading(true);
    setError(null);
    try {
      const response = await gpt2.getEmbeddingForest();
      setForest(response);
      setShowForest(true);
    } catch (requestError) {
      setError(gpt2TraceError(requestError));
    } finally {
      setForestLoading(false);
    }
  };

  return (
    <div data-testid="gpt2-embedding-explorer">
      <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-5 lg:flex-row lg:items-center lg:justify-between md:px-7">
        <div><p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300"><Cpu className="h-4 w-4" /> Complete local embedding table</p><p className="mt-2 text-sm text-slate-400">Search every GPT-2 token; open the full projection when you want the dot forest.</p>{space ? <button type="button" onClick={() => void toggleForest()} disabled={forestLoading} aria-pressed={showForest} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full border border-sky-400/30 px-4 text-xs font-semibold text-sky-200 transition hover:border-sky-300 disabled:opacity-50" data-testid="toggle-embedding-forest"><Sparkles className="h-4 w-4" />{forestLoading ? 'Projecting all vectors…' : showForest ? 'Show focused 15' : `Show all ${space.vocabularySize.toLocaleString()}`}</button> : null}</div>
        <form onSubmit={submit} className="flex w-full max-w-md border border-white/15 bg-white/5 focus-within:border-sky-400">
          <Search className="ml-3 mt-3.5 h-4 w-4 text-slate-500" />
          <label htmlFor="gpt2-embedding-search" className="sr-only">Find a GPT-2 token</label>
          <input id="gpt2-embedding-search" value={query} onChange={(event) => setQuery(event.target.value)} className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none" data-testid="gpt2-embedding-search" />
          <button type="submit" disabled={loading || !query.trim()} className="min-w-20 border-l border-white/10 px-4 text-xs font-semibold text-sky-200 disabled:opacity-50">{loading ? <LoaderCircle className="mx-auto h-4 w-4 animate-spin" /> : 'Find'}</button>
        </form>
      </div>

      {error ? <p className="border-b border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-100 md:px-7" role="alert">{error}</p> : null}

      {space ? <div className="grid xl:grid-cols-[minmax(0,1fr)_17rem]">
        {showForest && forest ? <Gpt2EmbeddingForest
          points={forest.points}
          selectedId={space.selectedTokenId}
          neighborhoodIds={space.points.map(({ id }) => id)}
          onSelect={(id) => void inspect({ tokenId: id })}
        /> : <FocusedEmbeddingPlot
          points={space.points.map((point) => ({ id: point.id, label: visibleGpt2Token(point.text), x: point.x, y: point.y, z: point.z, testId: `gpt2-embedding-point-${point.id}` }))}
          selectedId={space.selectedTokenId}
          onSelect={(id) => void inspect({ tokenId: Number(id) })}
          ariaLabel={`Focused three-dimensional PCA neighborhood from the complete ${space.vocabularySize}-token GPT-2 embedding table`}
        />}
        <aside className="border-t border-white/10 p-5 xl:border-l xl:border-t-0 md:p-7" aria-label="Nearest GPT-2 token embeddings">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">Selected token</p>
          <h4 className="mt-3 font-mono text-3xl font-semibold text-white">{selected ? visibleGpt2Token(selected.text) : '—'}</h4>
          <p className="mt-2 font-mono text-xs text-slate-500">ID {space.selectedTokenId}</p>
          <ol className="mt-6 divide-y divide-white/10 border-y border-white/10">
            {neighbors.slice(0, 7).map((point, index) => <li key={point.id}><button type="button" onClick={() => void inspect({ tokenId: point.id })} className="grid w-full grid-cols-[1.3rem_1fr_auto] gap-2 py-3 text-left text-sm text-slate-300 hover:text-white"><span className="font-mono text-xs text-slate-600">{index + 1}</span><span className="truncate font-mono">{visibleGpt2Token(point.text)}</span><span className="font-mono text-xs text-sky-300">{point.similarity.toFixed(3)}</span></button></li>)}
          </ol>
        </aside>
      </div> : null}

      {space ? <footer className="flex flex-col gap-1 border-t border-white/10 px-5 py-4 text-xs leading-5 text-slate-500 md:flex-row md:justify-between md:px-7"><span>{space.vocabularySize.toLocaleString()} rows · {space.hiddenSize} dimensions · real GPT-2 input embeddings</span><span>{showForest ? 'Global PCA projects the complete table; the cyan dots mark the focused neighborhood.' : 'Local PCA is recomputed for the selected token and its 14 nearest neighbors.'}</span></footer> : null}
    </div>
  );
}
