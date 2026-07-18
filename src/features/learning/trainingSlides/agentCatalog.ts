import { LEARNING_LABS, type LearningLabId, type LearningTrackId } from '../learningCatalog';
import { agentOpeningSlide, agentRecapSlide } from './agentWorkshopSlides';
import { createLabSlides } from './createLabSlides';
import { agentNarratives } from './narratives/agentNarratives';
import type { LabNarrative, TrainingSlideDefinition } from './types';
import { createTrackSlide } from './workshopSlides';

const narrativeByLab = agentNarratives.reduce((catalog, narrative) => {
  catalog[narrative.id] = narrative;
  return catalog;
}, {} as Partial<Record<LearningLabId, LabNarrative>>);

export const AGENT_TRAINING_TRACK_ORDER: LearningTrackId[] = ['agency', 'context', 'safety'];

export const AGENT_TRAINING_SLIDES: TrainingSlideDefinition[] = [
  agentOpeningSlide,
  ...AGENT_TRAINING_TRACK_ORDER.flatMap((trackId) => [
    createTrackSlide(trackId),
    ...LEARNING_LABS.filter((lab) => lab.track === trackId).flatMap((lab) => {
      const narrative = narrativeByLab[lab.id];
      if (!narrative) throw new Error(`Missing agent narrative ${lab.id}`);
      return createLabSlides(narrative);
    }),
  ]),
  agentRecapSlide,
];

export const AGENT_EXERCISE_SLIDE_BY_LAB = Object.fromEntries(
  AGENT_TRAINING_SLIDES.flatMap((slide, index) => slide.kind === 'exercise' && slide.labId ? [[slide.labId, index + 1]] : []),
) as Partial<Record<LearningLabId, number>>;
