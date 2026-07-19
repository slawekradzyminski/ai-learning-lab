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
import { AuthBoundary } from './auth/AuthBoundary';
import { LlmCoursePage } from './features/learning/course/LlmCoursePage';
import { LLM_COURSE_LESSONS, getLlmCourseRoute } from './features/learning/course/llmCourseCatalog';
import { AgentCoursePage } from './features/learning/agentCourse/AgentCoursePage';
import { AGENT_COURSE_LESSONS, getAgentCourseRoute } from './features/learning/agentCourse/agentCourseCatalog';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/learn" replace />} />
      <Route path="/learn" element={<AuthBoundary><LearningLayout /></AuthBoundary>}>
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
        <Route path="*" element={<Navigate to="/learn" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/learn" replace />} />
    </Routes>
  );
}
