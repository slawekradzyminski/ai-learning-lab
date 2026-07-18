import type { LearningLabId, LearningTrackId } from '../learningCatalog';
import { agentLabTheory, agentTrackTheory } from './agentTheory';
import { llmLabTheory, llmTrackTheory } from './llmTheory';
import type { LabTheory, TrackTheory } from './types';

const labTheory = [...llmLabTheory, ...agentLabTheory];
const trackTheory = [...llmTrackTheory, ...agentTrackTheory];

export function getLabTheory(labId: LearningLabId): LabTheory {
  const theory = labTheory.find((entry) => entry.labId === labId);
  if (!theory) throw new Error(`Missing training guide theory for ${labId}`);
  return theory;
}

export function getTrackTheory(trackId: LearningTrackId): TrackTheory {
  const theory = trackTheory.find((entry) => entry.trackId === trackId);
  if (!theory) throw new Error(`Missing training guide theory for track ${trackId}`);
  return theory;
}
