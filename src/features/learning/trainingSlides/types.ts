import type { ReactNode } from 'react';
import type { LearningLabId, LearningTrackId } from '../learningCatalog';

export type TrainingSlideKind =
  | 'opening'
  | 'track'
  | 'hook'
  | 'mechanism'
  | 'exercise'
  | 'debrief'
  | 'recap';

export type TrainingSlideDefinition = {
  id: string;
  kind: TrainingSlideKind;
  trackId?: LearningTrackId;
  labId?: LearningLabId;
  chapterLabel: string;
  kicker: string;
  title: string;
  content: ReactNode;
  notes: string;
};

type MechanismStep = {
  label: string;
  expression: string;
  copy: string;
};

export type LabNarrative = {
  id: LearningLabId;
  chapter: string;
  hookTitle: string;
  hookCopy: string;
  hookPrompt: string;
  mechanismTitle: string;
  mechanismSteps: MechanismStep[];
  mechanismConclusion: string;
  exerciseTitle: string;
  duration: string;
  tasks: string[];
  returnQuestion: string;
  takeaway: string;
  limitation: string;
  bridge: string;
  hookNotes: string;
  mechanismNotes: string;
  exerciseNotes: string;
  debriefNotes: string;
};
