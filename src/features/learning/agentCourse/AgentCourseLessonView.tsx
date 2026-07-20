import { BookOpen, FlaskConical } from 'lucide-react';
import { LearningCheckpoint } from '../LearningCheckpoint';
import type { AgentCourseLesson } from './agentCourseCatalog';
import { AgentCourseActivity } from './AgentCourseActivity';
import { AgentCourseLessonNotes } from './AgentCourseLessonNotes';

export function AgentCourseLessonView({ lesson, onComplete }: { lesson: AgentCourseLesson; onComplete: () => void }) {
  return (
    <div className="space-y-10 learning-enter" data-testid="agent-course-lesson-view">
      <div className="grid gap-4 border-b border-stone-300 pb-6 text-sm md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center" data-testid="agent-course-representation-contract">
        <div><p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-slate-400">Available now</p><p className="mt-2 font-semibold text-slate-950">{lesson.inputRepresentation}</p></div>
        <span className="hidden text-slate-300 md:block">→</span>
        <div><p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-amber-700">Controlled transition</p><p className="mt-2 font-semibold text-slate-950">{lesson.operation}</p></div>
        <span className="hidden text-slate-300 md:block">→</span>
        <div><p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-slate-400">Evidence afterward</p><p className="mt-2 font-semibold text-slate-950">{lesson.outputRepresentation}</p></div>
      </div>

      <nav className="flex flex-wrap items-center gap-x-7 gap-y-3 border-b border-stone-200 pb-5 text-xs font-semibold" aria-label="Lesson materials">
        <a href="#agent-lesson-experiment" className="inline-flex items-center gap-2 text-slate-600 hover:text-amber-700"><FlaskConical className="h-3.5 w-3.5" /> Experiment</a>
        <a href="#agent-lesson-theory" className="inline-flex items-center gap-2 text-slate-600 hover:text-amber-700"><BookOpen className="h-3.5 w-3.5" /> Complete theory</a>
      </nav>

      <div id="agent-lesson-experiment" className="scroll-mt-20"><AgentCourseActivity lesson={lesson} /></div>
      <div id="agent-lesson-theory" className="scroll-mt-20"><AgentCourseLessonNotes lesson={lesson} /></div>
      <LearningCheckpoint id={`agent-course-${lesson.id}`} eyebrow="Check your understanding" {...lesson.checkpoint} onCorrect={onComplete} compact />
      <p className="border-l-2 border-amber-500 pl-5 text-sm leading-7 text-slate-600" data-testid="agent-course-forward-bridge"><span className="font-semibold text-slate-900">Next:</span> {lesson.bridgeForward}</p>
    </div>
  );
}
