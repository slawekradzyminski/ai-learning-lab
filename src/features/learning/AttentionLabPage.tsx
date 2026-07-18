import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Binary,
  Calculator,
  Eye,
  EyeOff,
  Layers3,
  Link2,
  Network,
  Scale,
  Sigma,
  Sparkles,
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { LabPageHeader } from './LabPageHeader';
import { LearningCheckpoint } from './LearningCheckpoint';
import {
  ATTENTION_EXAMPLES,
  attentionContributions,
  buildAttentionTrace,
  dominantAttentionIndex,
  type AttentionExample,
  type NumericMatrix,
} from './attentionMath';

type AttentionStage = 'representations' | 'projections' | 'scores' | 'mask' | 'softmax' | 'output';

const STAGES: Array<{
  id: AttentionStage;
  number: string;
  label: string;
  formula: string;
  insight: string;
}> = [
  {
    id: 'representations',
    number: '01',
    label: 'Represent',
    formula: 'X = E + P',
    insight: 'Each row combines token information with a position signal. These are tiny teaching vectors, not Bonsai activations.',
  },
  {
    id: 'projections',
    number: '02',
    label: 'Project Q/K/V',
    formula: 'Q = XWQ · K = XWK · V = XWV',
    insight: 'Learned projections let one representation ask a question, advertise a match, and carry information.',
  },
  {
    id: 'scores',
    number: '03',
    label: 'Compare',
    formula: 'S = QKᵀ / √dₖ',
    insight: 'A larger query-key dot product means stronger alignment. Scaling keeps large vector dimensions from making softmax too sharp.',
  },
  {
    id: 'mask',
    number: '04',
    label: 'Mask future',
    formula: 'Sᶜᵃᵘˢᵃˡᵢⱼ = −∞ when j > i',
    insight: 'During causal generation, a position may use itself and earlier positions, but never tokens that come later.',
  },
  {
    id: 'softmax',
    number: '05',
    label: 'Normalize',
    formula: 'A = softmax(Sᶜᵃᵘˢᵃˡ)',
    insight: 'Softmax turns scores into positive weights that sum to one across every output row.',
  },
  {
    id: 'output',
    number: '06',
    label: 'Gather values',
    formula: 'O = AV',
    insight: 'Attention weights decide how much of every value vector contributes to the new representation at this position.',
  },
];

function formatNumber(value: number, digits = 2) {
  const normalized = Math.abs(value) < 1e-10 ? 0 : value;
  return normalized.toFixed(digits);
}

function formatVector(vector: number[], digits = 2) {
  return `[${vector.map((value) => formatNumber(value, digits)).join(', ')}]`;
}

function VectorChip({ label, vector, accent = false }: { label: string; vector: number[]; accent?: boolean }) {
  return (
    <div className={`rounded-xl border px-3 py-2 ${accent ? 'border-sky-400/40 bg-sky-400/10' : 'border-white/10 bg-white/[0.04]'}`}>
      <p className="text-[0.62rem] font-semibold uppercase tracking-[0.17em] text-slate-500">{label}</p>
      <p className={`mt-1 font-mono text-sm ${accent ? 'text-sky-200' : 'text-slate-200'}`}>{formatVector(vector)}</p>
    </div>
  );
}

function MatrixTable({
  matrix,
  rowLabels,
  columnLabels,
  selectedRow,
  testId,
}: {
  matrix: NumericMatrix;
  rowLabels: string[];
  columnLabels: string[];
  selectedRow?: number;
  testId?: string;
}) {
  return (
    <div className="overflow-x-auto" data-testid={testId}>
      <div className="grid min-w-max gap-1" style={{ gridTemplateColumns: `5rem repeat(${columnLabels.length}, 4.5rem)` }}>
        <span />
        {columnLabels.map((label) => <span key={label} className="py-1 text-center text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</span>)}
        {matrix.flatMap((row, rowIndex) => [
          <span key={`row-${rowIndex}`} className={`flex items-center pr-2 text-xs font-semibold ${selectedRow === rowIndex ? 'text-sky-300' : 'text-slate-400'}`}>{rowLabels[rowIndex]}</span>,
          ...row.map((value, columnIndex) => (
            <span key={`${rowIndex}-${columnIndex}`} className={`rounded-lg border px-2 py-2 text-center font-mono text-xs tabular-nums ${selectedRow === rowIndex ? 'border-sky-400/35 bg-sky-400/10 text-sky-100' : 'border-white/10 bg-white/[0.035] text-slate-300'}`}>
              {formatNumber(value)}
            </span>
          )),
        ])}
      </div>
    </div>
  );
}

function StageWorkspace({
  stage,
  example,
  selectedIndex,
  causal,
}: {
  stage: AttentionStage;
  example: AttentionExample;
  selectedIndex: number;
  causal: boolean;
}) {
  const trace = useMemo(() => buildAttentionTrace(example), [example]);
  const weights = causal ? trace.attentionWeights : trace.unmaskedAttentionWeights;
  const output = causal ? trace.outputs[selectedIndex] : trace.unmaskedOutputs[selectedIndex];
  const contributions = attentionContributions(trace, selectedIndex, causal);
  const availableScores = trace.scaledScores[selectedIndex];
  const maximumWeight = Math.max(...weights[selectedIndex], 0.0001);

  if (stage === 'representations') {
    return (
      <div data-testid="attention-stage-representations">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Token signal + position signal</p>
        <div className="mt-5 space-y-2">
          {example.tokens.map((token, index) => (
            <div key={token} className={`grid gap-2 rounded-2xl border p-3 transition sm:grid-cols-[5rem_1fr_auto_1fr_auto_1fr] sm:items-center ${selectedIndex === index ? 'border-sky-400/40 bg-sky-400/10' : 'border-white/10 bg-white/[0.025]'}`}>
              <span className="font-mono text-sm font-semibold text-white">{token}</span>
              <VectorChip label="token E" vector={example.tokenEmbeddings[index]} />
              <span className="hidden text-slate-600 sm:block">+</span>
              <VectorChip label="position P" vector={example.positionEmbeddings[index]} />
              <span className="hidden text-slate-600 sm:block">=</span>
              <VectorChip label="representation X" vector={trace.representations[index]} accent />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (stage === 'projections') {
    return (
      <div data-testid="attention-stage-projections">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Three learned views of the same rows</p>
        <div className="mt-5 grid gap-5 xl:grid-cols-3">
          <div>
            <p className="mb-2 text-sm font-semibold text-white">Queries · what am I looking for?</p>
            <MatrixTable matrix={example.wQuery} rowLabels={['x₁', 'x₂']} columnLabels={['q₁', 'q₂']} />
            <p className="my-3 text-center font-mono text-xs text-slate-500">X × WQ ↓</p>
            <MatrixTable matrix={trace.queries} rowLabels={example.tokens} columnLabels={['q₁', 'q₂']} selectedRow={selectedIndex} />
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-white">Keys · what do I match?</p>
            <MatrixTable matrix={example.wKey} rowLabels={['x₁', 'x₂']} columnLabels={['k₁', 'k₂']} />
            <p className="my-3 text-center font-mono text-xs text-slate-500">X × WK ↓</p>
            <MatrixTable matrix={trace.keys} rowLabels={example.tokens} columnLabels={['k₁', 'k₂']} selectedRow={selectedIndex} />
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-white">Values · what can I contribute?</p>
            <MatrixTable matrix={example.wValue} rowLabels={['x₁', 'x₂']} columnLabels={['v₁', 'v₂']} />
            <p className="my-3 text-center font-mono text-xs text-slate-500">X × WV ↓</p>
            <MatrixTable matrix={trace.values} rowLabels={example.tokens} columnLabels={['v₁', 'v₂']} selectedRow={selectedIndex} />
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'scores' || stage === 'mask') {
    return (
      <div data-testid={`attention-stage-${stage}`}>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Query from “{example.tokens[selectedIndex]}” compared with every key</p>
        <div className="mt-5 space-y-3">
          {example.tokens.map((token, index) => {
            const blocked = stage === 'mask' && causal && index > selectedIndex;
            const score = availableScores[index];
            return (
              <div key={token} className={`grid grid-cols-[5rem_minmax(0,1fr)_6rem] items-center gap-3 rounded-xl border px-3 py-3 ${blocked ? 'border-red-400/20 bg-red-400/[0.06]' : 'border-white/10 bg-white/[0.025]'}`}>
                <span className="font-mono text-sm font-semibold text-white">{token}</span>
                <div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div className={`h-full rounded-full ${blocked ? 'w-full bg-red-400/25' : 'bg-sky-400'}`} style={blocked ? undefined : { width: `${Math.max(4, Math.min(100, (Math.abs(score) / 1.6) * 100))}%` }} />
                  </div>
                  {!blocked ? <p className="mt-2 font-mono text-[0.65rem] leading-5 text-slate-500">{formatVector(trace.queries[selectedIndex])} · {formatVector(trace.keys[index])} / √{trace.keyDimension}</p> : null}
                </div>
                <span className={`text-right font-mono text-sm ${blocked ? 'text-red-300' : 'text-slate-200'}`}>{blocked ? 'blocked' : formatNumber(score, 3)}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (stage === 'softmax') {
    return (
      <div data-testid="attention-stage-softmax">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Normalized attention from “{example.tokens[selectedIndex]}”</p>
        <div className="mt-5 space-y-4">
          {example.tokens.map((token, index) => (
            <div key={token}>
              <div className="mb-1.5 flex items-end justify-between gap-4">
                <span className="font-mono text-sm font-semibold text-white">{token}</span>
                <span className="font-mono text-sm tabular-nums text-sky-200">{(weights[selectedIndex][index] * 100).toFixed(1)}%</span>
              </div>
              <div className="h-4 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-sky-400 transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${(weights[selectedIndex][index] / maximumWeight) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-5 font-mono text-xs text-slate-400">row sum = {formatNumber(weights[selectedIndex].reduce((sum, value) => sum + value, 0), 6)}</p>
      </div>
    );
  }

  return (
    <div data-testid="attention-stage-output">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Each attention weight scales one value vector</p>
      <div className="mt-5 grid gap-2 md:grid-cols-2">
        {contributions.map((contribution, index) => (
          <div key={example.tokens[index]} className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-sm font-semibold text-white">{example.tokens[index]}</span>
              <span className="text-xs text-sky-200">a = {formatNumber(contribution.weight, 3)}</span>
            </div>
            <p className="mt-3 font-mono text-xs leading-6 text-slate-400">
              {formatNumber(contribution.weight, 3)} × {formatVector(contribution.value)} = <span className="text-slate-200">{formatVector(contribution.weightedValue)}</span>
            </p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-sky-400/30 bg-sky-400/10 p-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm font-semibold text-white">New attention output for “{example.tokens[selectedIndex]}”</span>
        <span className="font-mono text-xl font-semibold text-sky-200">{formatVector(output)}</span>
      </div>
    </div>
  );
}

export function AttentionLabPage() {
  const [exampleId, setExampleId] = useState<AttentionExample['id']>('subject');
  const [selectedIndex, setSelectedIndex] = useState(3);
  const [stage, setStage] = useState<AttentionStage>('representations');
  const [causal, setCausal] = useState(true);
  const example = ATTENTION_EXAMPLES.find((candidate) => candidate.id === exampleId) ?? ATTENTION_EXAMPLES[0];
  const trace = useMemo(() => buildAttentionTrace(example), [example]);
  const weights = causal ? trace.attentionWeights : trace.unmaskedAttentionWeights;
  const dominantIndex = dominantAttentionIndex(trace, selectedIndex, causal);
  const stageCopy = STAGES.find((candidate) => candidate.id === stage) ?? STAGES[0];

  const chooseExample = (nextId: AttentionExample['id']) => {
    setExampleId(nextId);
    setSelectedIndex(3);
    setStage('representations');
    setCausal(true);
  };

  return (
    <div data-testid="attention-lab-page">
      <LabPageHeader
        eyebrow="Language model inference · step 2"
        title="Watch one token gather context"
        description="Follow one inspectable attention head through representations, Q/K/V projections, scaled scores, causal masking, softmax, and a value-weighted output."
        aside="Guided 2D attention head"
      />

      <div className="mb-6 flex items-start gap-3 rounded-[1.5rem] border border-amber-200 bg-amber-50/85 p-4 text-amber-950" role="status" data-testid="attention-provenance">
        <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div>
          <p className="text-sm font-semibold">Exact teaching calculation—not captured Bonsai internals</p>
          <p className="mt-1 text-sm leading-6 text-amber-900/80">Every displayed value comes from the small matrices below. Ollama does not expose Bonsai’s internal attention activations, so the lab never invents a live model trace.</p>
        </div>
      </div>

      <section className="overflow-hidden rounded-[2rem] bg-slate-950 text-white" data-testid="attention-workspace">
        <div className="grid gap-5 border-b border-white/10 px-5 py-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end md:px-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Inspectable head preset</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {ATTENTION_EXAMPLES.map((candidate) => (
                <button
                  key={candidate.id}
                  type="button"
                  onClick={() => chooseExample(candidate.id)}
                  aria-pressed={exampleId === candidate.id}
                  className={`min-h-11 rounded-full px-4 text-sm font-semibold transition ${exampleId === candidate.id ? 'bg-sky-400 text-slate-950' : 'border border-white/15 text-slate-300 hover:border-sky-400 hover:text-white'}`}
                  data-testid={`attention-example-${candidate.id}`}
                >
                  {candidate.label}
                </button>
              ))}
            </div>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400" data-testid="attention-example-description">{example.description}</p>
          </div>

          <button
            type="button"
            onClick={() => setCausal((current) => !current)}
            aria-pressed={causal}
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-4 text-sm font-semibold transition ${causal ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200' : 'border-red-400/35 bg-red-400/10 text-red-200'}`}
            data-testid="attention-causal-toggle"
          >
            {causal ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            {causal ? 'Causal mask on' : 'Future tokens visible'}
          </button>
        </div>

        {!causal ? (
          <div className="border-b border-red-400/20 bg-red-400/10 px-5 py-3 text-sm text-red-100 md:px-7" role="alert" data-testid="attention-unmasked-warning">
            Counterfactual mode: future tokens influence earlier positions. This is useful for comparison, but invalid for autoregressive generation.
          </div>
        ) : null}

        <div className="border-b border-white/10 px-5 py-5 md:px-7">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Select the output position that is gathering context</p>
          <div className="mt-4 flex flex-wrap items-center gap-2" data-testid="attention-token-selector">
            {example.tokens.map((token, index) => (
              <button
                key={token}
                type="button"
                onClick={() => setSelectedIndex(index)}
                aria-pressed={selectedIndex === index}
                className={`group relative min-h-12 rounded-xl border px-4 font-mono text-sm font-semibold transition ${selectedIndex === index ? 'border-sky-400 bg-sky-400 text-slate-950' : 'border-white/15 bg-white/[0.04] text-slate-200 hover:border-sky-400/60'}`}
                data-testid={`attention-token-${index}`}
              >
                <span className="mr-2 text-[0.62rem] opacity-55">{index + 1}</span>{token}
              </button>
            ))}
            <span className="ml-1 text-sm text-slate-500">gathers most from</span>
            <Badge className="border-sky-400/30 bg-sky-400/10 text-sky-200" data-testid="attention-dominant-token">{example.tokens[dominantIndex]}</Badge>
          </div>
        </div>

        <div className="border-b border-white/10 px-3 py-3 md:px-5">
          <nav className="overflow-x-auto" aria-label="Attention calculation stages">
            <div className="flex min-w-max gap-1">
              {STAGES.map((candidate) => (
                <button
                  key={candidate.id}
                  type="button"
                  onClick={() => setStage(candidate.id)}
                  aria-pressed={stage === candidate.id}
                  className={`rounded-xl px-4 py-3 text-left transition ${stage === candidate.id ? 'bg-white text-slate-950' : 'text-slate-400 hover:bg-white/[0.06] hover:text-white'}`}
                  data-testid={`attention-stage-button-${candidate.id}`}
                >
                  <span className="block text-[0.6rem] font-semibold uppercase tracking-[0.18em] opacity-55">{candidate.number}</span>
                  <span className="mt-1 block text-sm font-semibold">{candidate.label}</span>
                </button>
              ))}
            </div>
          </nav>
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1.42fr)_minmax(290px,0.58fr)]">
          <div className="min-h-[32rem] border-b border-white/10 p-5 lg:border-b-0 lg:border-r md:p-7">
            <StageWorkspace stage={stage} example={example} selectedIndex={selectedIndex} causal={causal} />
          </div>
          <aside className="p-5 md:p-7" data-testid="attention-stage-inspector">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Stage {stageCopy.number}</p>
            <h2 className="mt-2 text-xl font-semibold text-white">{stageCopy.label}</h2>
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.17em] text-slate-500">Operation</p>
              <p className="mt-2 break-words font-mono text-sm leading-6 text-sky-200">{stageCopy.formula}</p>
            </div>
            <p className="mt-5 text-sm leading-6 text-slate-300">{stageCopy.insight}</p>

            <div className="mt-7 border-t border-white/10 pt-5">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.17em] text-slate-500">Selected position</p>
              <p className="mt-2 font-mono text-lg font-semibold text-white">{selectedIndex + 1} · {example.tokens[selectedIndex]}</p>
              <p className="mt-3 text-xs leading-5 text-slate-500">The selected row is highlighted in every matrix and in the full attention pattern below.</p>
            </div>
          </aside>
        </div>

        <div className="border-t border-white/10 p-5 md:p-7" data-testid="attention-heatmap">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Full attention pattern</p>
              <h2 className="mt-2 text-xl font-semibold">Every output row chooses among input columns</h2>
            </div>
            <p className="text-xs text-slate-500">rows = outputs · columns = available context</p>
          </div>

          <div className="mt-5 overflow-x-auto">
            <div className="grid min-w-[31rem] gap-2" style={{ gridTemplateColumns: `6rem repeat(${example.tokens.length}, minmax(5rem, 1fr))` }}>
              <span />
              {example.tokens.map((token) => <span key={token} className="pb-1 text-center font-mono text-xs text-slate-400">{token}</span>)}
              {weights.flatMap((row, rowIndex) => [
                <button key={`label-${rowIndex}`} type="button" onClick={() => setSelectedIndex(rowIndex)} className={`rounded-lg px-2 text-left font-mono text-xs font-semibold ${selectedIndex === rowIndex ? 'bg-sky-400 text-slate-950' : 'text-slate-400 hover:text-white'}`}>{example.tokens[rowIndex]}</button>,
                ...row.map((value, columnIndex) => {
                  const masked = causal && trace.maskedScores[rowIndex][columnIndex] === null;
                  return (
                    <button
                      key={`${rowIndex}-${columnIndex}`}
                      type="button"
                      onClick={() => setSelectedIndex(rowIndex)}
                      className={`aspect-[1.5] rounded-xl border font-mono text-xs font-semibold transition ${selectedIndex === rowIndex ? 'border-sky-300/60' : 'border-white/10'} ${masked ? 'bg-red-400/[0.055] text-red-300/55' : 'text-white'}`}
                      style={masked ? undefined : { backgroundColor: `rgba(56, 189, 248, ${0.08 + value * 0.82})` }}
                      aria-label={`${example.tokens[rowIndex]} attends to ${example.tokens[columnIndex]}: ${masked ? 'masked' : `${(value * 100).toFixed(1)} percent`}`}
                      data-testid={`attention-cell-${rowIndex}-${columnIndex}`}
                    >
                      {masked ? '—' : `${(value * 100).toFixed(1)}%`}
                    </button>
                  );
                }),
              ])}
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6">
        <LearningCheckpoint
          id="attention-subject"
          question="In the Subject signal preset, which earlier token should receive the largest weight from “tired”?"
          choices={[
            { value: 'the', label: 'The' },
            { value: 'animal', label: 'animal' },
            { value: 'was', label: 'was' },
          ]}
          correctValue="animal"
          explanation="The query for “tired” is [1.40, 0.00]. Its scaled dot product is largest with the key for “animal”, so softmax assigns that earlier token the greatest weight."
        />
      </div>

      <section className="mt-6 border-y border-stone-200 py-7" aria-labelledby="attention-theory-heading">
        <div className="flex items-center gap-3">
          <Network className="h-6 w-6 text-sky-700" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Theory bridge</p>
            <h2 id="attention-theory-heading" className="mt-1 text-2xl font-semibold text-slate-950">What this one head teaches—and what it leaves out</h2>
          </div>
        </div>
        <div className="mt-7 grid divide-y divide-stone-200 md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-4">
          <div className="py-5 md:py-0 md:pr-5"><Link2 className="h-5 w-5 text-sky-700" /><h3 className="mt-3 font-semibold text-slate-950">Heads can specialize</h3><p className="mt-2 text-sm leading-6 text-slate-600">One head can emphasize one relationship. Real layers run many heads in parallel and combine their outputs.</p></div>
          <div className="py-5 md:px-5"><Binary className="h-5 w-5 text-sky-700" /><h3 className="mt-3 font-semibold text-slate-950">Attention moves information</h3><p className="mt-2 text-sm leading-6 text-slate-600">Attention mixes information across positions; an MLP transforms each position. Transformer blocks alternate both operations.</p></div>
          <div className="py-5 md:px-5"><Layers3 className="h-5 w-5 text-sky-700" /><h3 className="mt-3 font-semibold text-slate-950">The residual path persists</h3><p className="mt-2 text-sm leading-6 text-slate-600">A real block adds its update back to the existing residual stream, allowing information to accumulate across layers.</p></div>
          <div className="py-5 md:pl-5"><Scale className="h-5 w-5 text-sky-700" /><h3 className="mt-3 font-semibold text-slate-950">Patterns are evidence, not explanations</h3><p className="mt-2 text-sm leading-6 text-slate-600">A bright cell shows a strong weight. It does not, by itself, prove a human-readable reasoning process.</p></div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2" aria-label="Continue the language model path">
        <Link to="/learn/residual-stream" className="group flex min-h-36 items-center justify-between gap-5 rounded-[2rem] bg-slate-950 p-5 text-white transition hover:-translate-y-0.5 md:p-7" data-testid="attention-residual-link">
          <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Continue the computation</p><h2 className="mt-2 text-xl font-semibold">Watch attention and MLP updates accumulate in the residual stream</h2></div>
          <ArrowRight className="h-6 w-6 shrink-0 text-sky-300 transition group-hover:translate-x-1" />
        </Link>
        <Link to="/learn/kv-cache" className="group flex min-h-36 items-center justify-between gap-5 rounded-[2rem] border border-stone-200 bg-white/85 p-5 transition hover:-translate-y-0.5 md:p-7" data-testid="attention-kv-cache-link">
          <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Follow the systems consequence</p><h2 className="mt-2 text-xl font-semibold text-slate-950">Cache earlier keys and values; compute only the newest query</h2></div>
          <ArrowRight className="h-6 w-6 shrink-0 text-sky-700 transition group-hover:translate-x-1" />
        </Link>
      </section>

      <p className="mt-5 flex items-center justify-center gap-2 text-center text-xs leading-5 text-slate-500">
        <Calculator className="h-4 w-4" /> All values are recomputed from the displayed matrices. <Sigma className="h-4 w-4" /> Display rounding never feeds back into the calculation.
      </p>
    </div>
  );
}
