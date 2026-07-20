import { useEffect, useMemo, useState } from 'react';
import { Cpu, Loader2, Radio, TriangleAlert } from 'lucide-react';
import { gpt2 } from '../../../lib/api';
import { DEFAULT_OLLAMA_MODEL, DEFAULT_OLLAMA_MODEL_LABEL } from '../../../lib/ollamaDefaults';
import { LIVE_AI_RUNTIME_ENABLED } from '../../../lib/runtimeCapabilities';
import type { Gpt2InspectorStatus } from '../../../types/gpt2';
import { liveNextTokenProvider } from '../nextTokenProviders';
import { LLM_COURSE_PROMPT } from './courseScenario';

type EvidenceSource = 'teaching' | 'gpt2' | 'bonsai';

type Candidate = {
  token: string;
  probability: number;
  score?: number;
  scoreLabel?: 'logit' | 'log p';
};

const teachingCandidates: Candidate[] = [
  { token: ' tired', probability: 0.48 },
  { token: ' frightened', probability: 0.21 },
  { token: ' late', probability: 0.14 },
  { token: ' small', probability: 0.09 },
  { token: ' dark', probability: 0.08 },
];

function readableError(error: unknown) {
  const response = (error as { response?: { data?: { message?: string; detail?: string; error?: string } } })?.response?.data;
  return response?.message ?? response?.detail ?? response?.error ?? (error instanceof Error ? error.message : 'The model could not produce a distribution.');
}

function visibleToken(token: string) {
  if (!token) return '∅';
  return token.startsWith(' ') ? `·${token.slice(1)}` : token.replace(/\n/g, '↵');
}

export function PredictionActivity({ liveRuntimeEnabled = LIVE_AI_RUNTIME_ENABLED }: { liveRuntimeEnabled?: boolean } = {}) {
  const [source, setSource] = useState<EvidenceSource>('teaching');
  const [prediction, setPrediction] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>(teachingCandidates);
  const [sourceNote, setSourceNote] = useState('Curated teaching distribution · normalized across five illustrative candidates');
  const [gpt2Status, setGpt2Status] = useState<Gpt2InspectorStatus | null>(null);
  const [checkingGpt2, setCheckingGpt2] = useState(liveRuntimeEnabled);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!liveRuntimeEnabled) return undefined;
    let active = true;
    void gpt2.getStatus()
      .then((status) => { if (active) setGpt2Status(status); })
      .catch(() => { if (active) setGpt2Status(null); })
      .finally(() => { if (active) setCheckingGpt2(false); });
    return () => { active = false; };
  }, [liveRuntimeEnabled]);

  const sourceOptions = useMemo(() => ([
    { id: 'teaching' as const, label: 'Teaching model', detail: 'Curated', enabled: true },
    { id: 'gpt2' as const, label: 'GPT-2', detail: checkingGpt2 ? 'Checking…' : gpt2Status?.available ? 'Real logits' : 'Full local only', enabled: Boolean(gpt2Status?.available) },
    { id: 'bonsai' as const, label: 'Bonsai', detail: liveRuntimeEnabled ? 'Live logprobs' : 'Full profile only', enabled: liveRuntimeEnabled },
  ]), [checkingGpt2, gpt2Status?.available, liveRuntimeEnabled]);

  const chooseSource = (nextSource: EvidenceSource) => {
    setSource(nextSource);
    setPrediction(null);
    setRevealed(false);
    setError(null);
    setCandidates(nextSource === 'teaching' ? teachingCandidates : []);
    setSourceNote(nextSource === 'teaching' ? 'Curated teaching distribution · normalized across five illustrative candidates' : 'Commit a prediction, then run the selected model.');
  };

  const revealDistribution = async () => {
    if (!prediction) return;
    if (source === 'teaching') {
      setCandidates(teachingCandidates);
      setRevealed(true);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (source === 'gpt2') {
        const trace = await gpt2.getTrace({
          prompt: LLM_COURSE_PROMPT,
          layer: Math.max(0, (gpt2Status?.layerCount ?? 12) - 1),
          head: 0,
        });
        setCandidates(trace.predictions.map(({ token, probability, logit }) => ({ token, probability, score: logit, scoreLabel: 'logit' })));
        setSourceNote(`${trace.modelLabel} · revision ${trace.modelRevision} · full-vocabulary softmax`);
      } else {
        const result = await liveNextTokenProvider({ model: DEFAULT_OLLAMA_MODEL, prompt: LLM_COURSE_PROMPT, topK: 10 });
        setCandidates(result.tokens.map(({ token, rawProbability, logprob }) => ({ token, probability: rawProbability, score: logprob, scoreLabel: 'log p' })));
        setSourceNote(`${DEFAULT_OLLAMA_MODEL_LABEL} · ${(result.capturedProbabilityMass * 100).toFixed(1)}% probability mass captured · values are logprobs, because Ollama does not expose raw logits`);
      }
      setRevealed(true);
    } catch (requestError) {
      setCandidates([]);
      setRevealed(false);
      setError(readableError(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-[2rem] bg-slate-950 text-white" data-testid="course-prediction-activity">
      <div className="border-b border-white/10 px-5 py-6 md:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">One unfinished sentence</p>
            <p className="mt-4 max-w-4xl font-mono text-xl leading-9 md:text-2xl">{LLM_COURSE_PROMPT}<span className="ml-1 animate-pulse text-sky-300">▍</span></p>
          </div>
          <div className="grid shrink-0 grid-cols-3 border-y border-white/10 lg:min-w-[29rem]" aria-label="Evidence source" data-testid="prediction-source-switch">
            {sourceOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                disabled={!option.enabled}
                onClick={() => chooseSource(option.id)}
                aria-pressed={source === option.id}
                className={`min-h-14 border-r border-white/10 px-3 py-2 text-left transition last:border-r-0 disabled:cursor-not-allowed disabled:opacity-35 ${source === option.id ? 'bg-sky-400 text-slate-950' : 'text-slate-300 hover:bg-white/5'}`}
                data-testid={`prediction-source-${option.id}`}
              >
                <span className="block text-xs font-semibold">{option.label}</span>
                <span className={`mt-0.5 block text-[0.65rem] ${source === option.id ? 'text-slate-800' : 'text-slate-500'}`}>{option.detail}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-8 p-5 lg:grid-cols-[0.8fr_1.2fr] md:p-8">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">
            {source === 'gpt2' ? <Cpu className="h-4 w-4" /> : source === 'bonsai' ? <Radio className="h-4 w-4" /> : null}
            {source === 'teaching' ? 'Calculate by hand' : source === 'gpt2' ? 'Canonical GPT-2 trace' : 'Compare with local AI'}
          </p>
          <h3 className="mt-3 text-xl font-semibold">Commit before reveal</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">Choose the continuation you expect to rank first.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {teachingCandidates.map(({ token }) => (
              <button key={token} type="button" onClick={() => { setPrediction(token); setRevealed(false); setError(null); }} aria-pressed={prediction === token} className={`min-h-11 rounded-full px-4 font-mono text-sm transition ${prediction === token ? 'bg-sky-400 text-slate-950' : 'border border-white/15 text-slate-200 hover:border-sky-400'}`}>
                {token.trim()}
              </button>
            ))}
          </div>
          <button type="button" disabled={!prediction || loading} onClick={() => void revealDistribution()} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-slate-950 disabled:opacity-40" data-testid="course-prediction-reveal">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loading ? `Running ${source === 'gpt2' ? 'GPT-2' : 'Bonsai'}…` : source === 'teaching' ? 'Reveal distribution' : `Run ${source === 'gpt2' ? 'GPT-2' : 'Bonsai'}`}
          </button>
          {error ? <div className="mt-4 flex items-start gap-2 text-sm leading-6 text-rose-300" role="alert" data-testid="prediction-source-error"><TriangleAlert className="mt-1 h-4 w-4 shrink-0" />{error}</div> : null}
        </div>

        <div className="min-h-64 border-l-0 border-white/10 lg:border-l lg:pl-8" aria-live="polite">
          {revealed ? (
            <div data-testid="course-prediction-distribution">
              <div className="space-y-4" data-testid="prediction-candidate-list">
                {candidates.map(({ token, probability, score, scoreLabel }, index) => (
                  <div key={`${token}-${index}`}>
                    <div className="mb-1.5 flex items-baseline justify-between gap-4 font-mono text-sm">
                      <span className="min-w-0 truncate">{visibleToken(token)}</span>
                      <span className="shrink-0 text-slate-400">{scoreLabel && score !== undefined ? `${scoreLabel} ${score.toFixed(2)} · ` : ''}{(probability * 100).toFixed(probability < 0.01 ? 2 : 0)}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-sky-400 transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${Math.max(0.5, probability * 100)}%` }} /></div>
                  </div>
                ))}
              </div>
              <p className="mt-5 border-t border-white/10 pt-4 text-xs leading-5 text-slate-500" data-testid="prediction-source-provenance">{sourceNote}</p>
              <p className="mt-3 text-sm leading-6 text-slate-400">Your prediction was <span className="font-mono text-white">{prediction?.trim()}</span>. Compare it with the model’s actual top candidate before following how that distribution is constructed.</p>
            </div>
          ) : <p className="flex h-full min-h-48 items-center text-sm text-slate-500">The distribution stays hidden until you commit.</p>}
        </div>
      </div>
    </section>
  );
}
