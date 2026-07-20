import { BookOpen, CircleHelp, FlaskConical, Lightbulb } from 'lucide-react';
import { LearningCheckpoint } from '../LearningCheckpoint';
import { ExperimentHeading, MechanismBrief } from '../course/LessonSpine';
import type { AgentCourseLesson } from './agentCourseCatalog';
import { AgentCourseActivity } from './AgentCourseActivity';
import { AgentCourseLessonNotes } from './AgentCourseLessonNotes';

export function AgentCourseLessonView({ lesson, onComplete }: { lesson: AgentCourseLesson; onComplete: () => void }) {
  return (
    <div className="space-y-10 learning-enter" data-testid="agent-course-lesson-view">
      <nav className="flex flex-wrap items-center gap-x-7 gap-y-3 border-b border-stone-200 pb-5 text-xs font-semibold" aria-label="Lesson materials">
        <a href="#agent-lesson-intro" className="inline-flex items-center gap-2 text-slate-600 transition hover:text-amber-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-600"><Lightbulb className="h-3.5 w-3.5" /> Intro</a>
        <a href="#agent-lesson-experiment" className="inline-flex items-center gap-2 text-slate-600 transition hover:text-amber-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-600"><FlaskConical className="h-3.5 w-3.5" /> Experiment</a>
        <a href="#agent-lesson-question" className="inline-flex items-center gap-2 text-slate-600 transition hover:text-amber-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-600"><CircleHelp className="h-3.5 w-3.5" /> Question</a>
        <a href="#agent-lesson-theory" className="inline-flex items-center gap-2 text-slate-600 transition hover:text-amber-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-600"><BookOpen className="h-3.5 w-3.5" /> Deep dive</a>
      </nav>

      <div className="space-y-10" data-testid="agent-mandatory-lesson-spine">
        <div id="agent-lesson-intro" className="scroll-mt-20"><MechanismBrief content={lesson.educational} accent="amber" /></div>
        <div id="agent-lesson-experiment" className="scroll-mt-20 space-y-6">
          <ExperimentHeading evidence={{ label: 'Deterministic browser simulation', detail: `The ${lesson.shortTitle.toLowerCase()} experiment uses inspectable, repeatable teaching data. It does not claim to be a live agent trajectory.` }} accent="amber" />
          <AgentCourseActivity lesson={lesson} />
        </div>
        <div id="agent-lesson-question" className="scroll-mt-20"><LearningCheckpoint id={`agent-course-${lesson.id}`} eyebrow="03 · Check your understanding" {...lesson.checkpoint} onCorrect={onComplete} compact /></div>
      </div>
      <div id="agent-lesson-theory" className="scroll-mt-20"><AgentCourseLessonNotes lesson={lesson} /></div>
      <p className="border-l-2 border-amber-500 pl-5 text-sm leading-7 text-slate-600" data-testid="agent-course-forward-bridge"><span className="font-semibold text-slate-900">Next:</span> {lesson.bridgeForward}</p>
    </div>
  );
}
