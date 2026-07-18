import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AgentEvalsLabPage } from './features/learning/AgentEvalsLabPage';
import { AgentLoopLabPage } from './features/learning/AgentLoopLabPage';
import { AttentionLabPage } from './features/learning/AttentionLabPage';
import { BackpropagationLabPage } from './features/learning/BackpropagationLabPage';
import { ContextHarnessLabPage } from './features/learning/ContextHarnessLabPage';
import { CourseMaterialsPage } from './features/learning/CourseMaterialsPage';
import { ConvolutionLabPage } from './features/learning/ConvolutionLabPage';
import { DepthLabPage } from './features/learning/DepthLabPage';
import { DigitLabPage } from './features/learning/DigitLabPage';
import { EmbeddingsLabPage } from './features/learning/EmbeddingsLabPage';
import { GradientDescentLabPage } from './features/learning/GradientDescentLabPage';
import { HooksLifecycleLabPage } from './features/learning/HooksLifecycleLabPage';
import { KvCacheLabPage } from './features/learning/KvCacheLabPage';
import { LearningHomePage } from './features/learning/LearningHomePage';
import { LearningLayout } from './features/learning/LearningLayout';
import { MemoryInstructionsLabPage } from './features/learning/MemoryInstructionsLabPage';
import { NextTokenLabPage } from './features/learning/NextTokenLabPage';
import { PerceptronLabPage } from './features/learning/PerceptronLabPage';
import { ResidualStreamLabPage } from './features/learning/ResidualStreamLabPage';
import { SubagentsLabPage } from './features/learning/SubagentsLabPage';
import { TokenizationLabPage } from './features/learning/TokenizationLabPage';
import { ToolBoundariesLabPage } from './features/learning/ToolBoundariesLabPage';
import { TrainingSlidesPage } from './features/learning/TrainingSlidesPage';

const TrainingGuidePage = lazy(() => import('./features/learning/TrainingGuidePage').then((module) => ({ default: module.TrainingGuidePage })));

function Guide({ curriculum }: { curriculum: 'llm' | 'agent' }) {
  return (
    <Suspense fallback={<div className="min-h-[50svh] animate-pulse bg-white/40" aria-label="Loading guide" />}>
      <TrainingGuidePage curriculum={curriculum} />
    </Suspense>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/learn" replace />} />
      <Route path="/learn" element={<LearningLayout />}>
        <Route index element={<LearningHomePage />} />
        <Route path="tokenization" element={<TokenizationLabPage />} />
        <Route path="attention" element={<AttentionLabPage />} />
        <Route path="residual-stream" element={<ResidualStreamLabPage />} />
        <Route path="next-token" element={<NextTokenLabPage />} />
        <Route path="kv-cache" element={<KvCacheLabPage />} />
        <Route path="embeddings" element={<EmbeddingsLabPage />} />
        <Route path="perceptron" element={<PerceptronLabPage />} />
        <Route path="gradient-descent" element={<GradientDescentLabPage />} />
        <Route path="backpropagation" element={<BackpropagationLabPage />} />
        <Route path="depth" element={<DepthLabPage />} />
        <Route path="convolution" element={<ConvolutionLabPage />} />
        <Route path="digits" element={<DigitLabPage />} />
        <Route path="agent-loop" element={<AgentLoopLabPage />} />
        <Route path="subagents" element={<SubagentsLabPage />} />
        <Route path="context-harness" element={<ContextHarnessLabPage />} />
        <Route path="memory-instructions" element={<MemoryInstructionsLabPage />} />
        <Route path="hooks-lifecycle" element={<HooksLifecycleLabPage />} />
        <Route path="tool-boundaries" element={<ToolBoundariesLabPage />} />
        <Route path="agent-evals" element={<AgentEvalsLabPage />} />
        <Route path="training-slides" element={<TrainingSlidesPage />} />
        <Route path="how-llm-works/slides" element={<TrainingSlidesPage />} />
        <Route path="how-llm-works/guide" element={<Guide curriculum="llm" />} />
        <Route path="how-llm-works/materials" element={<CourseMaterialsPage curriculum="llm" />} />
        <Route path="how-ai-agent-works/slides" element={<TrainingSlidesPage curriculum="agent" />} />
        <Route path="how-ai-agent-works/guide" element={<Guide curriculum="agent" />} />
        <Route path="how-ai-agent-works/materials" element={<CourseMaterialsPage curriculum="agent" />} />
        <Route path="*" element={<Navigate to="/learn" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/learn" replace />} />
    </Routes>
  );
}
