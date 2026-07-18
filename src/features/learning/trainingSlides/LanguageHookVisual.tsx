import { ArrowRight } from 'lucide-react';
import type { LearningLabId } from '../learningCatalog';

function TokenizationVisual() {
  const tokens = [['un', '359'], ['believ', '9912'], ['able', '481'], ['!', '0']];

  return (
    <div className="grid gap-5 lg:grid-cols-[0.8fr_auto_1.2fr] lg:items-center">
      <div className="border-l-2 border-sky-400 pl-5">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Human text</p>
        <p className="mt-3 text-3xl font-semibold">unbelievable!</p>
      </div>
      <ArrowRight className="hidden h-6 w-6 text-slate-600 lg:block" />
      <div className="flex flex-wrap gap-2">
        {tokens.map(([piece, id]) => (
          <div key={piece} className="border-b border-sky-300/35 px-4 py-3">
            <p className="text-xl font-semibold text-sky-200">{piece}</p>
            <p className="mt-1 font-mono text-xs text-slate-500">id {id}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AttentionVisual() {
  return (
    <div className="relative mx-auto max-w-4xl overflow-hidden py-12">
      <svg viewBox="0 0 800 170" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <path d="M650 118 Q420 -40 135 118" fill="none" stroke="#38bdf8" strokeWidth="5" />
        <path d="M650 118 Q550 30 420 118" fill="none" stroke="#334155" strokeWidth="3" strokeDasharray="8 8" />
      </svg>
      <div className="relative flex justify-between gap-2">
        {['The', 'animal', 'was', 'tired'].map((token, index) => (
          <div key={token} className={`min-w-16 border-b px-1 py-4 text-center sm:min-w-20 sm:px-3 ${index === 1 || index === 3 ? 'border-sky-300 text-white' : 'border-white/15 text-slate-500'}`}>
            <p className="text-base font-semibold sm:text-xl">{token}</p>
            {index === 1 ? <p className="mt-2 font-mono text-[0.65rem] text-sky-300 sm:text-xs">weight 0.73</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProbabilityVisual() {
  return (
    <div className="space-y-5">
      {[['Paris', 39], ['a', 8], ['the', 7], ['one', 3]].map(([token, value], index) => (
        <div key={String(token)} className="grid grid-cols-[5rem_1fr_4rem] items-center gap-4">
          <span className="font-mono text-lg text-white">{token}</span>
          <div className="h-3 bg-white/10">
            <div className={`h-full ${index === 0 ? 'bg-sky-400' : 'bg-slate-600'}`} style={{ width: `${Number(value) * 2.2}%` }} />
          </div>
          <span className="font-mono text-slate-400">{value}%</span>
        </div>
      ))}
    </div>
  );
}

function CacheVisual() {
  return (
    <div className="grid gap-7 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Prompt tokens</p>
        <div className="mt-4 flex gap-1">{Array.from({ length: 8 }, (_, index) => <span key={index} className="h-14 flex-1 border border-white/15 bg-white/[0.03]" />)}</div>
      </div>
      <ArrowRight className="hidden h-6 w-6 text-sky-300 lg:block" />
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">K + V retained at every layer</p>
        <div className="mt-4 grid grid-cols-8 gap-1">{Array.from({ length: 32 }, (_, index) => <span key={index} className={`h-6 ${index % 8 === 7 ? 'bg-sky-400' : 'bg-sky-400/20'}`} />)}</div>
      </div>
    </div>
  );
}

function EmbeddingVisual() {
  const points = [
    ['puppy plays', 'left-[15%] top-[18%] bg-sky-300 text-slate-950'],
    ['dog in park', 'left-[31%] top-[38%] bg-sky-400 text-slate-950'],
    ['migration failed', 'left-[70%] top-[65%] bg-amber-300 text-slate-950'],
    ['database error', 'left-[80%] top-[42%] bg-amber-200 text-slate-950'],
  ];

  return (
    <div className="relative h-72 overflow-hidden border-l border-b border-white/15">
      {points.map(([label, classes]) => <span key={label} className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full px-3 py-2 text-xs font-semibold ${classes}`}>{label}</span>)}
      <span className="absolute bottom-4 right-4 text-xs text-slate-600">semantic direction →</span>
    </div>
  );
}

function ResidualStreamVisual() {
  const layers = ['embed', '+ attn', '+ MLP', '+ attn', '+ MLP', 'logits'];
  return (
    <div>
      <div className="flex items-center gap-1">
        {layers.map((label, index) => (
          <div key={label} className="flex min-w-0 flex-1 items-center gap-1">
            <div className={`flex aspect-square w-full max-w-20 flex-col items-center justify-center border ${index === layers.length - 1 ? 'border-amber-300 bg-amber-300 text-slate-950' : 'border-sky-300/25 bg-sky-300/[0.06] text-sky-200'}`}>
              <span className="font-mono text-lg">R{index}</span><span className="mt-1 text-[0.6rem] uppercase tracking-wide opacity-60">{label}</span>
            </div>
            {index < layers.length - 1 ? <span className="text-slate-600">+</span> : null}
          </div>
        ))}
      </div>
      <p className="mt-5 border-l-2 border-sky-400 pl-4 text-sm text-slate-400">One stream · many learned updates · one vocabulary projection</p>
    </div>
  );
}

export function LanguageHookVisual({ labId }: { labId: LearningLabId }) {
  switch (labId) {
    case 'tokenization': return <TokenizationVisual />;
    case 'attention': return <AttentionVisual />;
    case 'residual-stream': return <ResidualStreamVisual />;
    case 'next-token': return <ProbabilityVisual />;
    case 'kv-cache': return <CacheVisual />;
    case 'embeddings': return <EmbeddingVisual />;
    default: return null;
  }
}
