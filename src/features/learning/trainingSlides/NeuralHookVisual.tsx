import { ArrowRight, Sigma } from 'lucide-react';
import type { LearningLabId } from '../learningCatalog';

function PerceptronVisual() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
      <div className="space-y-3">
        {[['x₁', '1'], ['x₂', '0'], ['bias', '1']].map(([label, value]) => (
          <div key={label} className="flex w-36 items-center justify-between border-b border-white/15 py-2">
            <span className="text-slate-500">{label}</span><span className="font-mono text-xl">{value}</span>
          </div>
        ))}
      </div>
      <ArrowRight className="h-6 w-6 text-slate-600" />
      <div className="flex h-40 w-40 items-center justify-center rounded-full border border-sky-300/30 bg-sky-300/[0.05] text-center">
        <div><Sigma className="mx-auto h-8 w-8 text-sky-300" /><p className="mt-3 font-mono">w·x + b</p></div>
      </div>
      <ArrowRight className="h-6 w-6 text-slate-600" />
      <div className="border-l-2 border-sky-400 pl-5">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">decision</p><p className="mt-2 font-mono text-4xl text-sky-300">+1</p>
      </div>
    </div>
  );
}

function GradientVisual() {
  return (
    <div className="relative h-72 overflow-hidden">
      {[0, 1, 2, 3, 4].map((ring) => <span key={ring} className="absolute left-1/2 top-1/2 rounded-full border border-sky-300/20" style={{ width: `${90 + ring * 120}px`, height: `${55 + ring * 65}px`, transform: 'translate(-50%, -50%)' }} />)}
      <span className="absolute left-[70%] top-[24%] h-5 w-5 rounded-full bg-amber-300" />
      <span className="absolute left-[49%] top-[48%] h-4 w-4 rounded-full bg-sky-300" />
      <svg viewBox="0 0 700 280" className="absolute inset-0 h-full w-full">
        <path d="M485 67 Q420 102 348 138" fill="none" stroke="#fbbf24" strokeWidth="5" strokeDasharray="9 7" />
        <path d="M347 138 l22 -4 l-10 18" fill="#fbbf24" />
      </svg>
    </div>
  );
}

function BackpropVisual() {
  const nodes = ['x', 'z₁', 'ReLU', 'z₂', 'p', 'L'];

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-slate-500">Forward → values</p>
        <div className="grid grid-cols-6 gap-px bg-white/10">{nodes.map((node) => <span key={node} className="bg-slate-950 px-2 py-4 text-center font-mono text-base">{node}</span>)}</div>
      </div>
      <div>
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-amber-300">Gradients ← backward</p>
        <div className="grid grid-cols-6 gap-px bg-amber-300/20">{nodes.map((node) => <span key={node} className="bg-slate-950 px-1 py-4 text-center font-mono text-sm text-amber-100">∂L/∂{node}</span>)}</div>
      </div>
    </div>
  );
}

function DepthVisual() {
  return (
    <div className="mx-auto grid aspect-square w-full max-w-sm grid-cols-2 gap-3 border border-white/15 p-5">
      {[[0, 1, 1], [1, 1, 0], [0, 0, 0], [1, 0, 1]].map(([x1, x2, label]) => (
        <div key={`${x1}-${x2}`} className={`flex flex-col items-center justify-center ${label ? 'bg-sky-300 text-slate-950' : 'border border-white/20 text-slate-300'}`}>
          <span className="font-mono text-xs opacity-65">({x1}, {x2})</span><span className="mt-1 font-mono text-4xl font-semibold">{label}</span>
        </div>
      ))}
    </div>
  );
}

function ConvolutionVisual() {
  const pixels = [0,0,1,1,0, 0,1,1,0,0, 1,1,0,0,0, 1,1,0,0,0, 0,1,1,0,0];
  const kernel = [1,0,-1,1,0,-1,1,0,-1];

  return (
    <div className="flex flex-wrap items-center justify-center gap-5 lg:flex-nowrap">
      <div className="grid w-48 shrink-0 grid-cols-5 gap-1">{pixels.map((value, index) => <span key={index} className={`aspect-square ${value ? 'bg-sky-300' : 'bg-white/[0.06]'}`} />)}</div>
      <span className="font-mono text-4xl text-slate-600">*</span>
      <div className="grid w-32 shrink-0 grid-cols-3 gap-1">{kernel.map((value, index) => <span key={index} className="flex aspect-square items-center justify-center border border-white/15 font-mono text-lg">{value}</span>)}</div>
      <ArrowRight className="h-6 w-6 shrink-0 text-slate-600" />
      <div className="flex h-20 w-20 shrink-0 items-center justify-center bg-amber-300 font-mono text-4xl text-slate-950">2</div>
    </div>
  );
}

function DigitVisual() {
  const digit = ['01110','10001','00001','00110','00001','10001','01110'];

  return (
    <div className="flex flex-wrap items-center justify-center gap-8">
      <div className="grid w-48 grid-cols-5 gap-1">{digit.join('').split('').map((value, index) => <span key={index} className={`aspect-square ${value === '1' ? 'bg-sky-300' : 'bg-white/[0.05]'}`} />)}</div>
      <ArrowRight className="h-6 w-6 text-slate-600" />
      <div className="space-y-2">{[0,1,2,3,4,5,6,7,8,9].map((number) => (
        <div key={number} className="grid grid-cols-[1.5rem_10rem] items-center gap-2">
          <span className="font-mono text-xs text-slate-500">{number}</span>
          <div className="h-2 bg-white/10"><div className={`h-full ${number === 3 ? 'bg-amber-300' : 'bg-slate-600'}`} style={{ width: number === 3 ? '96%' : `${2 + (number % 3) * 3}%` }} /></div>
        </div>
      ))}</div>
    </div>
  );
}

export function NeuralHookVisual({ labId }: { labId: LearningLabId }) {
  switch (labId) {
    case 'perceptron': return <PerceptronVisual />;
    case 'gradient-descent': return <GradientVisual />;
    case 'backpropagation': return <BackpropVisual />;
    case 'depth': return <DepthVisual />;
    case 'convolution': return <ConvolutionVisual />;
    case 'digits': return <DigitVisual />;
    default: return null;
  }
}
