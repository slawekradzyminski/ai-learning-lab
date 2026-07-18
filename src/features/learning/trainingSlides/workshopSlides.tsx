import type { ReactNode } from 'react';
import { Bot, BrainCircuit, Database, Gauge, Network, PanelTop, ScanLine, ShieldCheck } from 'lucide-react';
import { LEARNING_LABS, LEARNING_TRACKS, type LearningTrackId } from '../learningCatalog';
import type { TrainingSlideDefinition } from './types';

const trackIcons = {
  language: <Network className="h-7 w-7 text-sky-300" />,
  semantic: <Database className="h-7 w-7 text-sky-300" />,
  neural: <BrainCircuit className="h-7 w-7 text-sky-300" />,
  agency: <Bot className="h-7 w-7 text-amber-300" />,
  context: <PanelTop className="h-7 w-7 text-amber-300" />,
  safety: <ShieldCheck className="h-7 w-7 text-amber-300" />,
} satisfies Record<LearningTrackId, ReactNode>;

const trackPipelines: Record<LearningTrackId, string[]> = {
  language: ['Token IDs', 'Context routing', 'Residual updates', 'Token distribution', 'Reusable K + V'],
  semantic: ['Sentence', 'Embedding vector', 'Cosine similarity', 'Nearest meaning'],
  neural: ['Prediction', 'Loss + gradient', 'Learned features', 'Classifier'],
  agency: ['Assemble', 'Infer', 'Act', 'Observe + repeat'],
  context: ['Collect', 'Prioritize', 'Compact', 'Serialize'],
  safety: ['Parse', 'Validate', 'Authorize', 'Observe outcome'],
};

export function createTrackSlide(trackId: LearningTrackId): TrainingSlideDefinition {
  const track = LEARNING_TRACKS.find((candidate) => candidate.id === trackId);
  if (!track) throw new Error(`Missing learning track ${trackId}`);

  const labs = LEARNING_LABS.filter((lab) => lab.track === trackId);
  return {
    id: `track-${trackId}`,
    kind: 'track',
    trackId,
    chapterLabel: track.label,
    kicker: `${track.label} · chapter map`,
    title: track.title,
    content: (
      <div className="mt-9 grid gap-10 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:items-end">
        <div>
          {trackIcons[trackId]}
          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">{track.description}</p>
          <p className="mt-6 text-sm text-slate-500">{labs.length} practical {labs.length === 1 ? 'exercise' : 'exercises'} · each chapter follows question → mechanism → lab → debrief</p>
        </div>
        <div className="grid gap-px bg-white/10 sm:grid-cols-2">
          {trackPipelines[trackId].map((step, index) => (
            <div key={step} className="bg-slate-950 p-5"><span className="text-xs font-semibold text-sky-300">0{index + 1}</span><p className="mt-4 text-lg font-semibold">{step}</p></div>
          ))}
        </div>
      </div>
    ),
    notes: `Preview the ${labs.map((lab) => lab.shortTitle).join(', ')} chapters. Ask participants where they currently feel the black box begins.`,
  };
}

export const openingSlide: TrainingSlideDefinition = {
  id: 'opening',
  kind: 'opening',
  chapterLabel: 'AI Learning Lab · instructor sequence',
  kicker: 'Companion narrative · twelve practical exercises',
  title: 'Find the bottom of the black box.',
  content: (
    <div className="mt-9 grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-end">
      <div>
        <p className="max-w-xl text-lg leading-8 text-slate-300">We will start with visible behavior, reduce it to one calculation, predict before revealing, run the real lab, and return with a narrower claim.</p>
        <p className="mt-5 text-sm leading-6 text-slate-500">Narrative cadence informed by <em>The Welch Labs Illustrated Guide to AI</em>, with original diagrams and direct links to our implementation.</p>
      </div>
      <div className="grid grid-cols-2 gap-px bg-white/10 md:grid-cols-4">
        {[['01', 'Question'], ['02', 'Mechanism'], ['03', 'Exercise'], ['04', 'Debrief']].map(([number, label]) => (
          <div key={number} className="bg-slate-950 p-5 md:p-6"><span className="text-xs text-sky-300">{number}</span><p className="mt-5 text-lg font-semibold md:text-xl">{label}</p></div>
        ))}
      </div>
    </div>
  ),
  notes: 'Set the workshop contract: no slide should replace the exercise, and no exercise result should remain uninterpreted when the group returns.',
};

export const recapSlide: TrainingSlideDefinition = {
  id: 'recap',
  kind: 'recap',
  chapterLabel: 'Closing synthesis',
  kicker: 'One system · twelve places to stop and look',
  title: 'The black box is a chain of inspectable transformations.',
  content: (
    <div className="mt-9 grid gap-px bg-white/10 md:grid-cols-3">
      <div className="bg-slate-950 p-6"><Network className="h-7 w-7 text-sky-300" /><p className="mt-5 text-xl font-semibold">Inference</p><p className="mt-3 text-sm leading-6 text-slate-400">Tokens gather context, become a distribution, and reuse earlier keys and values.</p></div>
      <div className="bg-slate-950 p-6"><Gauge className="h-7 w-7 text-sky-300" /><p className="mt-5 text-xl font-semibold">Learning</p><p className="mt-3 text-sm leading-6 text-slate-400">Loss measures error; gradients distribute responsibility; layers change representation.</p></div>
      <div className="bg-slate-950 p-6"><ScanLine className="h-7 w-7 text-sky-300" /><p className="mt-5 text-xl font-semibold">Perception</p><p className="mt-3 text-sm leading-6 text-slate-400">Shared local filters become activation maps and finally class evidence.</p></div>
      <p className="bg-slate-950 p-6 text-lg leading-8 text-slate-200 md:col-span-3"><strong className="text-white">Final question:</strong> at which transformation would you now be comfortable pausing a model and explaining every number on screen?</p>
    </div>
  ),
  notes: 'Let participants choose one lab to explain back to the room. The explanation must include representation, operation, output, and limitation.',
};
