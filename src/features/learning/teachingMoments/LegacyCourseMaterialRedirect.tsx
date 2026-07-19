import { Navigate, useSearchParams } from 'react-router-dom';
import { getAgentCourseRoute } from '../agentCourse/agentCourseCatalog';
import type { AgentCourseLessonId } from '../agentCourse/agentCourseTypes';
import { getLlmCourseRoute, type LlmCourseLessonId } from '../course/llmCourseCatalog';
import type { TeachingMomentKind } from './types';

type LegacyTarget = { lessonId: string; kind: TeachingMomentKind };

const momentKinds: TeachingMomentKind[] = ['hook', 'mechanism', 'practice', 'debrief'];

function blockTarget(slide: number, firstSlide: number, lessonId: string): LegacyTarget {
  return { lessonId, kind: momentKinds[Math.max(0, Math.min(3, slide - firstSlide))] };
}

function agentTarget(slide: number): LegacyTarget {
  if (slide <= 2) return { lessonId: 'agent-loop', kind: 'hook' };
  if (slide <= 6) return blockTarget(slide, 3, 'agent-loop');
  if (slide <= 10) return blockTarget(slide, 7, 'subagents');
  if (slide === 11) return { lessonId: 'context-harness', kind: 'hook' };
  if (slide <= 15) return blockTarget(slide, 12, 'context-harness');
  if (slide <= 19) return blockTarget(slide, 16, 'memory-instructions');
  if (slide === 20) return { lessonId: 'hooks-lifecycle', kind: 'hook' };
  if (slide <= 24) return blockTarget(slide, 21, 'hooks-lifecycle');
  if (slide <= 28) return blockTarget(slide, 25, 'tool-boundaries');
  if (slide <= 32) return blockTarget(slide, 29, 'agent-evals');
  return { lessonId: 'capstone', kind: 'debrief' };
}

function llmTarget(slide: number): LegacyTarget {
  if (slide <= 1) return { lessonId: 'prediction-goal', kind: 'hook' };
  if (slide <= 6) return blockTarget(Math.max(slide, 3), 3, 'tokenization');
  if (slide <= 10) return blockTarget(slide, 7, 'attention');
  if (slide <= 14) return blockTarget(slide, 11, 'residual-stream');
  if (slide <= 18) return blockTarget(slide, 15, 'language-model-head');
  if (slide <= 22) return blockTarget(slide, 19, 'generation-cache');
  if (slide <= 27) return blockTarget(Math.max(slide, 24), 24, 'token-embeddings');
  if (slide <= 40) return blockTarget(29 + ((slide - 29 + 4) % 4), 29, 'learning');
  if (slide <= 44) return blockTarget(slide, 41, 'transformer-block');
  return { lessonId: 'capstone', kind: slide >= 53 ? 'debrief' : 'practice' };
}

export function LegacyCourseMaterialRedirect({ curriculum, notes = false }: { curriculum: 'llm' | 'agent'; notes?: boolean }) {
  const [searchParams] = useSearchParams();
  const requested = Number(searchParams.get('slide') ?? '1');
  const slide = Number.isFinite(requested) ? Math.max(1, Math.trunc(requested)) : 1;
  const target = curriculum === 'agent' ? agentTarget(slide) : llmTarget(slide);
  const route = curriculum === 'agent'
    ? getAgentCourseRoute(target.lessonId as AgentCourseLessonId)
    : getLlmCourseRoute(target.lessonId as LlmCourseLessonId);
  const notesQuery = notes ? '&notes=1' : '';
  return <Navigate to={`${route}?view=present&moment=${target.lessonId}/${target.kind}${notesQuery}`} replace />;
}
