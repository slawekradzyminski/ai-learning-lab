import type { LlmCourseLessonId } from '../llmCourseCatalog';
import type { CourseTheoryChapter } from './theoryTypes';

type ChapterLoader = () => Promise<CourseTheoryChapter>;

export const COURSE_CHAPTER_LOADERS = {
  'prediction-goal': () => import('./chapters/predictionGoal').then(({ PREDICTION_GOAL_CHAPTER }) => PREDICTION_GOAL_CHAPTER),
  tokenization: () => import('./chapters/tokenization').then(({ TOKENIZATION_CHAPTER }) => TOKENIZATION_CHAPTER),
  'token-embeddings': () => import('./chapters/tokenEmbeddings').then(({ TOKEN_EMBEDDINGS_CHAPTER }) => TOKEN_EMBEDDINGS_CHAPTER),
  'transformer-block': () => import('./chapters/transformerBlock').then(({ TRANSFORMER_BLOCK_CHAPTER }) => TRANSFORMER_BLOCK_CHAPTER),
  attention: () => import('./chapters/attention').then(({ ATTENTION_CHAPTER }) => ATTENTION_CHAPTER),
  'residual-stream': () => import('./chapters/residualStream').then(({ RESIDUAL_STREAM_CHAPTER }) => RESIDUAL_STREAM_CHAPTER),
  'language-model-head': () => import('./chapters/languageModelHead').then(({ LANGUAGE_MODEL_HEAD_CHAPTER }) => LANGUAGE_MODEL_HEAD_CHAPTER),
  'generation-cache': () => import('./chapters/generationCache').then(({ GENERATION_CACHE_CHAPTER }) => GENERATION_CACHE_CHAPTER),
  learning: () => import('./chapters/learning').then(({ LEARNING_CHAPTER }) => LEARNING_CHAPTER),
  capstone: () => import('./chapters/capstone').then(({ CAPSTONE_CHAPTER }) => CAPSTONE_CHAPTER),
} satisfies Record<LlmCourseLessonId, ChapterLoader>;
