import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Combine, GitMerge, Layers3, Split } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { LabPageHeader } from './LabPageHeader';
import { LearningCheckpoint } from './LearningCheckpoint';
import { XOR_INPUTS, xorDepthTrace, xorTruthTable } from './trainingMath';

function BinaryPoint({ x, y, target, selected }: { x: number; y: number; target: 0 | 1; selected: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {selected ? <circle r="18" fill="none" stroke="#0f172a" strokeWidth="3" /> : null}
      <circle r="11" fill={target === 1 ? '#0284c7' : '#f59e0b'} stroke="white" strokeWidth="3" />
      <text x="0" y="4" textAnchor="middle" fontSize="10" fontWeight="800" fill="white">{target}</text>
    </g>
  );
}

function InputSpace({ selectedIndex, mode }: { selectedIndex: number; mode: 'shallow' | 'deep' }) {
  const map = (value: number) => 78 + value * 184;
  return (
    <svg viewBox="0 0 340 300" className="h-auto w-full" role="img" aria-label="XOR input space">
      <rect x="44" y="30" width="252" height="230" rx="20" fill="#fafaf9" stroke="#e7e5e4" />
      <line x1="78" y1="214" x2="262" y2="214" stroke="#d6d3d1" />
      <line x1="78" y1="214" x2="78" y2="30" stroke="#d6d3d1" />
      <line x1="78" y1="122" x2="262" y2="122" stroke="#e7e5e4" strokeDasharray="4 4" />
      <line x1="170" y1="30" x2="170" y2="214" stroke="#e7e5e4" strokeDasharray="4 4" />
      {mode === 'shallow' ? <line x1="86" y1="38" x2="286" y2="238" stroke="#ef4444" strokeWidth="4" strokeDasharray="7 5" /> : null}
      {XOR_INPUTS.map((input, index) => <BinaryPoint key={`${input.x1}-${input.x2}`} x={map(input.x1)} y={map(1 - input.x2) - 48} target={input.target} selected={selectedIndex === index} />)}
      {mode === 'shallow' ? <circle cx={map(1)} cy={map(0) - 48} r="22" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 3" /> : null}
      <text x="282" y="242" fontSize="12" fill="#64748b">x₁</text><text x="60" y="42" fontSize="12" fill="#64748b">x₂</text>
      <text x="170" y="286" textAnchor="middle" fontSize="12" fontWeight="700" fill={mode === 'shallow' ? '#b91c1c' : '#475569'}>{mode === 'shallow' ? 'Any one line leaves a mistake' : 'Original inputs are unchanged'}</text>
    </svg>
  );
}

function HiddenSpace({ selectedIndex }: { selectedIndex: number }) {
  const table = xorTruthTable();
  const mapX = (value: number) => 78 + value * 184;
  const mapY = (value: number) => 214 - value * 184;
  return (
    <svg viewBox="0 0 340 300" className="h-auto w-full" role="img" aria-label="XOR hidden feature space" data-testid="depth-hidden-space">
      <rect x="44" y="30" width="252" height="230" rx="20" fill="#020617" />
      <line x1="78" y1="214" x2="262" y2="214" stroke="#334155" /><line x1="78" y1="214" x2="78" y2="30" stroke="#334155" />
      <line x1={mapX(0.5)} y1={mapY(0)} x2={mapX(1)} y2={mapY(0.25)} stroke="#38bdf8" strokeWidth="4" />
      {table.map((row, index) => {
        const overlapOffset = index === 2 ? 8 : index === 1 ? -8 : 0;
        return <BinaryPoint key={`${row.x1}-${row.x2}`} x={mapX(row.orFeature) + overlapOffset} y={mapY(row.andFeature)} target={row.target} selected={selectedIndex === index} />;
      })}
      <text x="250" y="244" fontSize="12" fill="#94a3b8">hOR</text><text x="50" y="44" fontSize="12" fill="#94a3b8">hAND</text>
      <text x="170" y="286" textAnchor="middle" fontSize="12" fontWeight="700" fill="#0369a1">One line now separates the hidden features</text>
    </svg>
  );
}

export function DepthLabPage() {
  const [selectedIndex, setSelectedIndex] = useState(1);
  const [mode, setMode] = useState<'shallow' | 'deep'>('deep');
  const selectedInput = XOR_INPUTS[selectedIndex];
  const trace = useMemo(() => xorDepthTrace(selectedInput), [selectedInput]);
  const table = useMemo(() => xorTruthTable(), []);

  return (
    <div data-testid="depth-lab-page">
      <LabPageHeader
        eyebrow="Learning foundations · step 4"
        title="Make XOR separable by changing representation"
        description="A single line cannot solve XOR. Build two reusable hidden features, move the four inputs into a new space, and watch a second linear boundary finish the task."
        aside={mode === 'deep' ? 'Two-layer solution · 4/4 correct' : 'Single boundary · at most 3/4'}
      />

      <div className="mb-6 grid grid-cols-2 gap-2 rounded-[1.35rem] border border-stone-200 bg-white/80 p-2" role="group" aria-label="Network depth">
        <button type="button" onClick={() => setMode('shallow')} aria-pressed={mode === 'shallow'} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold ${mode === 'shallow' ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-stone-100'}`} data-testid="depth-mode-shallow"><Split className="h-4 w-4" /> One linear boundary</button>
        <button type="button" onClick={() => setMode('deep')} aria-pressed={mode === 'deep'} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold ${mode === 'deep' ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-stone-100'}`} data-testid="depth-mode-deep"><Layers3 className="h-4 w-4" /> Two composed layers</button>
      </div>

      <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white/85">
        <div className="grid xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] xl:items-center">
          <div className="border-b border-stone-200 p-5 xl:border-b-0 xl:p-7"><div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Input representation</p><h2 className="mt-1 text-xl font-semibold text-slate-950">x₁ and x₂</h2></div>{mode === 'shallow' ? <Badge variant="warning">Not linearly separable</Badge> : <Badge variant="outline">Before layer 1</Badge>}</div><InputSpace selectedIndex={selectedIndex} mode={mode} /></div>
          <div className="hidden flex-col items-center gap-2 text-sky-700 xl:flex"><GitMerge className="h-7 w-7" /><span className="text-xs font-semibold">layer 1</span></div>
          <div className={`p-5 transition md:p-7 ${mode === 'shallow' ? 'opacity-30 grayscale' : 'opacity-100'}`}><div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Hidden representation</p><h2 className="mt-1 text-xl font-semibold text-slate-950">hOR and hAND</h2></div><Badge variant={mode === 'deep' ? 'success' : 'outline'}>{mode === 'deep' ? 'Linearly separable' : 'Hidden layer disabled'}</Badge></div><HiddenSpace selectedIndex={selectedIndex} /></div>
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-[2rem] bg-slate-950 text-white" data-testid="depth-calculation">
        <div className="grid gap-5 border-b border-white/10 p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end md:p-7">
          <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Choose an XOR example</p><div className="mt-3 flex flex-wrap gap-2">{XOR_INPUTS.map((input, index) => <button key={`${input.x1}-${input.x2}`} type="button" onClick={() => setSelectedIndex(index)} aria-pressed={selectedIndex === index} className={`min-h-11 rounded-xl border px-4 font-mono text-sm font-semibold ${selectedIndex === index ? 'border-sky-400 bg-sky-400 text-slate-950' : 'border-white/15 text-slate-300'}`} data-testid={`depth-input-${index}`}>({input.x1}, {input.x2}) → {input.target}</button>)}</div></div>
          <Badge className="border-white/15 bg-white/5 text-slate-200" data-testid="depth-selected-result">prediction {trace.output} · target {trace.target}</Badge>
        </div>

        <div className="grid gap-px bg-white/10 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-stretch">
          <div className="bg-slate-950 p-5 md:p-7"><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Inputs</p><p className="mt-4 font-mono text-3xl">[{trace.x1}, {trace.x2}]</p><p className="mt-3 text-sm text-slate-400">The original coordinates make XOR non-linear.</p></div>
          <div className="hidden items-center bg-slate-950 px-2 text-slate-600 md:flex">→</div>
          <div className="bg-slate-950 p-5 md:p-7"><p className="text-xs uppercase tracking-[0.18em] text-sky-300">Hidden features</p><div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-xl bg-white/[0.04] p-3"><p className="text-xs text-slate-500">OR score</p><p className="mt-1 font-mono">{trace.x1}+{trace.x2}−0.5 = {trace.orScore}</p><p className="mt-2 text-2xl font-semibold text-sky-200">hOR = {trace.orFeature}</p></div><div className="rounded-xl bg-white/[0.04] p-3"><p className="text-xs text-slate-500">AND score</p><p className="mt-1 font-mono">{trace.x1}+{trace.x2}−1.5 = {trace.andScore}</p><p className="mt-2 text-2xl font-semibold text-sky-200">hAND = {trace.andFeature}</p></div></div></div>
          <div className="hidden items-center bg-slate-950 px-2 text-slate-600 md:flex">→</div>
          <div className="bg-slate-950 p-5 md:p-7"><p className="text-xs uppercase tracking-[0.18em] text-emerald-300">Output layer</p><p className="mt-4 font-mono text-sm leading-7">{trace.orFeature} − 2({trace.andFeature}) − 0.5 = {trace.outputScore}</p><p className="mt-3 text-4xl font-semibold text-emerald-300">XOR = {trace.output}</p></div>
        </div>

        <div className="border-t border-white/10 p-5 md:p-7"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Complete truth table</p><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[38rem] text-left text-sm" data-testid="depth-truth-table"><thead className="text-xs uppercase tracking-[0.15em] text-slate-500"><tr><th className="pb-3">x₁</th><th className="pb-3">x₂</th><th className="pb-3">target</th><th className="pb-3">hOR</th><th className="pb-3">hAND</th><th className="pb-3">output</th></tr></thead><tbody className="divide-y divide-white/10 font-mono text-slate-300">{table.map((row, index) => <tr key={index} onClick={() => setSelectedIndex(index)} className="cursor-pointer hover:bg-white/[0.03]"><td className="py-3">{row.x1}</td><td>{row.x2}</td><td>{row.target}</td><td>{row.orFeature}</td><td>{row.andFeature}</td><td className={row.output === row.target ? 'text-emerald-300' : 'text-red-300'}>{row.output}</td></tr>)}</tbody></table></div></div>
      </section>

      <section className="mt-6 grid gap-6 border-y border-stone-200 py-7 md:grid-cols-3"><div><Combine className="h-5 w-5 text-sky-700" /><h3 className="mt-3 font-semibold text-slate-950">Depth composes functions</h3><p className="mt-2 text-sm leading-6 text-slate-600">The second layer does not see raw x₁ and x₂. It receives features created by the first layer.</p></div><div><GitMerge className="h-5 w-5 text-sky-700" /><h3 className="mt-3 font-semibold text-slate-950">Representation changes geometry</h3><p className="mt-2 text-sm leading-6 text-slate-600">A problem that needs multiple boundaries in input space can become linearly separable in hidden space.</p></div><div><Layers3 className="h-5 w-5 text-sky-700" /><h3 className="mt-3 font-semibold text-slate-950">Real networks learn the features</h3><p className="mt-2 text-sm leading-6 text-slate-600">These hard steps and weights are handcrafted for inspection. Backpropagation normally learns differentiable features from data.</p></div></section>

      <div className="mt-6"><LearningCheckpoint id="depth-xor" question="For input (1, 1), what hidden features and XOR output should this network produce?" choices={[{ value: '110', label: 'hOR = 1, hAND = 1, output = 0' }, { value: '101', label: 'hOR = 1, hAND = 0, output = 1' }, { value: '001', label: 'hOR = 0, hAND = 0, output = 1' }]} correctValue="110" explanation="Both OR and AND activate for (1, 1). The output layer subtracts twice the AND feature, turning the final result back to zero—the defining exception in XOR." /></div>

      <section className="mt-6 flex justify-end"><Link to="/learn/convolution" className="group flex w-full max-w-xl items-center justify-between rounded-[2rem] bg-slate-950 p-5 text-white" data-testid="depth-convolution-link"><span><span className="block text-xs uppercase tracking-[0.18em] text-sky-300">Continue the neural track</span><span className="mt-1 block font-semibold">Compose learned spatial features</span></span><ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" /></Link></section>
    </div>
  );
}
