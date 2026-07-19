import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Search } from 'lucide-react';
import { gpt2 } from '../../../lib/api';
import type { Gpt2InspectorStatus } from '../../../types/gpt2';
import { Gpt2EmbeddingExplorer } from './Gpt2EmbeddingExplorer';
import { WordEmbeddingCanvas } from './WordEmbeddingCanvas';
import { GLOVE_MODEL, GLOVE_WORDS } from './gloveWordEmbeddings';
import { findOddOneOut, nearestWords, rankSemanticAxis, solveAnalogy } from './wordEmbeddingMath';
import { AnalogyPanel, ExploreWordPanel, OddOneOutPanel, SemanticAxisPanel } from './WordEmbeddingExperiments';

type ExperimentMode = 'explore' | 'analogy' | 'odd' | 'axis';

const modes: Array<{ id: ExperimentMode; label: string }> = [
  { id: 'explore', label: 'Explore' },
  { id: 'analogy', label: 'Analogy' },
  { id: 'odd', label: 'Odd one out' },
  { id: 'axis', label: 'Semantic axis' },
];

function indexFor(word: string) {
  return GLOVE_WORDS.findIndex((row) => row.word === word);
}

export function WordEmbeddingExplorer() {
  const [source, setSource] = useState<'glove' | 'gpt2'>('glove');
  const [gpt2Status, setGpt2Status] = useState<Gpt2InspectorStatus | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(indexFor('dog'));
  const [mode, setMode] = useState<ExperimentMode>('explore');
  const [query, setQuery] = useState('dog');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [analogyWords, setAnalogyWords] = useState<[string, string, string]>(['man', 'king', 'woman']);
  const [oddWords, setOddWords] = useState(['breakfast', 'lunch', 'dinner', 'cereal']);
  const [axisWords, setAxisWords] = useState<[string, string]>(['man', 'woman']);

  const selected = GLOVE_WORDS[selectedIndex];
  const nearest = useMemo(() => nearestWords(GLOVE_WORDS, selected.vector, [selected.word], 10), [selected]);
  const analogy = useMemo(() => solveAnalogy(GLOVE_WORDS, ...analogyWords), [analogyWords]);
  const odd = useMemo(() => findOddOneOut(GLOVE_WORDS, oddWords), [oddWords]);
  const axis = useMemo(() => rankSemanticAxis(GLOVE_WORDS, ...axisWords), [axisWords]);
  const analogyIndices = [...analogyWords.map(indexForWord => indexFor(indexForWord)), ...analogy.matches.slice(0, 1).map(({ index }) => index)];
  const axisIndices = [...axisWords.map(indexForWord => indexFor(indexForWord)), ...axis.low.slice(0, 3).map(({ index }) => index), ...axis.high.slice(0, 3).map(({ index }) => index)];
  const highlightedIndices = mode === 'analogy'
    ? analogyIndices
    : mode === 'odd'
      ? oddWords.map(indexFor)
      : mode === 'axis'
        ? axisIndices
        : [];
  const connectionPairs: Array<[number, number]> = mode === 'analogy' && analogy.matches[0]
    ? [[indexFor(analogyWords[0]), indexFor(analogyWords[1])], [indexFor(analogyWords[2]), analogy.matches[0].index]]
    : mode === 'axis'
      ? [[indexFor(axisWords[0]), indexFor(axisWords[1])]]
      : [];
  const visibleIndices = mode === 'explore'
    ? [selectedIndex, ...nearest.slice(0, 12).map(({ index }) => index)]
    : mode === 'analogy'
      ? [...analogyIndices, ...analogy.matches.slice(0, 8).map(({ index }) => index)]
      : mode === 'odd'
        ? oddWords.map(indexFor)
        : axisIndices;
  const focusedIndex = mode === 'explore'
    ? selectedIndex
    : mode === 'analogy'
      ? analogy.matches[0]?.index ?? analogyIndices[0]
      : mode === 'odd'
        ? indexFor([...odd.scores].sort((left, right) => left.score - right.score)[0]?.word ?? oddWords[0])
        : indexFor(axisWords[1]);

  useEffect(() => {
    let active = true;
    void gpt2.getStatus().then((status) => { if (active) setGpt2Status(status); }).catch(() => { if (active) setGpt2Status(null); });
    return () => { active = false; };
  }, []);

  const selectWord = (index: number) => {
    setSelectedIndex(index);
    setQuery(GLOVE_WORDS[index].word);
    setSearchError(null);
  };
  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    const index = indexFor(query.trim().toLowerCase());
    if (index < 0) {
      setSearchError('Choose a word from this curated vocabulary.');
      return;
    }
    selectWord(index);
    setMode('explore');
  };
  const updateAnalogy = (index: number, word: string) => setAnalogyWords((current) => current.map((value, currentIndex) => currentIndex === index ? word : value) as [string, string, string]);
  const updateOdd = (index: number, word: string) => setOddWords((current) => current.map((value, currentIndex) => currentIndex === index ? word : value));

  return (
    <section className="overflow-hidden bg-[#061018] text-white" data-testid="word-embedding-explorer">
      <header className="border-b border-white/10 px-5 py-5 md:px-7">
        <div className="mb-5 flex flex-wrap gap-2" aria-label="Embedding data source">
          <button type="button" onClick={() => setSource('glove')} aria-pressed={source === 'glove'} className={`min-h-10 rounded-full px-4 text-xs font-semibold transition ${source === 'glove' ? 'bg-white text-slate-950' : 'border border-white/10 text-slate-400 hover:text-white'}`}>Focused GloVe · 181 words</button>
          {gpt2Status?.available ? <button type="button" onClick={() => setSource('gpt2')} aria-pressed={source === 'gpt2'} className={`min-h-10 rounded-full px-4 text-xs font-semibold transition ${source === 'gpt2' ? 'bg-sky-400 text-slate-950' : 'border border-sky-400/30 text-sky-200 hover:border-sky-300'}`} data-testid="gpt2-embedding-source">Full GPT-2 · 50,257 tokens</button> : null}
        </div>
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-sky-300">{source === 'glove' ? `Real word vectors · ${GLOVE_MODEL.dimensions} dimensions` : 'Real GPT-2 token embeddings · 768 dimensions'}</p>
            <h3 className="mt-2 text-2xl font-semibold">Embedding neighborhood</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Start with one token and the few vectors closest to it.</p>
          </div>
          {source === 'glove' ? <form onSubmit={submitSearch} className="w-full max-w-md">
            <label htmlFor="word-space-search" className="sr-only">Find a word</label>
            <div className="flex border border-white/15 bg-white/5 focus-within:border-sky-400">
              <Search className="ml-3 mt-3 h-4 w-4 shrink-0 text-slate-500" />
              <input id="word-space-search" list="word-space-options" value={query} onChange={(event) => setQuery(event.target.value)} className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none" placeholder="Find a word…" data-testid="word-embedding-search" />
              <button type="submit" className="border-l border-white/10 px-4 text-xs font-semibold text-sky-200 hover:bg-white/5">Focus</button>
            </div>
            <datalist id="word-space-options">{GLOVE_WORDS.map(({ word }) => <option key={word} value={word} />)}</datalist>
            {searchError ? <p className="mt-2 text-xs text-amber-200" role="alert">{searchError}</p> : null}
          </form> : null}
        </div>
        {source === 'glove' ? <div className="mt-5 flex flex-wrap gap-1" role="tablist" aria-label="Word embedding experiments">
          {modes.map((candidate) => (
            <button key={candidate.id} type="button" role="tab" aria-selected={mode === candidate.id} onClick={() => setMode(candidate.id)} className={`min-h-10 px-4 text-xs font-semibold transition ${mode === candidate.id ? 'bg-sky-400 text-slate-950' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`} data-testid={`word-mode-${candidate.id}`}>{candidate.label}</button>
          ))}
        </div> : null}
      </header>

      {source === 'glove' ? <><div className="grid xl:grid-cols-[minmax(0,1fr)_17rem]">
        <WordEmbeddingCanvas rows={GLOVE_WORDS} selectedIndex={focusedIndex} visibleIndices={visibleIndices} onSelect={selectWord} highlightedIndices={highlightedIndices} connectionPairs={connectionPairs} />
        <aside className="border-t border-white/10 p-5 xl:border-l xl:border-t-0 md:p-7" aria-label="Embedding experiment details">
          {mode === 'explore' ? <ExploreWordPanel rows={GLOVE_WORDS} selectedIndex={selectedIndex} nearest={nearest} onSelect={selectWord} /> : null}
          {mode === 'analogy' ? <AnalogyPanel rows={GLOVE_WORDS} words={analogyWords} onChange={updateAnalogy} matches={analogy.matches} onSelect={selectWord} /> : null}
          {mode === 'odd' ? <OddOneOutPanel rows={GLOVE_WORDS} words={oddWords} onChange={updateOdd} scores={odd.scores} /> : null}
          {mode === 'axis' ? <SemanticAxisPanel rows={GLOVE_WORDS} from={axisWords[0]} to={axisWords[1]} onFrom={(word) => setAxisWords([word, axisWords[1]])} onTo={(word) => setAxisWords([axisWords[0], word])} low={axis.low} high={axis.high} onSelect={selectWord} /> : null}
        </aside>
      </div>

      <footer className="flex flex-col gap-2 border-t border-white/10 px-5 py-4 text-xs leading-5 text-slate-500 md:flex-row md:items-center md:justify-between md:px-7">
        <span>Only the relevant neighborhood is drawn; all 181 teaching words remain searchable.</span>
        <span>Real GloVe vectors · focused 3D PCA view</span>
      </footer></> : <Gpt2EmbeddingExplorer />}
      <p className="border-t border-white/10 px-5 py-3 text-xs leading-5 text-slate-600 md:px-7">Bonsai note: Ollama exposes Bonsai tokenization and generation, but not the model’s embedding weight matrix.</p>
    </section>
  );
}
