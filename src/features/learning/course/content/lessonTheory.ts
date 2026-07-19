import { FOUNDATION_THEORY } from './theoryFoundations';
import { INFERENCE_THEORY } from './theoryInference';

export const LESSON_THEORY = {
  ...FOUNDATION_THEORY,
  ...INFERENCE_THEORY,
};

export type { CourseTheory, CourseTheorySource } from './theoryTypes';
