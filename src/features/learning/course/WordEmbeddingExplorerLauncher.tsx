import { lazy, Suspense, useState } from 'react';
import { Axis3d, LoaderCircle } from 'lucide-react';

const WordEmbeddingExplorer = lazy(() => import('./WordEmbeddingExplorer').then((module) => ({ default: module.WordEmbeddingExplorer })));

const previewPoints = [
  [12, 28], [21, 64], [30, 42], [39, 72], [48, 24], [57, 54],
  [64, 34], [71, 69], [78, 18], [84, 47], [89, 78], [94, 30],
];

export function WordEmbeddingExplorerLauncher() {
  const [open, setOpen] = useState(false);
  if (open) {
    return <Suspense fallback={<div className="flex min-h-[38rem] items-center justify-center bg-[#061018] text-sm text-slate-300"><LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Loading 181 real word vectors…</div>}><WordEmbeddingExplorer /></Suspense>;
  }

  return (
    <div className="grid min-h-80 overflow-hidden bg-[#061018] text-white md:grid-cols-[minmax(0,1fr)_21rem]" data-testid="word-embedding-explorer-closed">
      <div className="relative min-h-64 overflow-hidden border-white/10 p-7 md:border-r md:p-9">
        <div className="absolute inset-0 opacity-55" aria-hidden="true">
          {previewPoints.map(([left, top], index) => <i key={index} className={`absolute rounded-full ${index % 4 === 0 ? 'h-2.5 w-2.5 bg-yellow-300' : 'h-1.5 w-1.5 bg-sky-400'}`} style={{ left: `${left}%`, top: `${top}%` }} />)}
          <i className="absolute left-[12%] top-[28%] h-px w-[72%] origin-left rotate-[14deg] bg-sky-400/15" />
          <i className="absolute left-[22%] top-[65%] h-px w-[65%] origin-left -rotate-[18deg] bg-sky-400/15" />
        </div>
        <div className="relative max-w-xl">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-sky-300">GloVe 6B · real 50D vectors</p>
          <h3 className="mt-4 text-3xl font-semibold leading-tight">Explore relationships, not twelve invented dots.</h3>
          <p className="mt-4 text-sm leading-6 text-slate-400">Search 181 words, inspect cosine neighbors, solve analogies, find an outlier, and build a semantic direction.</p>
        </div>
      </div>
      <div className="relative flex flex-col justify-between p-7 md:p-9">
        <Axis3d className="h-8 w-8 text-sky-300" />
        <div className="mt-12">
          <p className="text-xs leading-5 text-slate-500">The full dataset and 3D projection load only when opened.</p>
          <button type="button" onClick={() => setOpen(true)} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-3 bg-sky-400 px-5 text-sm font-semibold text-slate-950 transition hover:bg-sky-300" data-testid="open-word-embedding-explorer">
            Open word observatory <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
