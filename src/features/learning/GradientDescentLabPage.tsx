import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calculator, Gauge, Play, RotateCcw, Sigma, StepForward } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { LabPageHeader } from './LabPageHeader';
import { LearningCheckpoint } from './LearningCheckpoint';
import {
  REGRESSION_INITIAL_STATE,
  REGRESSION_SAMPLES,
  gradientDescentStep,
  numericalRegressionGradient,
  regressionLoss,
  regressionTrace,
  runGradientDescent,
  type RegressionState,
} from './trainingMath';

const LEARNING_RATES = [
  { label: 'Slow · 0.05', value: 0.05 },
  { label: 'Useful · 0.20', value: 0.2 },
  { label: 'Unstable · 1.10', value: 1.1 },
];

function formatNumber(value: number, digits = 3) {
  const normalized = Math.abs(value) < 1e-10 ? 0 : value;
  return normalized.toFixed(digits);
}

function RegressionPlot({ state }: { state: RegressionState }) {
  const width = 520;
  const height = 320;
  const mapX = (x: number) => 54 + ((x + 1.5) / 3) * 420;
  const mapY = (y: number) => 272 - ((y + 4) / 8) * 224;
  const lineY = (x: number) => state.weight * x + state.bias;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label="Regression samples and current prediction line" data-testid="gradient-regression-plot">
      <defs><clipPath id="regression-plot"><rect x="54" y="48" width="420" height="224" rx="16" /></clipPath></defs>
      <rect x="54" y="48" width="420" height="224" rx="16" fill="#f5f5f4" />
      {[0, 1, 2, 3, 4].map((index) => <line key={`v-${index}`} x1={54 + index * 105} y1="48" x2={54 + index * 105} y2="272" stroke="#e7e5e4" />)}
      {[0, 1, 2, 3, 4].map((index) => <line key={`h-${index}`} x1="54" y1={48 + index * 56} x2="474" y2={48 + index * 56} stroke="#e7e5e4" />)}
      <g clipPath="url(#regression-plot)">
        <line x1={mapX(-1.5)} y1={mapY(lineY(-1.5))} x2={mapX(1.5)} y2={mapY(lineY(1.5))} stroke="#0284c7" strokeWidth="5" strokeLinecap="round" />
        {REGRESSION_SAMPLES.map((sample) => (
          <g key={sample.x}>
            <line x1={mapX(sample.x)} y1={mapY(sample.target)} x2={mapX(sample.x)} y2={mapY(lineY(sample.x))} stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 4" />
            <circle cx={mapX(sample.x)} cy={mapY(sample.target)} r="9" fill="#0f172a" stroke="white" strokeWidth="3" />
          </g>
        ))}
      </g>
      <text x="470" y="294" textAnchor="end" fontSize="12" fill="#64748b">input x</text>
      <text x="58" y="34" fontSize="12" fill="#64748b">target y</text>
      <text x="264" y="311" textAnchor="middle" fontSize="13" fontWeight="700" fill="#0369a1">ŷ = {formatNumber(state.weight, 2)}x + {formatNumber(state.bias, 2)}</text>
    </svg>
  );
}

function LossContour({ history, learningRate }: { history: RegressionState[]; learningRate: number }) {
  const columns = 24;
  const rows = 20;
  const width = 520;
  const height = 320;
  const left = 52;
  const top = 34;
  const plotWidth = 420;
  const plotHeight = 236;
  const mapWeight = (weight: number) => left + ((weight + 3) / 7) * plotWidth;
  const mapBias = (bias: number) => top + ((3 - bias) / 6) * plotHeight;
  const current = history[history.length - 1];
  const next = gradientDescentStep(REGRESSION_SAMPLES, current, learningRate);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label="Loss contour and gradient descent trajectory" data-testid="gradient-loss-contour">
      <rect x={left} y={top} width={plotWidth} height={plotHeight} rx="16" fill="#020617" />
      <g clipPath="url(#loss-contour-clip)">
        <defs><clipPath id="loss-contour-clip"><rect x={left} y={top} width={plotWidth} height={plotHeight} rx="16" /></clipPath></defs>
        {Array.from({ length: rows }, (_, row) => Array.from({ length: columns }, (_, column) => {
          const weight = -3 + ((column + 0.5) / columns) * 7;
          const bias = 3 - ((row + 0.5) / rows) * 6;
          const loss = regressionLoss(REGRESSION_SAMPLES, { weight, bias });
          const alpha = 0.08 + (1 - Math.min(loss / 30, 1)) * 0.82;
          return <rect key={`${row}-${column}`} x={left + column * (plotWidth / columns)} y={top + row * (plotHeight / rows)} width={(plotWidth / columns) + 0.5} height={(plotHeight / rows) + 0.5} fill={`rgba(56, 189, 248, ${alpha})`} />;
        }))}
        {history.slice(1).map((point, index) => {
          const previous = history[index];
          return <line key={index} x1={mapWeight(previous.weight)} y1={mapBias(previous.bias)} x2={mapWeight(point.weight)} y2={mapBias(point.bias)} stroke="#f8fafc" strokeWidth="2" strokeOpacity="0.72" />;
        })}
        <line x1={mapWeight(current.weight)} y1={mapBias(current.bias)} x2={mapWeight(next.weight)} y2={mapBias(next.bias)} stroke="#fbbf24" strokeWidth="3" strokeDasharray="5 4" />
        {history.map((point, index) => <circle key={`point-${index}`} cx={mapWeight(point.weight)} cy={mapBias(point.bias)} r={index === history.length - 1 ? 6 : 3} fill={index === history.length - 1 ? '#fbbf24' : '#f8fafc'} />)}
      </g>
      <text x="472" y="296" textAnchor="end" fontSize="12" fill="#64748b">weight w</text>
      <text x="54" y="22" fontSize="12" fill="#64748b">bias b</text>
      <text x="264" y="314" textAnchor="middle" fontSize="11" fill="#94a3b8">bright = lower loss · dashed = next update</text>
    </svg>
  );
}

export function GradientDescentLabPage() {
  const [history, setHistory] = useState<RegressionState[]>([{ ...REGRESSION_INITIAL_STATE }]);
  const [learningRate, setLearningRate] = useState(0.2);
  const current = history[history.length - 1];
  const trace = useMemo(() => regressionTrace(REGRESSION_SAMPLES, current), [current]);
  const numerical = useMemo(() => numericalRegressionGradient(REGRESSION_SAMPLES, current), [current]);
  const initialLoss = regressionLoss(REGRESSION_SAMPLES, REGRESSION_INITIAL_STATE);
  const trend = trace.loss < initialLoss ? 'Loss below start' : history.length === 1 ? 'Ready to descend' : 'Loss above start';

  const step = () => setHistory((states) => [
    ...states,
    gradientDescentStep(REGRESSION_SAMPLES, states[states.length - 1], learningRate),
  ]);

  const runTen = () => setHistory((states) => [
    ...states,
    ...runGradientDescent(REGRESSION_SAMPLES, states[states.length - 1], learningRate, 10).slice(1),
  ]);

  const reset = () => setHistory([{ ...REGRESSION_INITIAL_STATE }]);

  return (
    <div data-testid="gradient-descent-lab-page">
      <LabPageHeader
        eyebrow="Learning foundations · step 2"
        title="Walk downhill on a real loss surface"
        description="Fit a two-parameter line by following the exact mean-squared-error gradient. Compare analytic derivatives, numerical checks, and learning-rate behavior."
        aside={`Step ${history.length - 1}`}
      />

      <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white/85">
        <div className="grid gap-5 border-b border-stone-200 p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end md:p-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Learning rate</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {LEARNING_RATES.map((preset) => (
                <button key={preset.value} type="button" onClick={() => { setLearningRate(preset.value); reset(); }} aria-pressed={learningRate === preset.value} className={`min-h-11 rounded-full px-4 text-sm font-semibold transition ${learningRate === preset.value ? 'bg-slate-950 text-white' : 'bg-stone-100 text-slate-600 hover:bg-stone-200'}`} data-testid={`gradient-rate-${preset.value}`}>
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={reset} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-stone-200 px-4 text-sm font-semibold text-slate-700" data-testid="gradient-reset"><RotateCcw className="h-4 w-4" /> Reset</button>
            <button type="button" onClick={step} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white" data-testid="gradient-step"><StepForward className="h-4 w-4" /> One step</button>
            <button type="button" onClick={runTen} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-sky-600 px-5 text-sm font-semibold text-white" data-testid="gradient-run-ten"><Play className="h-4 w-4" /> Run 10</button>
          </div>
        </div>

        <div className="grid xl:grid-cols-2">
          <div className="border-b border-stone-200 p-5 xl:border-b-0 xl:border-r md:p-7">
            <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Model space</p><h2 className="mt-1 text-xl font-semibold text-slate-950">Three samples and one line</h2></div><Badge variant="outline">y = 2x - 1</Badge></div>
            <RegressionPlot state={current} />
          </div>
          <div className="p-5 md:p-7">
            <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Parameter space</p><h2 className="mt-1 text-xl font-semibold text-slate-950">Loss over w and b</h2></div><Badge variant={trace.loss < initialLoss ? 'success' : history.length > 1 ? 'warning' : 'outline'}>{trend}</Badge></div>
            <LossContour history={history} learningRate={learningRate} />
          </div>
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-[2rem] bg-slate-950 text-white" data-testid="gradient-calculation">
        <div className="grid gap-5 border-b border-white/10 p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end md:p-7">
          <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Exact batch calculation</p><h2 className="mt-2 text-2xl font-semibold">Prediction → residual → loss → gradient</h2></div>
          <div className="flex gap-5 text-right"><div><p className="text-xs text-slate-500">MSE loss</p><p className="mt-1 text-3xl font-semibold tabular-nums" data-testid="gradient-loss">{formatNumber(trace.loss)}</p></div><div><p className="text-xs text-slate-500">Parameters</p><p className="mt-1 font-mono text-lg text-sky-200" data-testid="gradient-parameters">w {formatNumber(current.weight)} · b {formatNumber(current.bias)}</p></div></div>
        </div>

        <div className="overflow-x-auto p-5 md:p-7">
          <table className="w-full min-w-[46rem] text-left text-sm" data-testid="gradient-trace-table">
            <thead className="text-xs uppercase tracking-[0.15em] text-slate-500"><tr><th className="pb-3">x</th><th className="pb-3">target</th><th className="pb-3">prediction</th><th className="pb-3">residual</th><th className="pb-3">residual²</th><th className="pb-3">2·residual·x</th><th className="pb-3">2·residual</th></tr></thead>
            <tbody className="divide-y divide-white/10 font-mono text-slate-300">{trace.rows.map((row) => <tr key={row.x}><td className="py-3">{row.x}</td><td>{row.target}</td><td>{formatNumber(row.prediction)}</td><td>{formatNumber(row.residual)}</td><td>{formatNumber(row.squaredError)}</td><td>{formatNumber(row.weightGradientContribution)}</td><td>{formatNumber(row.biasGradientContribution)}</td></tr>)}</tbody>
          </table>
        </div>

        <div className="grid gap-px border-t border-white/10 bg-white/10 md:grid-cols-3">
          <div className="bg-slate-950 p-5 md:p-7"><Sigma className="h-5 w-5 text-sky-300" /><p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-500">Analytic gradient</p><p className="mt-2 font-mono text-lg" data-testid="gradient-analytic">[dw {formatNumber(trace.gradient.weight)}, db {formatNumber(trace.gradient.bias)}]</p></div>
          <div className="bg-slate-950 p-5 md:p-7"><Calculator className="h-5 w-5 text-sky-300" /><p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-500">Finite-difference check</p><p className="mt-2 font-mono text-lg" data-testid="gradient-numerical">[dw {formatNumber(numerical.weight)}, db {formatNumber(numerical.bias)}]</p></div>
          <div className="bg-slate-950 p-5 md:p-7"><Gauge className="h-5 w-5 text-sky-300" /><p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-500">Update rule</p><p className="mt-2 font-mono text-sm leading-7 text-slate-200">θnew = θ − {learningRate.toFixed(2)}∇L</p></div>
        </div>
      </section>

      <section className="mt-6 border-y border-stone-200 py-6" role="note">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Important limitation</p>
        <p className="mt-2 max-w-4xl text-sm leading-7 text-slate-600">This convex two-parameter surface is deliberately inspectable. A large model has millions or billions of parameter directions; a two-dimensional picture can be a useful slice, but never the full geometry.</p>
      </section>

      <div className="mt-6"><LearningCheckpoint id="gradient-direction" question="The current weight gradient is negative. Which direction should gradient descent move the weight?" choices={[{ value: 'down', label: 'Toward a smaller weight' }, { value: 'up', label: 'Toward a larger weight' }, { value: 'none', label: 'Do not change it' }]} correctValue="up" explanation="The update subtracts the gradient. Subtracting a negative weight gradient increases the weight and moves it toward the optimum at w = 2." /></div>

      <section className="mt-6 flex justify-end">
        <Link to="/learn/backpropagation" className="group flex w-full max-w-xl items-center justify-between rounded-[2rem] bg-slate-950 p-5 text-white" data-testid="gradient-backprop-link"><span><span className="block text-xs uppercase tracking-[0.18em] text-sky-300">Next practical</span><span className="mt-1 block font-semibold">Send the gradient through a network</span></span><ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" /></Link>
      </section>
    </div>
  );
}
