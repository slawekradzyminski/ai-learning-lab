export type TeachingMomentKind = 'hook' | 'mechanism' | 'practice' | 'debrief';

export type TeachingMomentStep = {
  label: string;
  expression: string;
  copy: string;
};

export type TeachingMoment = {
  id: string;
  kind: TeachingMomentKind;
  eyebrow: string;
  title: string;
  summary: string;
  steps?: TeachingMomentStep[];
  prompt?: string;
  takeaway: string;
  presenterCue: string;
};

export type LessonTeachingMoments = {
  lessonId: string;
  moments: [TeachingMoment, TeachingMoment, TeachingMoment, TeachingMoment];
};

export const TEACHING_MOMENT_ORDER: TeachingMomentKind[] = ['hook', 'mechanism', 'practice', 'debrief'];
