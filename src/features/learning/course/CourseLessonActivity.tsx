import { lazy, Suspense } from 'react';
import type { LlmCourseLesson } from './llmCourseCatalog';
import { CapstoneActivity } from './CapstoneActivity';
import { PredictionActivity } from './PredictionActivity';
import { TokenEmbeddingActivity } from './TokenEmbeddingActivity';
import { TrainingActivity } from './TrainingActivity';
import { TransformerBlockActivity } from './TransformerBlockActivity';

const AttentionLabPage = lazy(() => import('../AttentionLabPage').then(({ AttentionLabPage }) => ({ default: AttentionLabPage })));
const KvCacheLabPage = lazy(() => import('../KvCacheLabPage').then(({ KvCacheLabPage }) => ({ default: KvCacheLabPage })));
const NextTokenLabPage = lazy(() => import('../NextTokenLabPage').then(({ NextTokenLabPage }) => ({ default: NextTokenLabPage })));
const ResidualStreamLabPage = lazy(() => import('../ResidualStreamLabPage').then(({ ResidualStreamLabPage }) => ({ default: ResidualStreamLabPage })));
const TokenizationLabPage = lazy(() => import('../TokenizationLabPage').then(({ TokenizationLabPage }) => ({ default: TokenizationLabPage })));

function EmbeddedLabFallback() {
  return <div className="border-y border-stone-200 py-10 text-sm text-slate-500" aria-live="polite">Loading the experiment…</div>;
}

export function CourseLessonActivity({ lesson }: { lesson: LlmCourseLesson }) {
  if (lesson.activity === 'prediction') return <PredictionActivity />;
  if (lesson.activity === 'token-embeddings') return <TokenEmbeddingActivity />;
  if (lesson.activity === 'transformer-block') return <TransformerBlockActivity />;
  if (lesson.activity === 'training') return <TrainingActivity />;
  if (lesson.activity === 'capstone') return <CapstoneActivity />;

  if (lesson.labId === 'tokenization') return <Suspense fallback={<EmbeddedLabFallback />}><TokenizationLabPage embedded /></Suspense>;
  if (lesson.labId === 'attention') return <Suspense fallback={<EmbeddedLabFallback />}><AttentionLabPage embedded /></Suspense>;
  if (lesson.labId === 'residual-stream') return <Suspense fallback={<EmbeddedLabFallback />}><ResidualStreamLabPage embedded /></Suspense>;
  if (lesson.labId === 'next-token') return <Suspense fallback={<EmbeddedLabFallback />}><NextTokenLabPage embedded /></Suspense>;
  if (lesson.labId === 'kv-cache') return <Suspense fallback={<EmbeddedLabFallback />}><KvCacheLabPage embedded /></Suspense>;
  return null;
}
