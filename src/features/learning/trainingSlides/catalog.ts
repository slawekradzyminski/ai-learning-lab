import { LEARNING_LABS, LEARNING_TRACKS, type LearningLabId, type LearningTrackId } from '../learningCatalog';
import { createLabSlides } from './createLabSlides';
import { learningNarratives } from './narratives/learningNarratives';
import { languageNarratives } from './narratives/languageNarratives';
import { semanticNarratives } from './narratives/semanticNarratives';
import { residualNarrative } from './narratives/residualNarrative';
import { visionNarratives } from './narratives/visionNarratives';
import type { LabNarrative, TrainingSlideDefinition } from './types';
import { createTrackSlide, openingSlide, recapSlide } from './workshopSlides';

const narrativeByLab = [
  ...languageNarratives,
  residualNarrative,
  ...semanticNarratives,
  ...learningNarratives,
  ...visionNarratives,
].reduce((catalog, narrative) => {
  catalog[narrative.id] = narrative;
  return catalog;
}, {} as Partial<Record<LearningLabId, LabNarrative>>);

export const TRAINING_TRACK_ORDER: LearningTrackId[] = ['language', 'semantic', 'neural'];

export const TRAINING_SLIDES: TrainingSlideDefinition[] = [
  openingSlide,
  ...TRAINING_TRACK_ORDER.flatMap((trackId) => [
    createTrackSlide(trackId),
    ...LEARNING_LABS
      .filter((lab) => lab.track === trackId)
      .flatMap((lab) => {
        const narrative = narrativeByLab[lab.id];
        if (!narrative) throw new Error(`Missing LLM narrative ${lab.id}`);
        return createLabSlides(narrative);
      }),
  ]),
  recapSlide,
];

export const EXERCISE_SLIDE_BY_LAB = Object.fromEntries(
  TRAINING_SLIDES.flatMap((slide, index) => (
    slide.kind === 'exercise' && slide.labId ? [[slide.labId, index + 1]] : []
  )),
) as Partial<Record<LearningLabId, number>>;

export function getTrackLabel(trackId: LearningTrackId): string {
  return LEARNING_TRACKS.find((track) => track.id === trackId)?.label ?? trackId;
}

export function getLabShortTitle(labId: LearningLabId): string {
  return LEARNING_LABS.find((lab) => lab.id === labId)?.shortTitle ?? labId;
}
