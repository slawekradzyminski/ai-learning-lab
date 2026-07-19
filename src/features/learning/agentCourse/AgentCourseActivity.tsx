import { AgentEvalsLabPage } from '../AgentEvalsLabPage';
import { AgentLoopLabPage } from '../AgentLoopLabPage';
import { ContextHarnessLabPage } from '../ContextHarnessLabPage';
import { HooksLifecycleLabPage } from '../HooksLifecycleLabPage';
import { MemoryInstructionsLabPage } from '../MemoryInstructionsLabPage';
import { SubagentsLabPage } from '../SubagentsLabPage';
import { ToolBoundariesLabPage } from '../ToolBoundariesLabPage';
import type { AgentCourseLesson } from './agentCourseCatalog';
import { AgentCourseCapstoneActivity } from './AgentCourseCapstoneActivity';

export function AgentCourseActivity({ lesson }: { lesson: AgentCourseLesson }) {
  switch (lesson.activity) {
    case 'agent-loop': return <AgentLoopLabPage />;
    case 'subagents': return <SubagentsLabPage />;
    case 'context-harness': return <ContextHarnessLabPage />;
    case 'memory-instructions': return <MemoryInstructionsLabPage />;
    case 'hooks-lifecycle': return <HooksLifecycleLabPage />;
    case 'tool-boundaries': return <ToolBoundariesLabPage />;
    case 'agent-evals': return <AgentEvalsLabPage />;
    case 'capstone': return <AgentCourseCapstoneActivity />;
  }
}
