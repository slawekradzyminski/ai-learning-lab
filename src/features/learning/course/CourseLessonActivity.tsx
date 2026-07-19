import { AttentionLabPage } from '../AttentionLabPage';
import { KvCacheLabPage } from '../KvCacheLabPage';
import { NextTokenLabPage } from '../NextTokenLabPage';
import { ResidualStreamLabPage } from '../ResidualStreamLabPage';
import { TokenizationLabPage } from '../TokenizationLabPage';
import type { LlmCourseLesson } from './llmCourseCatalog';
import { CapstoneActivity } from './CapstoneActivity';
import { PredictionActivity } from './PredictionActivity';
import { TokenEmbeddingActivity } from './TokenEmbeddingActivity';
import { TrainingActivity } from './TrainingActivity';
import { TransformerBlockActivity } from './TransformerBlockActivity';

export function CourseLessonActivity({ lesson }: { lesson: LlmCourseLesson }) {
  if (lesson.activity === 'prediction') return <PredictionActivity />;
  if (lesson.activity === 'token-embeddings') return <TokenEmbeddingActivity />;
  if (lesson.activity === 'transformer-block') return <TransformerBlockActivity />;
  if (lesson.activity === 'training') return <TrainingActivity />;
  if (lesson.activity === 'capstone') return <CapstoneActivity />;

  if (lesson.labId === 'tokenization') return <TokenizationLabPage embedded />;
  if (lesson.labId === 'attention') return <AttentionLabPage embedded />;
  if (lesson.labId === 'residual-stream') return <ResidualStreamLabPage embedded />;
  if (lesson.labId === 'next-token') return <NextTokenLabPage embedded />;
  if (lesson.labId === 'kv-cache') return <KvCacheLabPage embedded />;
  return null;
}
