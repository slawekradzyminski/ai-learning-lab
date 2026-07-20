import { lazy, Suspense } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { LearningLayout } from './features/learning/LearningLayout';
import { AuthBoundary } from './auth/AuthBoundary';
import { LLM_COURSE_LESSONS, getLlmCourseRoute } from './features/learning/course/llmCourseCatalog';
import { AGENT_COURSE_LESSONS, getAgentCourseRoute } from './features/learning/agentCourse/agentCourseCatalog';

const AgentEvalsLabPage = lazy(() => import('./features/learning/AgentEvalsLabPage').then(({ AgentEvalsLabPage }) => ({ default: AgentEvalsLabPage })));
const AgentLoopLabPage = lazy(() => import('./features/learning/AgentLoopLabPage').then(({ AgentLoopLabPage }) => ({ default: AgentLoopLabPage })));
const AttentionLabPage = lazy(() => import('./features/learning/AttentionLabPage').then(({ AttentionLabPage }) => ({ default: AttentionLabPage })));
const BackpropagationLabPage = lazy(() => import('./features/learning/BackpropagationLabPage').then(({ BackpropagationLabPage }) => ({ default: BackpropagationLabPage })));
const ContextHarnessLabPage = lazy(() => import('./features/learning/ContextHarnessLabPage').then(({ ContextHarnessLabPage }) => ({ default: ContextHarnessLabPage })));
const CourseMaterialsPage = lazy(() => import('./features/learning/CourseMaterialsPage').then(({ CourseMaterialsPage }) => ({ default: CourseMaterialsPage })));
const ConvolutionLabPage = lazy(() => import('./features/learning/ConvolutionLabPage').then(({ ConvolutionLabPage }) => ({ default: ConvolutionLabPage })));
const DepthLabPage = lazy(() => import('./features/learning/DepthLabPage').then(({ DepthLabPage }) => ({ default: DepthLabPage })));
const DigitLabPage = lazy(() => import('./features/learning/DigitLabPage').then(({ DigitLabPage }) => ({ default: DigitLabPage })));
const EmbeddingsLabPage = lazy(() => import('./features/learning/EmbeddingsLabPage').then(({ EmbeddingsLabPage }) => ({ default: EmbeddingsLabPage })));
const GradientDescentLabPage = lazy(() => import('./features/learning/GradientDescentLabPage').then(({ GradientDescentLabPage }) => ({ default: GradientDescentLabPage })));
const HooksLifecycleLabPage = lazy(() => import('./features/learning/HooksLifecycleLabPage').then(({ HooksLifecycleLabPage }) => ({ default: HooksLifecycleLabPage })));
const KvCacheLabPage = lazy(() => import('./features/learning/KvCacheLabPage').then(({ KvCacheLabPage }) => ({ default: KvCacheLabPage })));
const LearningHomePage = lazy(() => import('./features/learning/LearningHomePage').then(({ LearningHomePage }) => ({ default: LearningHomePage })));
const MemoryInstructionsLabPage = lazy(() => import('./features/learning/MemoryInstructionsLabPage').then(({ MemoryInstructionsLabPage }) => ({ default: MemoryInstructionsLabPage })));
const NextTokenLabPage = lazy(() => import('./features/learning/NextTokenLabPage').then(({ NextTokenLabPage }) => ({ default: NextTokenLabPage })));
const PerceptronLabPage = lazy(() => import('./features/learning/PerceptronLabPage').then(({ PerceptronLabPage }) => ({ default: PerceptronLabPage })));
const ResidualStreamLabPage = lazy(() => import('./features/learning/ResidualStreamLabPage').then(({ ResidualStreamLabPage }) => ({ default: ResidualStreamLabPage })));
const SubagentsLabPage = lazy(() => import('./features/learning/SubagentsLabPage').then(({ SubagentsLabPage }) => ({ default: SubagentsLabPage })));
const TokenizationLabPage = lazy(() => import('./features/learning/TokenizationLabPage').then(({ TokenizationLabPage }) => ({ default: TokenizationLabPage })));
const ToolBoundariesLabPage = lazy(() => import('./features/learning/ToolBoundariesLabPage').then(({ ToolBoundariesLabPage }) => ({ default: ToolBoundariesLabPage })));
const LlmCoursePage = lazy(() => import('./features/learning/course/LlmCoursePage').then(({ LlmCoursePage }) => ({ default: LlmCoursePage })));
const AgentCoursePage = lazy(() => import('./features/learning/agentCourse/AgentCoursePage').then(({ AgentCoursePage }) => ({ default: AgentCoursePage })));

function LearningRouteBoundary() {
  return <Suspense fallback={<div className="border-y border-stone-200 py-12 text-sm text-slate-500" aria-live="polite">Loading learning module…</div>}><Outlet /></Suspense>;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/learn" replace />} />
      <Route path="/learn" element={<AuthBoundary><LearningLayout /></AuthBoundary>}>
        <Route element={<LearningRouteBoundary />}>
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
          <Route path="how-llm-works/course" element={<Navigate to={getLlmCourseRoute(LLM_COURSE_LESSONS[0].id)} replace />} />
          <Route path="how-llm-works/course/:lessonId" element={<LlmCoursePage />} />
          <Route path="how-llm-works/materials" element={<CourseMaterialsPage curriculum="llm" />} />
          <Route path="how-ai-agent-works/course" element={<Navigate to={getAgentCourseRoute(AGENT_COURSE_LESSONS[0].id)} replace />} />
          <Route path="how-ai-agent-works/course/:lessonId" element={<AgentCoursePage />} />
          <Route path="how-ai-agent-works/materials" element={<CourseMaterialsPage curriculum="agent" />} />
        </Route>
        <Route path="*" element={<Navigate to="/learn" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/learn" replace />} />
    </Routes>
  );
}
