import type { LearningLabId, LearningTrackId } from '../learningCatalog';

export type GuideSource = {
  label: string;
  url?: string;
};

export type LabTheory = {
  labId: LearningLabId;
  premise: string;
  mathematics: string;
  mechanism: string;
  exercise: string;
  debrief: string;
  diagram: string;
  sources: GuideSource[];
};

export type TrackTheory = {
  trackId: LearningTrackId;
  premise: string;
  mathematics: string;
  diagram: string;
  sources: GuideSource[];
};
