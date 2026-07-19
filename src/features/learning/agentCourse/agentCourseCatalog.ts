import type { CourseCheckpoint } from '../course/llmCourseCatalog';
import type { CourseTheory } from '../course/content/theoryTypes';
import { AGENT_LESSON_THEORY } from './content/agentLessonTheory';
import type { AgentCourseLessonId } from './agentCourseTypes';

export type { AgentCourseLessonId } from './agentCourseTypes';

export type AgentCourseLesson = {
  id: AgentCourseLessonId;
  stage: string;
  shortTitle: string;
  title: string;
  question: string;
  inputRepresentation: string;
  operation: string;
  outputRepresentation: string;
  educational: CourseTheory;
  activity: AgentCourseLessonId;
  checkpoint: CourseCheckpoint;
  bridgeForward: string;
  slide?: number;
};

export const AGENT_COURSE_LESSONS: AgentCourseLesson[] = [
  {
    id: 'agent-loop', stage: 'loop', shortTitle: 'The controlled loop', title: 'The runtime turns proposals into observable steps.',
    question: 'What makes an LLM response become an agent run?',
    inputRepresentation: 'Goal + current evidence + runtime state', operation: 'Propose → validate → execute → observe → decide', outputRepresentation: 'A new trace event, final answer, or explicit stop',
    educational: AGENT_LESSON_THEORY['agent-loop'], activity: 'agent-loop', slide: 4,
    checkpoint: { question: 'Who should decide whether a proposed tool call actually executes?', choices: [{ value: 'model', label: 'The language model' }, { value: 'harness', label: 'The deterministic harness' }, { value: 'tool', label: 'The tool result' }], correctValue: 'harness', explanation: 'The model proposes. Application code validates identity, permissions, schemas, policy, and budgets before any effect occurs.' },
    bridgeForward: 'Once one loop is visible, we can safely ask when parts of the work should be delegated to bounded workers.',
  },
  {
    id: 'subagents', stage: 'delegate', shortTitle: 'Delegate with contracts', title: 'Parallel workers return evidence, not authority.',
    question: 'When does another agent reduce work instead of multiplying uncertainty?',
    inputRepresentation: 'A decomposable objective + context packet', operation: 'Assign bounded contracts, run workers, verify and reconcile', outputRepresentation: 'Inspectible artifacts integrated by the parent',
    educational: AGENT_LESSON_THEORY.subagents, activity: 'subagents', slide: 8,
    checkpoint: { question: 'What remains the parent agent’s responsibility after delegation?', choices: [{ value: 'none', label: 'Nothing—the child owns its conclusion' }, { value: 'integration', label: 'Verification and integration' }, { value: 'speed', label: 'Only measuring execution time' }], correctValue: 'integration', explanation: 'A parent can delegate investigation, but it still owns conflict resolution, evidence checking, and the final claim.' },
    bridgeForward: 'Every worker and every turn needs a carefully constructed working set, so the next lesson opens the context harness.',
  },
  {
    id: 'context-harness', stage: 'context', shortTitle: 'Construct the working set', title: 'The harness selects what the model can see now.',
    question: 'Which evidence belongs in the next model call—and under whose authority?',
    inputRepresentation: 'Instructions, history, state, retrieved evidence, tool definitions', operation: 'Select, rank, label, compress, and budget', outputRepresentation: 'A turn-specific context packet with provenance',
    educational: AGENT_LESSON_THEORY['context-harness'], activity: 'context-harness', slide: 13,
    checkpoint: { question: 'What does a larger context window solve by itself?', choices: [{ value: 'capacity', label: 'Only capacity to include more material' }, { value: 'authority', label: 'Authority conflicts' }, { value: 'freshness', label: 'Evidence freshness' }], correctValue: 'capacity', explanation: 'More capacity does not establish relevance, provenance, authority, ordering, freshness, or safe treatment of untrusted text.' },
    bridgeForward: 'Context is temporary. The next lesson separates instructions, run state, durable memory, and external sources of truth.',
  },
  {
    id: 'memory-instructions', stage: 'memory', shortTitle: 'Place knowledge deliberately', title: 'Authority and lifetime determine where information belongs.',
    question: 'Should this fact be an instruction, working state, durable memory, or fetched evidence?',
    inputRepresentation: 'A fact + source + lifetime + sensitivity', operation: 'Classify authority, scope, expiry, and update path', outputRepresentation: 'A governed information placement',
    educational: AGENT_LESSON_THEORY['memory-instructions'], activity: 'memory-instructions', slide: 17,
    checkpoint: { question: 'Where should a current product price be treated as authoritative?', choices: [{ value: 'memory', label: 'Permanent model memory' }, { value: 'external', label: 'A freshly queried external source' }, { value: 'prompt', label: 'A static system instruction' }], correctValue: 'external', explanation: 'Prices are volatile external facts. A durable store may keep a timestamped snapshot, but it should not silently replace a fresh authoritative query.' },
    bridgeForward: 'Knowing where state belongs is not enforcement. We now add deterministic checks at named lifecycle events.',
  },
  {
    id: 'hooks-lifecycle', stage: 'hooks', shortTitle: 'Control lifecycle events', title: 'Deterministic hooks act before and after probabilistic steps.',
    question: 'At which event can a rule see enough—and still prevent the effect?',
    inputRepresentation: 'Lifecycle event + proposed or completed action', operation: 'Block, transform, validate, audit, or recover', outputRepresentation: 'A deterministic decision and trace record',
    educational: AGENT_LESSON_THEORY['hooks-lifecycle'], activity: 'hooks-lifecycle', slide: 22,
    checkpoint: { question: 'Which boundary can prevent a protected write?', choices: [{ value: 'pre', label: 'A pre-execution hook' }, { value: 'post', label: 'A post-execution formatter' }, { value: 'summary', label: 'A final-answer summary' }], correctValue: 'pre', explanation: 'Pre-execution is the last point with both the proposed arguments and control over whether the side effect occurs.' },
    bridgeForward: 'Hooks provide attachment points. The next lesson builds the full tool acceptance boundary around them.',
  },
  {
    id: 'tool-boundaries', stage: 'tools', shortTitle: 'Mediate every effect', title: 'A proposed tool call is untrusted data, not permission.',
    question: 'What must happen between a model proposal and a real side effect?',
    inputRepresentation: 'Tool name + structured arguments + principal + current policy', operation: 'Parse, validate, authorize, approve, execute, sanitize', outputRepresentation: 'Denied proposal or bounded effect + observation',
    educational: AGENT_LESSON_THEORY['tool-boundaries'], activity: 'tool-boundaries', slide: 26,
    checkpoint: { question: 'Which principle most directly limits blast radius?', choices: [{ value: 'more-tools', label: 'Expose every available tool' }, { value: 'least', label: 'Least functionality and privilege' }, { value: 'prompt', label: 'Repeat the safety prompt' }], correctValue: 'least', explanation: 'Minimizing functionality, permissions, scope, and autonomy reduces what a mistaken or manipulated proposal can affect.' },
    bridgeForward: 'A safe-looking design is still a hypothesis. The next lesson measures outcomes, traces, reliability, cost, and forbidden effects.',
  },
  {
    id: 'agent-evals', stage: 'evals', shortTitle: 'Measure trajectories', title: 'A final answer is only one part of an agent evaluation.',
    question: 'How do we know the agent is reliable rather than lucky?',
    inputRepresentation: 'Versioned tasks + environment + model + harness + budgets', operation: 'Run repeated trials and grade outcomes, traces, effects, cost, and risk', outputRepresentation: 'Evidence with uncertainty and failure taxonomy',
    educational: AGENT_LESSON_THEORY['agent-evals'], activity: 'agent-evals', slide: 30,
    checkpoint: { question: 'Why repeat the same agent evaluation?', choices: [{ value: 'length', label: 'To make the transcript longer' }, { value: 'variance', label: 'To observe stochastic reliability and failure variance' }, { value: 'memory', label: 'To train durable memory automatically' }], correctValue: 'variance', explanation: 'Agent behavior varies across runs. Repetition estimates reliability and exposes intermittent unsafe, costly, or incomplete trajectories.' },
    bridgeForward: 'The capstone now asks you to design the full research agent and defend every boundary with evidence.',
  },
  {
    id: 'capstone', stage: 'system', shortTitle: 'Defend the whole system', title: 'Integrate the loop, context, boundaries, and evaluation.',
    question: 'Can you prove that the research agent is useful without giving it purchase authority?',
    inputRepresentation: 'Research goal + tools + policies + evaluation contract', operation: 'Design, trace, threat-model, and test the complete agent', outputRepresentation: 'A reviewable architecture and acceptance evidence',
    educational: AGENT_LESSON_THEORY.capstone, activity: 'capstone', slide: 33,
    checkpoint: { question: 'What is fixed during one ordinary agent run?', choices: [{ value: 'context', label: 'The turn context' }, { value: 'trace', label: 'The event trace' }, { value: 'policy', label: 'The configured permission policy' }], correctValue: 'policy', explanation: 'Context and trace evolve. The configured policy should remain a stable boundary unless an authorized application-level change explicitly replaces it.' },
    bridgeForward: 'Re-run the design with a different task, compare its risk surface, or return to the LLM course to inspect the policy inside each model turn.',
  },
];

export function getAgentCourseLesson(id: string | undefined) {
  return AGENT_COURSE_LESSONS.find((lesson) => lesson.id === id);
}

export function getAgentCourseRoute(id: AgentCourseLessonId) {
  return `/learn/how-ai-agent-works/course/${id}`;
}
