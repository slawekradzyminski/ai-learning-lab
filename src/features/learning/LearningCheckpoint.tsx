import { useState } from 'react';
import { CheckCircle2, CircleHelp, RotateCcw, XCircle } from 'lucide-react';

type CheckpointChoice = {
  value: string;
  label: string;
};

export function LearningCheckpoint({
  id,
  eyebrow = 'Predict before reveal',
  question,
  choices,
  correctValue,
  explanation,
}: {
  id: string;
  eyebrow?: string;
  question: string;
  choices: CheckpointChoice[];
  correctValue: string;
  explanation: string;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const correct = selected === correctValue;

  const reset = () => {
    setSelected(null);
    setSubmitted(false);
  };

  return (
    <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white/85" data-testid={`${id}-checkpoint`}>
      <div className="grid gap-6 p-5 md:grid-cols-[minmax(0,0.82fr)_minmax(320px,1.18fr)] md:p-7">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
            <CircleHelp className="h-4 w-4" /> {eyebrow}
          </p>
          <h2 className="mt-3 text-xl font-semibold leading-8 text-slate-950">{question}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">Commit to an answer before opening the explanation.</p>
        </div>

        <div>
          <div className="grid gap-2" role="group" aria-label={question}>
            {choices.map((choice) => (
              <button
                key={choice.value}
                type="button"
                onClick={() => {
                  setSelected(choice.value);
                  setSubmitted(false);
                }}
                aria-pressed={selected === choice.value}
                className={`min-h-11 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${
                  selected === choice.value
                    ? 'border-slate-950 bg-slate-950 text-white'
                    : 'border-stone-200 bg-stone-50 text-slate-700 hover:border-sky-300 hover:bg-sky-50'
                }`}
                data-testid={`${id}-choice-${choice.value}`}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!selected}
              onClick={() => setSubmitted(true)}
              className="inline-flex min-h-11 items-center rounded-full bg-sky-600 px-5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-45"
              data-testid={`${id}-check`}
            >
              Check answer
            </button>
            {submitted ? (
              <button type="button" onClick={reset} className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-slate-600 hover:bg-stone-100">
                <RotateCcw className="h-4 w-4" /> Try again
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {submitted ? (
        <div
          className={`flex items-start gap-3 border-t px-5 py-5 md:px-7 ${correct ? 'border-emerald-200 bg-emerald-50 text-emerald-950' : 'border-amber-200 bg-amber-50 text-amber-950'}`}
          role="status"
          data-testid={`${id}-feedback`}
        >
          {correct ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" /> : <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />}
          <div>
            <p className="text-sm font-semibold">{correct ? 'Correct.' : 'Not quite.'}</p>
            <p className="mt-1 text-sm leading-6 opacity-85">{explanation}</p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
