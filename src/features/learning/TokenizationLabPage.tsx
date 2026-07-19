import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Binary, Braces, Languages, LoaderCircle, Radio, Sparkles } from 'lucide-react';
import { DEFAULT_OLLAMA_MODEL, DEFAULT_OLLAMA_MODEL_LABEL } from '../../lib/ollamaDefaults';
import { tokenizeWithBonsai } from './bonsaiTokenizer';
import { LabPageHeader } from './LabPageHeader';
import { guidedTokenize, type TokenizationResult, type TokenizerManifest } from './tokenization';
import { useLiveTokenCount } from './useLearningModel';
import { LLM_COURSE_PROMPT } from './course/courseScenario';
import { LIVE_AI_RUNTIME_ENABLED } from '../../lib/runtimeCapabilities';

type TokenMode = 'guided' | 'bonsai';

const PRESETS = [
  { label: 'Course sentence', text: LLM_COURSE_PROMPT },
  { label: 'Leading space', text: ' hello world' },
  { label: 'Polish', text: 'Zażółć gęślą jaźń.' },
  { label: 'Emoji', text: 'AI is useful 🤖✨' },
  { label: 'Code', text: 'const answer = 42;' },
  { label: 'Newline', text: 'first line\nsecond line' },
];

function tokenTone(index: number, selected: boolean) {
  if (selected) return 'border-sky-400 bg-sky-500 text-slate-950 shadow-[0_10px_30px_-18px_rgba(14,165,233,0.9)]';
  const tones = [
    'border-slate-700 bg-slate-900 text-slate-100',
    'border-sky-950 bg-sky-950/70 text-sky-100',
    'border-slate-600 bg-slate-800 text-slate-100',
  ];
  return tones[index % tones.length];
}

export function TokenizationLabPage({ embedded = false, liveRuntimeEnabled = LIVE_AI_RUNTIME_ENABLED }: { embedded?: boolean; liveRuntimeEnabled?: boolean }) {
  const [mode, setMode] = useState<TokenMode>('guided');
  const [text, setText] = useState(PRESETS[0].text);
  const [model, setModel] = useState(DEFAULT_OLLAMA_MODEL);
  const [modelResult, setModelResult] = useState<(TokenizationResult & { manifest: TokenizerManifest }) | null>(null);
  const [tokenizerError, setTokenizerError] = useState<string | null>(null);
  const [tokenizerLoading, setTokenizerLoading] = useState(false);
  const [tokenizerAttempt, setTokenizerAttempt] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const verification = useLiveTokenCount();
  const guidedResult = useMemo(() => guidedTokenize(text), [text]);

  useEffect(() => {
    if (mode !== 'bonsai') return;
    let current = true;
    setModelResult(null);
    setTokenizerLoading(true);
    setTokenizerError(null);
    tokenizeWithBonsai(text)
      .then((result) => {
        if (current) setModelResult(result);
      })
      .catch(() => {
        if (current) {
          setModelResult(null);
          setTokenizerError('The local tokenizer files could not be loaded.');
        }
      })
      .finally(() => {
        if (current) setTokenizerLoading(false);
      });
    return () => {
      current = false;
    };
  }, [mode, text, tokenizerAttempt]);

  const result = mode === 'guided' ? guidedResult : modelResult;
  const selected = result?.pieces[selectedIndex] ?? result?.pieces[0] ?? null;
  const byteValues = selected ? Array.from(new TextEncoder().encode(selected.text)) : [];
  const codePoints = selected ? [...selected.text].map((character) => `U+${(character.codePointAt(0) ?? 0).toString(16).toUpperCase().padStart(4, '0')}`) : [];
  const verifiedCurrentPrompt = verification.result?.prompt === text;
  const countMatches = verifiedCurrentPrompt && verification.result?.promptTokenCount === result?.pieces.length;

  const updateText = (nextText: string) => {
    setText(nextText);
    setSelectedIndex(0);
    verification.reset();
  };

  const verifyWithBonsai = async (event: FormEvent) => {
    event.preventDefault();
    await verification.run({ model, prompt: text });
  };

  return (
    <div data-testid="tokenization-lab-page">
      {!embedded ? <LabPageHeader
        eyebrow="Language models · step 1"
        title="See the pieces the model receives"
        description="Compare an inspectable teaching tokenizer with the pinned Qwen3.6 vocabulary used by Bonsai, then verify the count with a real Bonsai run."
        aside="Text → token IDs"
      /> : null}

      <div className="mb-5 inline-flex rounded-full border border-stone-200 bg-white p-1" role="group" aria-label="Tokenizer source">
        <button type="button" onClick={() => setMode('guided')} aria-pressed={mode === 'guided'} className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold transition ${mode === 'guided' ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-stone-100'}`} data-testid="tokenization-mode-guided">
          <Sparkles className="h-4 w-4" /> Guided example
        </button>
        <button type="button" onClick={() => setMode('bonsai')} aria-pressed={mode === 'bonsai'} className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold transition ${mode === 'bonsai' ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-stone-100'}`} data-testid="tokenization-mode-bonsai">
          <Binary className="h-4 w-4" /> Bonsai vocabulary
        </button>
      </div>

      {mode === 'bonsai' ? (
        <p className="mb-5 text-sm leading-6 text-slate-600" data-testid="tokenization-provenance">
          <strong className="font-semibold text-slate-950">Local tokenizer:</strong> Qwen3.6 vocabulary used by Bonsai 27B. The browser reads a pinned asset; no live model runs until verification.
        </p>
      ) : null}

      <section className="overflow-hidden rounded-[2rem] bg-slate-950 text-white" data-testid="tokenization-workspace">
        <div className="grid border-b border-white/10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <div className="p-5 md:p-7">
            <label htmlFor="tokenization-input" className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Input text</label>
            <textarea
              id="tokenization-input"
              value={text}
              onChange={(event) => updateText(event.target.value)}
              rows={5}
              maxLength={2000}
              className="mt-3 w-full resize-y rounded-2xl border border-white/15 bg-white/5 px-4 py-3 font-mono text-base leading-7 text-white outline-none transition focus:border-sky-400"
              data-testid="tokenization-input"
            />
            <div className="mt-4 flex flex-wrap gap-2" aria-label="Tokenization examples">
              {PRESETS.map((preset) => (
                <button key={preset.label} type="button" onClick={() => updateText(preset.text)} className="rounded-full border border-white/15 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-sky-400 hover:text-white">
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10 p-5 lg:border-l lg:border-t-0 md:p-7">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Tokenizer output</p>
                <p className="mt-2 text-sm text-slate-400" data-testid="tokenization-source">
                  {result?.sourceLabel ?? (tokenizerLoading ? 'Loading the 12 MB tokenizer asset…' : 'No tokenizer result')}
                </p>
              </div>
              {result ? <span className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-slate-300">{result.pieces.length} tokens</span> : null}
            </div>

            {tokenizerLoading ? (
              <div className="flex min-h-44 items-center justify-center gap-3 text-sm text-slate-300" role="status">
                <LoaderCircle className="h-5 w-5 animate-spin text-sky-400" /> Parsing the model vocabulary…
              </div>
            ) : tokenizerError ? (
              <div className="mt-5 flex min-h-36 flex-col items-start justify-center gap-3 rounded-2xl border border-amber-300/25 bg-amber-300/10 p-5" role="alert">
                <p className="text-sm text-amber-50">{tokenizerError}</p>
                <button type="button" onClick={() => setTokenizerAttempt((attempt) => attempt + 1)} className="min-h-10 border border-amber-100/30 px-4 text-xs font-semibold text-amber-50 transition hover:bg-amber-100/10" data-testid="tokenization-retry">
                  Retry tokenizer
                </button>
              </div>
            ) : (
              <div className="mt-6 flex min-h-36 flex-wrap content-start gap-2" data-testid="tokenization-pieces">
                {result?.pieces.map((piece, index) => (
                  <button
                    key={`${piece.id}-${index}`}
                    type="button"
                    onClick={() => setSelectedIndex(index)}
                    className={`group min-w-14 rounded-xl border px-3 py-2 text-left transition hover:-translate-y-0.5 ${tokenTone(index, selectedIndex === index)}`}
                    aria-pressed={selectedIndex === index}
                    data-testid={`token-piece-${index}`}
                  >
                    <span className="block font-mono text-base font-semibold">{piece.display}</span>
                    <span className="mt-1 block text-[0.65rem] opacity-60">#{index + 1} · {piece.id}</span>
                  </button>
                ))}
              </div>
            )}
            {result ? <p className="mt-4 text-xs leading-5 text-slate-500">{result.modelLabel}</p> : null}
          </div>
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.58fr)]">
          <div className="p-5 md:p-7" data-testid="token-detail">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Selected token</p>
            {selected ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div><p className="text-xs text-slate-500">Decoded text</p><p className="mt-2 break-all font-mono text-xl">{selected.display}</p></div>
                <div><p className="text-xs text-slate-500">Token ID</p><p className="mt-2 font-mono text-xl tabular-nums">{selected.id}</p></div>
                <div><p className="text-xs text-slate-500">Characters / bytes</p><p className="mt-2 font-mono text-xl">{selected.characterCount} / {selected.byteCount}</p></div>
                <div><p className="text-xs text-slate-500">Model vocabulary form</p><p className="mt-2 break-all font-mono text-sm text-sky-200">{selected.rawToken.split('Ġ').join('·').split('Ċ').join('↵')}</p></div>
              </div>
            ) : <p className="mt-4 text-sm text-slate-400">Enter text to create tokens.</p>}
            {selected ? (
              <div className="mt-5 grid gap-3 border-t border-white/10 pt-5 sm:grid-cols-2">
                <p className="font-mono text-xs leading-5 text-slate-400"><span className="text-slate-500">UTF-8</span> {byteValues.join(' · ') || '—'}</p>
                <p className="font-mono text-xs leading-5 text-slate-400"><span className="text-slate-500">Unicode</span> {codePoints.join(' · ') || '—'}</p>
              </div>
            ) : null}
          </div>

          <div className="border-t border-white/10 bg-white/[0.03] p-5 lg:border-l lg:border-t-0 md:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Why it matters</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">The model never receives words directly. It receives IDs, and every ID consumes one position in the context window.</p>
            <div className="mt-5 flex items-center gap-3 text-sm text-slate-400"><Languages className="h-4 w-4 text-sky-400" /> Different tokenizers split the same text differently.</div>
            <div className="mt-3 flex items-center gap-3 text-sm text-slate-400"><Braces className="h-4 w-4 text-sky-400" /> Code, emoji, and whitespace reveal the difference quickly.</div>
          </div>
        </div>
      </section>

      {mode === 'bonsai' && liveRuntimeEnabled ? (
        <section className="mt-6 grid gap-5 rounded-[2rem] border border-stone-200 bg-white/85 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.55fr)] md:p-7" data-testid="tokenization-verification">
          <form onSubmit={verifyWithBonsai}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Runtime verification</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">Ask Bonsai how many prompt tokens it processed</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">The browser creates the exact token pieces immediately. This authenticated request checks the count against a raw one-token Ollama generation.</p>
            <label htmlFor="tokenization-model" className="mt-5 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Live runtime model</label>
            <input id="tokenization-model" value={model} onChange={(event) => { setModel(event.target.value); verification.reset(); }} className="mt-2 h-11 w-full rounded-xl border border-stone-200 bg-white px-3 font-mono text-sm text-slate-950" data-testid="tokenization-model" />
            <button type="submit" disabled={verification.loading || !text.trim()} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-sky-600 px-5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60" data-testid="tokenization-verify">
              {verification.loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Radio className="h-4 w-4" />}
              {verification.loading ? 'Waiting for Ollama…' : 'Verify with Bonsai'}
            </button>
          </form>

          <div className="flex min-h-48 flex-col justify-center rounded-[1.5rem] bg-slate-950 p-5 text-white" aria-live="polite">
            {verification.error ? (
              <><p className="text-sm font-semibold text-red-300">Live verification unavailable</p><p className="mt-2 text-sm leading-6 text-slate-400" role="alert">{verification.error}</p></>
            ) : verifiedCurrentPrompt && verification.result ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300" data-testid="tokenization-live-badge">Live Bonsai 27B</p>
                <p className="mt-2 truncate font-mono text-xs text-slate-500">{verification.result.modelLabel}</p>
                <p className={`text-sm font-semibold ${countMatches ? 'text-emerald-300' : 'text-amber-300'}`}>{countMatches ? 'Counts match' : 'Counts differ'}</p>
                <div className="mt-4 flex items-end gap-6">
                  <div><p className="text-xs text-slate-500">Browser tokenizer</p><p className="mt-1 text-4xl font-semibold">{result?.pieces.length}</p></div>
                  <div><p className="text-xs text-slate-500">Ollama runtime</p><p className="mt-1 text-4xl font-semibold" data-testid="tokenization-runtime-count">{verification.result.promptTokenCount}</p></div>
                </div>
                <p className="mt-5 text-xs text-slate-500">Generated evidence</p>
                <p className="mt-1 font-mono text-lg text-sky-200">{verification.result.generatedToken.split(' ').join('·') || '∅'}</p>
              </>
            ) : (
              <><p className="text-sm font-semibold text-slate-300">No runtime check yet</p><p className="mt-2 text-sm leading-6 text-slate-500">Configured default: {DEFAULT_OLLAMA_MODEL_LABEL}</p></>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}
