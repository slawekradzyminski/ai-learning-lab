import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, GitBranch, RotateCcw, Sigma, StepForward } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { LabPageHeader } from './LabPageHeader';
import { LearningCheckpoint } from './LearningCheckpoint';
import {
  BACKPROP_PRESETS,
  backpropagate,
  backpropagationStep,
  numericalBackpropGradient,
  type BackpropConfig,
} from './trainingMath';

type BackpropStage = 'forward' | 'loss' | 'backward' | 'update';
type BackpropPreset = keyof typeof BACKPROP_PRESETS;

const STAGES: Array<{ id: BackpropStage; number: string; label: string }> = [
  { id: 'forward', number: '01', label: 'Forward values' },
  { id: 'loss', number: '02', label: 'Measure loss' },
  { id: 'backward', number: '03', label: 'Send credit back' },
  { id: 'update', number: '04', label: 'Update parameters' },
];

function formatNumber(value: number, digits = 4) {
  const normalized = Math.abs(value) < 1e-10 ? 0 : value;
  return normalized.toFixed(digits);
}

function FlowArrow() {
  return <span className="mx-1 text-xl text-slate-600" aria-hidden="true">→</span>;
}

export function BackpropagationLabPage() {
  const [preset, setPreset] = useState<BackpropPreset>('active');
  const [config, setConfig] = useState<BackpropConfig>({ ...BACKPROP_PRESETS.active });
  const [stage, setStage] = useState<BackpropStage>('forward');
  const [selectedNode, setSelectedNode] = useState('hidden');
  const [learningRate, setLearningRate] = useState(0.2);
  const [previousLoss, setPreviousLoss] = useState<number | null>(null);
  const trace = useMemo(() => backpropagate(config), [config]);
  const updated = useMemo(() => backpropagationStep(config, learningRate), [config, learningRate]);

  const choosePreset = (next: BackpropPreset) => {
    setPreset(next);
    setConfig({ ...BACKPROP_PRESETS[next] });
    setStage('forward');
    setSelectedNode('hidden');
    setPreviousLoss(null);
  };

  const update = () => {
    setPreviousLoss(trace.forward.loss);
    setConfig(updated);
    setStage('update');
  };

  const nodes = [
    { id: 'x', label: 'input x', value: trace.forward.x, formula: 'given input' },
    { id: 'z1', label: 'z₁', value: trace.forward.z1, formula: 'w₁x + b₁' },
    { id: 'hidden', label: 'hidden h', value: trace.forward.hidden, formula: 'ReLU(z₁)' },
    { id: 'z2', label: 'z₂', value: trace.forward.z2, formula: 'w₂h + b₂' },
    { id: 'prediction', label: 'prediction p', value: trace.forward.prediction, formula: 'sigmoid(z₂)' },
    { id: 'loss', label: 'loss L', value: trace.forward.loss, formula: 'BCE(p, target)' },
  ];

  const selectedCopy: Record<string, { title: string; forward: string; backward: string }> = {
    x: { title: 'Input', forward: `x = ${formatNumber(config.x)}`, backward: 'The input is data, not a trainable parameter in this example.' },
    z1: { title: 'First pre-activation', forward: `${formatNumber(config.weight1)} × ${formatNumber(config.x)} + ${formatNumber(config.bias1)} = ${formatNumber(trace.forward.z1)}`, backward: `dL/dz₁ = dL/dh × ReLU′(z₁) = ${formatNumber(trace.backward.dLossDz1)}` },
    hidden: { title: 'ReLU activation', forward: `max(0, ${formatNumber(trace.forward.z1)}) = ${formatNumber(trace.forward.hidden)}`, backward: `ReLU′(z₁) = ${trace.backward.reluDerivative}; upstream dL/dh = ${formatNumber(trace.backward.dLossDHidden)}` },
    z2: { title: 'Output pre-activation', forward: `${formatNumber(config.weight2)} × ${formatNumber(trace.forward.hidden)} + ${formatNumber(config.bias2)} = ${formatNumber(trace.forward.z2)}`, backward: `sigmoid + BCE simplifies to dL/dz₂ = p − y = ${formatNumber(trace.backward.dLossDz2)}` },
    prediction: { title: 'Predicted probability', forward: `sigmoid(${formatNumber(trace.forward.z2)}) = ${formatNumber(trace.forward.prediction)}`, backward: 'Binary cross-entropy penalizes confident wrong probabilities most strongly.' },
    loss: { title: 'Scalar loss', forward: `BCE(${formatNumber(trace.forward.prediction)}, ${config.target}) = ${formatNumber(trace.forward.loss)}`, backward: 'Backpropagation starts with one scalar objective and distributes credit through local derivatives.' },
  };

  const selected = selectedCopy[selectedNode];
  const parameterRows = [
    { label: 'w₁', value: config.weight1, gradient: trace.backward.dLossDWeight1, next: updated.weight1, field: 'weight1' as const },
    { label: 'b₁', value: config.bias1, gradient: trace.backward.dLossDBias1, next: updated.bias1, field: 'bias1' as const },
    { label: 'w₂', value: config.weight2, gradient: trace.backward.dLossDWeight2, next: updated.weight2, field: 'weight2' as const },
    { label: 'b₂', value: config.bias2, gradient: trace.backward.dLossDBias2, next: updated.bias2, field: 'bias2' as const },
  ];

  return (
    <div data-testid="backpropagation-lab-page">
      <LabPageHeader
        eyebrow="Learning foundations · step 3"
        title="Send one error backward through a network"
        description="Trace a complete forward pass, then apply the chain rule locally until every parameter receives its share of the learning signal."
        aside="One hidden ReLU neuron"
      />

      <section className="overflow-hidden rounded-[2rem] bg-slate-950 text-white" data-testid="backprop-workspace">
        <div className="grid gap-5 border-b border-white/10 p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end md:p-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Gradient-flow preset</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => choosePreset('active')} aria-pressed={preset === 'active'} className={`min-h-11 rounded-full px-4 text-sm font-semibold ${preset === 'active' ? 'bg-sky-400 text-slate-950' : 'border border-white/15 text-slate-300'}`} data-testid="backprop-preset-active">Active ReLU</button>
              <button type="button" onClick={() => choosePreset('inactive')} aria-pressed={preset === 'inactive'} className={`min-h-11 rounded-full px-4 text-sm font-semibold ${preset === 'inactive' ? 'bg-sky-400 text-slate-950' : 'border border-white/15 text-slate-300'}`} data-testid="backprop-preset-inactive">Inactive ReLU</button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-4 text-sm text-slate-300">η <input type="number" min="0.01" max="1" step="0.05" value={learningRate} onChange={(event) => setLearningRate(Number(event.target.value) || 0.01)} className="w-16 bg-transparent font-mono text-white outline-none" data-testid="backprop-learning-rate" /></label>
            <button type="button" onClick={() => choosePreset(preset)} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-4 text-sm font-semibold text-slate-300" data-testid="backprop-reset"><RotateCcw className="h-4 w-4" /> Reset</button>
            <button type="button" onClick={update} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-sky-400 px-5 text-sm font-semibold text-slate-950" data-testid="backprop-update"><StepForward className="h-4 w-4" /> Apply update</button>
          </div>
        </div>

        <nav className="overflow-x-auto border-b border-white/10 px-3 py-3" aria-label="Backpropagation stages">
          <div className="flex min-w-max gap-1">{STAGES.map((candidate) => <button key={candidate.id} type="button" onClick={() => setStage(candidate.id)} aria-pressed={stage === candidate.id} className={`rounded-xl px-4 py-3 text-left ${stage === candidate.id ? 'bg-white text-slate-950' : 'text-slate-400 hover:bg-white/[0.06]'}`} data-testid={`backprop-stage-${candidate.id}`}><span className="block text-[0.6rem] font-semibold uppercase tracking-[0.17em] opacity-55">{candidate.number}</span><span className="mt-1 block text-sm font-semibold">{candidate.label}</span></button>)}</div>
        </nav>

        <div className="border-b border-white/10 p-5 md:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Computation graph · click a node</p>
          <div className="mt-6 overflow-x-auto pb-2">
            <div className="flex min-w-[58rem] items-center justify-between" data-testid="backprop-graph">
              {nodes.map((node, index) => (
                <div key={node.id} className="contents">
                  <button type="button" onClick={() => setSelectedNode(node.id)} aria-pressed={selectedNode === node.id} className={`w-32 rounded-2xl border p-4 text-left transition ${selectedNode === node.id ? 'border-sky-400 bg-sky-400/15' : 'border-white/10 bg-white/[0.035] hover:border-white/30'}`} data-testid={`backprop-node-${node.id}`}>
                    <span className="text-[0.62rem] font-semibold uppercase tracking-[0.15em] text-slate-500">{node.label}</span>
                    <span className="mt-2 block font-mono text-xl font-semibold text-white">{formatNumber(node.value)}</span>
                    <span className="mt-2 block text-[0.65rem] text-slate-500">{node.formula}</span>
                  </button>
                  {index < nodes.length - 1 ? <FlowArrow /> : null}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
          <aside className="border-b border-white/10 p-5 lg:border-b-0 lg:border-r md:p-7" data-testid="backprop-node-inspector">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Selected node</p>
            <h2 className="mt-2 text-xl font-semibold">{selected.title}</h2>
            <div className="mt-5 border-l-2 border-sky-400 pl-4"><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Forward</p><p className="mt-2 font-mono text-sm leading-6 text-slate-200">{selected.forward}</p></div>
            <div className="mt-5 border-l-2 border-amber-400 pl-4"><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Backward</p><p className="mt-2 font-mono text-sm leading-6 text-slate-200">{selected.backward}</p></div>
            {preset === 'inactive' ? <Badge variant="warning" className="mt-5" data-testid="backprop-zero-gradient">ReLU blocks the first-layer gradient</Badge> : null}
          </aside>

          <div className="p-5 md:p-7">
            {stage === 'forward' ? <div data-testid="backprop-forward-panel"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Forward pass</p><h2 className="mt-2 text-2xl font-semibold">Data becomes a prediction</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">Parameters transform the input into intermediate activations. Nothing learns yet; this pass only computes values.</p><p className="mt-7 font-mono text-3xl text-white">p = {formatNumber(trace.forward.prediction)}</p></div> : null}
            {stage === 'loss' ? <div data-testid="backprop-loss-panel"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Scalar objective</p><h2 className="mt-2 text-2xl font-semibold">Compare prediction {formatNumber(trace.forward.prediction)} with target {config.target}</h2><p className="mt-6 font-mono text-4xl text-white">L = {formatNumber(trace.forward.loss)}</p><p className="mt-3 text-sm text-slate-400">One scalar loss becomes the starting point for every gradient.</p></div> : null}
            {stage === 'backward' ? <div data-testid="backprop-backward-panel"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">Backward pass</p><h2 className="mt-2 text-2xl font-semibold">Local derivatives distribute credit</h2><div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-white/[0.04] p-4 font-mono text-sm">dL/dz₂ = p − y<br /><strong className="text-amber-200">{formatNumber(trace.backward.dLossDz2)}</strong></div><div className="rounded-xl bg-white/[0.04] p-4 font-mono text-sm">dL/dh = dL/dz₂ × w₂<br /><strong className="text-amber-200">{formatNumber(trace.backward.dLossDHidden)}</strong></div><div className="rounded-xl bg-white/[0.04] p-4 font-mono text-sm">ReLU′(z₁)<br /><strong className="text-amber-200">{trace.backward.reluDerivative}</strong></div><div className="rounded-xl bg-white/[0.04] p-4 font-mono text-sm">dL/dz₁<br /><strong className="text-amber-200">{formatNumber(trace.backward.dLossDz1)}</strong></div></div></div> : null}
            {stage === 'update' ? <div data-testid="backprop-update-panel"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Parameter update</p><h2 className="mt-2 text-2xl font-semibold">Subtract each gradient</h2><div className="mt-5 flex items-end gap-7"><div><p className="text-xs text-slate-500">Loss before</p><p className="mt-1 text-3xl font-semibold">{formatNumber(previousLoss ?? trace.forward.loss)}</p></div><ArrowRight className="mb-2 h-5 w-5 text-slate-500" /><div><p className="text-xs text-slate-500">Loss after</p><p className="mt-1 text-3xl font-semibold text-emerald-300" data-testid="backprop-loss-after">{formatNumber(trace.forward.loss)}</p></div></div></div> : null}
          </div>
        </div>

        <div className="border-t border-white/10 p-5 md:p-7">
          <div className="flex items-center gap-3"><Sigma className="h-5 w-5 text-sky-300" /><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Parameter gradients</p><p className="mt-1 text-sm text-slate-400">Analytic backpropagation and central finite differences should agree.</p></div></div>
          <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[42rem] text-left text-sm" data-testid="backprop-gradient-table"><thead className="text-xs uppercase tracking-[0.15em] text-slate-500"><tr><th className="pb-3">parameter</th><th className="pb-3">current</th><th className="pb-3">analytic gradient</th><th className="pb-3">numeric check</th><th className="pb-3">next value</th></tr></thead><tbody className="divide-y divide-white/10 font-mono text-slate-300">{parameterRows.map((row) => <tr key={row.label}><td className="py-3 text-white">{row.label}</td><td>{formatNumber(row.value)}</td><td>{formatNumber(row.gradient)}</td><td>{formatNumber(numericalBackpropGradient(config, row.field))}</td><td className="text-sky-200">{formatNumber(row.next)}</td></tr>)}</tbody></table></div>
        </div>
      </section>

      <section className="mt-6 border-y border-stone-200 py-6"><div className="flex items-start gap-3"><GitBranch className="mt-1 h-5 w-5 shrink-0 text-sky-700" /><div><p className="text-sm font-semibold text-slate-950">Backpropagation is organized bookkeeping</p><p className="mt-2 max-w-4xl text-sm leading-7 text-slate-600">Each operation needs only its local derivative and the gradient arriving from downstream. The chain rule composes those small facts into parameter gradients across an entire network.</p></div></div></section>

      <div className="mt-6"><LearningCheckpoint id="backprop-relu" question="When z₁ is negative and ReLU outputs zero, which gradients become zero in this example?" choices={[{ value: 'first', label: 'The first-layer w₁ and b₁ gradients' }, { value: 'all', label: 'Every gradient in the network' }, { value: 'none', label: 'No gradients change' }]} correctValue="first" explanation="ReLU′(z₁) is zero, so the chain to w₁ and b₁ stops. The output bias b₂ still receives a gradient because it sits after the inactive hidden unit." /></div>

      <section className="mt-6 flex justify-end"><Link to="/learn/depth" className="group flex w-full max-w-xl items-center justify-between rounded-[2rem] bg-slate-950 p-5 text-white" data-testid="backprop-depth-link"><span><span className="block text-xs uppercase tracking-[0.18em] text-sky-300">Next practical</span><span className="mt-1 block font-semibold">Use a hidden layer to solve XOR</span></span><ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" /></Link></section>
    </div>
  );
}
