import { useMemo, useState } from 'react';
import { LLM_COURSE_ATTENTION_WINDOW } from './courseScenario';
import { WordEmbeddingExplorerLauncher } from './WordEmbeddingExplorerLauncher';

const rows = [
  { token: 'animal', id: 5812, embedding: [0.72, -0.18], position: [0.00, 0.00] },
  { token: 'street', id: 9261, embedding: [0.31, 0.64], position: [0.08, -0.03] },
  { token: 'was', id: 574, embedding: [-0.14, 0.43], position: [0.16, -0.06] },
  { token: 'too', id: 1846, embedding: [0.55, 0.12], position: [0.24, -0.09] },
];

function vector(values: number[]) {
  return `[${values.map((value) => value.toFixed(2)).join(', ')}]`;
}

export function TokenEmbeddingActivity() {
  const [selected, setSelected] = useState(3);
  const row = rows[selected];
  const state = useMemo(() => row.embedding.map((value, index) => value + row.position[index]), [row]);

  return (
    <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white" data-testid="token-embedding-activity">
      <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
        <div className="p-5 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Glass-box embedding table</p>
          <h3 className="mt-3 text-2xl font-semibold text-slate-950">Select a token ID, then inspect its row.</h3>
          <div className="mt-6 divide-y divide-stone-200 border-y border-stone-200">
            {rows.map((candidate, index) => (
              <button key={candidate.id} type="button" onClick={() => setSelected(index)} aria-pressed={selected === index} className={`grid w-full grid-cols-[1fr_5rem_8rem] items-center gap-3 px-2 py-3 text-left transition ${selected === index ? 'bg-sky-50 text-sky-950' : 'hover:bg-stone-50'}`} data-testid={`embedding-row-${index}`}>
                <span className="font-mono font-semibold">{candidate.token}</span><span className="font-mono text-sm text-slate-500">{candidate.id}</span><span className="font-mono text-xs text-slate-500">{vector(candidate.embedding)}</span>
              </button>
            ))}
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-500">IDs and values are intentionally tiny teaching data. The operation is exact; the values are not captured Bonsai parameters.</p>
        </div>
        <div className="bg-slate-950 p-5 text-white md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Initial residual state · position {selected + 1}</p>
          <div className="mt-8 space-y-5 font-mono">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4"><span className="text-slate-400">E[{row.id}]</span><span data-testid="embedding-token-vector">{vector(row.embedding)}</span></div>
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4"><span className="text-slate-400">+ P[{selected + 1}]</span><span>{vector(row.position)}</span></div>
            <div className="flex items-center justify-between gap-4 text-lg"><span className="text-sky-300">= R₀</span><span className="text-sky-200" data-testid="embedding-initial-state">{vector(state)}</span></div>
          </div>
          <div className="mt-8 border-l-2 border-amber-300 pl-4 text-sm leading-6 text-slate-300">
            “{LLM_COURSE_ATTENTION_WINDOW[selected]}” now has a vector at a specific position. It is not yet contextual and it is not a sentence embedding for search.
          </div>
        </div>
      </div>
      <div className="border-t border-stone-200 p-5 md:p-8">
        <WordEmbeddingExplorerLauncher />
      </div>
    </section>
  );
}
