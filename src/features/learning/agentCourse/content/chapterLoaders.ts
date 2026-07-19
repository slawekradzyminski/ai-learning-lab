import type { AgentCourseLessonId } from '../agentCourseCatalog';
import type { CourseTheoryChapter } from '../../course/content/theoryTypes';

type ChapterLoader = () => Promise<CourseTheoryChapter>;

export const AGENT_CHAPTER_LOADERS: Record<AgentCourseLessonId, ChapterLoader> = {
  'agent-loop': () => import('./chapters/agentLoop').then(({ AGENT_LOOP_CHAPTER }) => AGENT_LOOP_CHAPTER),
  subagents: () => import('./chapters/subagents').then(({ SUBAGENTS_CHAPTER }) => SUBAGENTS_CHAPTER),
  'context-harness': () => import('./chapters/contextHarness').then(({ CONTEXT_HARNESS_CHAPTER }) => CONTEXT_HARNESS_CHAPTER),
  'memory-instructions': () => import('./chapters/memoryInstructions').then(({ MEMORY_INSTRUCTIONS_CHAPTER }) => MEMORY_INSTRUCTIONS_CHAPTER),
  'hooks-lifecycle': () => import('./chapters/hooksLifecycle').then(({ HOOKS_LIFECYCLE_CHAPTER }) => HOOKS_LIFECYCLE_CHAPTER),
  'tool-boundaries': () => import('./chapters/toolBoundaries').then(({ TOOL_BOUNDARIES_CHAPTER }) => TOOL_BOUNDARIES_CHAPTER),
  'agent-evals': () => import('./chapters/agentEvals').then(({ AGENT_EVALS_CHAPTER }) => AGENT_EVALS_CHAPTER),
  capstone: () => import('./chapters/capstone').then(({ AGENT_CAPSTONE_CHAPTER }) => AGENT_CAPSTONE_CHAPTER),
};
