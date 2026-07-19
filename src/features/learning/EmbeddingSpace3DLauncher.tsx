import { lazy, Suspense, useState } from 'react';
import { Axis3d, LoaderCircle } from 'lucide-react';
import { EMBEDDING_SPACE_COPY, type EmbeddingSpaceKind } from './embeddingSpaceCopy';

const EmbeddingSpace3D = lazy(() => import('./EmbeddingSpace3D').then((module) => ({ default: module.EmbeddingSpace3D })));

type EmbeddingSpace3DLauncherProps = {
  inputs: string[];
  vectors: number[][];
  selectedIndex: number;
  onSelect: (index: number) => void;
  kind?: EmbeddingSpaceKind;
};

export function EmbeddingSpace3DLauncher({ kind = 'semantic', ...props }: EmbeddingSpace3DLauncherProps) {
  const [open, setOpen] = useState(false);
  const copy = EMBEDDING_SPACE_COPY[kind];

  if (open) {
    return (
      <Suspense fallback={<div className="flex min-h-[32rem] items-center justify-center bg-[#071018] text-sm text-slate-300" data-testid="embedding-space-3d-loading"><LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Loading the 3D space…</div>}>
        <EmbeddingSpace3D {...props} kind={kind} />
      </Suspense>
    );
  }

  return (
    <div className="grid min-h-80 overflow-hidden bg-[#071018] text-white md:grid-cols-[minmax(0,1fr)_20rem]" data-testid="embedding-space-3d-closed">
      <div className="relative flex items-end overflow-hidden border-white/10 p-7 md:border-r md:p-9">
        <div aria-hidden="true" className="absolute inset-0 opacity-45">
          {[18, 34, 49, 63, 78].map((left, index) => <span key={left} className="absolute h-2.5 w-2.5 rounded-full bg-sky-400" style={{ left: `${left}%`, top: `${[31, 66, 44, 70, 27][index]}%` }} />)}
          <span className="absolute left-[18%] top-[31%] h-px w-[32%] origin-left rotate-[17deg] bg-sky-400/30" />
          <span className="absolute left-[49%] top-[44%] h-px w-[30%] origin-left -rotate-[24deg] bg-sky-400/30" />
        </div>
        <div className="relative max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-300">{copy.eyebrow}</p>
          <h3 className="mt-3 text-3xl font-semibold tracking-tight">{copy.title}</h3>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-300">{copy.description}</p>
        </div>
      </div>
      <div className="flex flex-col justify-center p-7 md:p-8">
        <button type="button" onClick={() => setOpen(true)} className="group inline-flex min-h-12 items-center justify-center gap-3 bg-sky-400 px-5 text-sm font-semibold text-slate-950 transition hover:bg-sky-300" data-testid="open-embedding-space-3d">
          <Axis3d className="h-5 w-5" /> Explore in 3D
        </button>
        <p className="mt-4 text-xs leading-5 text-slate-400">Drag to orbit · Scroll to zoom · Keyboard-select every point</p>
      </div>
    </div>
  );
}
