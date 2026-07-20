import { lazy, Suspense } from 'react';
import type { AgentCourseLesson } from './agentCourseCatalog';
import { AgentCourseCapstoneActivity } from './AgentCourseCapstoneActivity';

const AgentEvalsLabPage = lazy(() => import('../AgentEvalsLabPage').then(({ AgentEvalsLabPage }) => ({ default: AgentEvalsLabPage })));
const AgentLoopLabPage = lazy(() => import('../AgentLoopLabPage').then(({ AgentLoopLabPage }) => ({ default: AgentLoopLabPage })));
const ContextHarnessLabPage = lazy(() => import('../ContextHarnessLabPage').then(({ ContextHarnessLabPage }) => ({ default: ContextHarnessLabPage })));
const HooksLifecycleLabPage = lazy(() => import('../HooksLifecycleLabPage').then(({ HooksLifecycleLabPage }) => ({ default: HooksLifecycleLabPage })));
const MemoryInstructionsLabPage = lazy(() => import('../MemoryInstructionsLabPage').then(({ MemoryInstructionsLabPage }) => ({ default: MemoryInstructionsLabPage })));
const SubagentsLabPage = lazy(() => import('../SubagentsLabPage').then(({ SubagentsLabPage }) => ({ default: SubagentsLabPage })));
const ToolBoundariesLabPage = lazy(() => import('../ToolBoundariesLabPage').then(({ ToolBoundariesLabPage }) => ({ default: ToolBoundariesLabPage })));

function AgentLabFallback() {
  return <div className="border-y border-stone-200 py-10 text-sm text-slate-500" aria-live="polite">Loading the experiment…</div>;
}

export function AgentCourseActivity({ lesson }: { lesson: AgentCourseLesson }) {
  switch (lesson.activity) {
    case 'agent-loop': return <Suspense fallback={<AgentLabFallback />}><AgentLoopLabPage /></Suspense>;
    case 'subagents': return <Suspense fallback={<AgentLabFallback />}><SubagentsLabPage /></Suspense>;
    case 'context-harness': return <Suspense fallback={<AgentLabFallback />}><ContextHarnessLabPage /></Suspense>;
    case 'memory-instructions': return <Suspense fallback={<AgentLabFallback />}><MemoryInstructionsLabPage /></Suspense>;
    case 'hooks-lifecycle': return <Suspense fallback={<AgentLabFallback />}><HooksLifecycleLabPage /></Suspense>;
    case 'tool-boundaries': return <Suspense fallback={<AgentLabFallback />}><ToolBoundariesLabPage /></Suspense>;
    case 'agent-evals': return <Suspense fallback={<AgentLabFallback />}><AgentEvalsLabPage /></Suspense>;
    case 'capstone': return <AgentCourseCapstoneActivity />;
  }
}
