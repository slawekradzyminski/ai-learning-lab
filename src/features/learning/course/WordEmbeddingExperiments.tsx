import { ArrowRight } from 'lucide-react';
import type { GloveWord } from './gloveWordEmbeddings';
import type { WordScore } from './wordEmbeddingMath';

type WordPickerProps = {
  label: string;
  value: string;
  rows: GloveWord[];
  onChange: (word: string) => void;
};

export function WordPicker({ label, value, rows, onChange }: WordPickerProps) {
  return (
    <label className="block text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-10 w-full border border-white/15 bg-white/5 px-2 text-sm normal-case tracking-normal text-white outline-none focus:border-sky-400">
        {rows.map(({ word }) => <option key={word} value={word} className="text-slate-950">{word}</option>)}
      </select>
    </label>
  );
}

export function ExploreWordPanel({ rows, selectedIndex, nearest, onSelect }: { rows: GloveWord[]; selectedIndex: number; nearest: WordScore[]; onSelect: (index: number) => void }) {
  return (
    <div data-testid="word-experiment-explore">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-sky-300">Selected word</p>
      <h4 className="mt-3 text-3xl font-semibold text-yellow-200">{rows[selectedIndex].word}</h4>
      <p className="mt-1 text-xs text-slate-500">{rows[selectedIndex].category} · row {selectedIndex + 1}</p>
      <ol className="mt-5 divide-y divide-white/10 border-y border-white/10">
        {nearest.slice(0, 6).map(({ index, score }, rank) => (
          <li key={index}>
            <button type="button" onClick={() => onSelect(index)} className="grid w-full grid-cols-[1.4rem_1fr_auto] gap-3 py-3 text-left text-sm text-slate-300 hover:text-white">
              <span className="font-mono text-[0.65rem] text-sky-300">{rank + 1}</span>
              <span>{rows[index].word}</span>
              <span className="font-mono text-xs text-sky-300">{score.toFixed(3)}</span>
            </button>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-xs leading-5 text-slate-500">Cosine similarity ranks vectors by direction, not spelling or dictionary category.</p>
    </div>
  );
}

export function AnalogyPanel({ rows, words, onChange, matches, onSelect }: { rows: GloveWord[]; words: [string, string, string]; onChange: (index: number, word: string) => void; matches: WordScore[]; onSelect: (index: number) => void }) {
  const answer = matches[0];
  return (
    <div data-testid="word-experiment-analogy">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-sky-300">Vector analogy</p>
      <div className="mt-5 space-y-3">
        <WordPicker label="Remove" value={words[0]} rows={rows} onChange={(word) => onChange(0, word)} />
        <WordPicker label="Relationship" value={words[1]} rows={rows} onChange={(word) => onChange(1, word)} />
        <WordPicker label="Apply to" value={words[2]} rows={rows} onChange={(word) => onChange(2, word)} />
      </div>
      <div className="mt-6 border-y border-white/10 py-5">
        <p className="font-mono text-xs text-slate-400">{words[1]} − {words[0]} + {words[2]}</p>
        <div className="mt-3 flex items-center gap-3 text-2xl font-semibold text-yellow-200"><ArrowRight className="h-5 w-5 text-sky-300" />{answer ? rows[answer.index].word : '—'}</div>
      </div>
      <p className="mt-5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-500">Other nearby answers</p>
      <ol className="mt-2 space-y-1">
        {matches.slice(1, 4).map(({ index, score }, rank) => (
          <li key={index}><button type="button" onClick={() => onSelect(index)} className="grid w-full grid-cols-[1.5rem_1fr_auto] py-2 text-left text-sm text-slate-300 hover:text-white"><span className="font-mono text-sky-300">{rank + 2}</span><span>{rows[index].word}</span><span className="font-mono text-xs text-sky-300">{score.toFixed(3)}</span></button></li>
        ))}
      </ol>
      <p className="mt-5 text-xs leading-5 text-slate-500">This is a geometric pattern in the learned table, not symbolic reasoning.</p>
    </div>
  );
}

export function OddOneOutPanel({ rows, words, onChange, scores }: { rows: GloveWord[]; words: string[]; onChange: (index: number, word: string) => void; scores: Array<{ word: string; score: number }> }) {
  const odd = [...scores].sort((left, right) => left.score - right.score)[0];
  return (
    <div data-testid="word-experiment-odd-one-out">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-sky-300">Odd one out</p>
      <div className="mt-5 space-y-3">
        {words.map((word, index) => <WordPicker key={index} label={`Word ${index + 1}`} value={word} rows={rows} onChange={(next) => onChange(index, next)} />)}
      </div>
      <div className="mt-6 border-y border-white/10 py-5">
        <p className="text-xs text-slate-500">Lowest average similarity</p>
        <p className="mt-2 text-3xl font-semibold text-yellow-200">{odd.word}</p>
      </div>
      <div className="mt-5 space-y-3">
        {scores.map(({ word, score }) => (
          <div key={word} className="grid grid-cols-[5rem_1fr_3rem] items-center gap-3 text-xs text-slate-300">
            <span className={word === odd.word ? 'font-semibold text-yellow-200' : ''}>{word}</span>
            <span className="h-1 bg-white/10"><i className="block h-full bg-sky-400" style={{ width: `${Math.max(3, (score + 1) / 2 * 100)}%` }} /></span>
            <span className="font-mono text-sky-300">{score.toFixed(2)}</span>
          </div>
        ))}
      </div>
      <p className="mt-6 text-xs leading-5 text-slate-500">Each word is compared with the other three. The lowest average cosine similarity marks the outlier.</p>
    </div>
  );
}

export function SemanticAxisPanel({ rows, from, to, onFrom, onTo, low, high, onSelect }: { rows: GloveWord[]; from: string; to: string; onFrom: (word: string) => void; onTo: (word: string) => void; low: WordScore[]; high: WordScore[]; onSelect: (index: number) => void }) {
  const column = (label: string, values: WordScore[]) => (
    <div>
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-slate-500">Toward {label}</p>
      <ol className="mt-3 space-y-1">
        {values.map(({ index, score }) => <li key={index}><button type="button" onClick={() => onSelect(index)} className="grid w-full grid-cols-[1fr_auto] py-1.5 text-left text-sm text-slate-300 hover:text-white"><span>{rows[index].word}</span><span className="font-mono text-[0.65rem] text-sky-300">{score.toFixed(2)}</span></button></li>)}
      </ol>
    </div>
  );
  return (
    <div data-testid="word-experiment-axis">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-sky-300">Semantic direction</p>
      <div className="mt-5 space-y-3">
        <WordPicker label="From" value={from} rows={rows} onChange={onFrom} />
        <WordPicker label="To" value={to} rows={rows} onChange={onTo} />
      </div>
      <div className="mt-6 flex items-center gap-3 border-y border-white/10 py-4 text-sm font-semibold text-white"><span>{from}</span><ArrowRight className="h-4 w-4 text-sky-300" /><span>{to}</span></div>
      <div className="mt-5 grid grid-cols-2 gap-6">{column(from, low)}{column(to, high)}</div>
      <p className="mt-6 text-xs leading-5 text-slate-500">Subtracting two vectors defines a direction. Projecting every word onto it reveals what the dataset associates with that contrast—and can expose bias.</p>
    </div>
  );
}
