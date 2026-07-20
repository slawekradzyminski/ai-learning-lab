import { BookOpen, CircleHelp, FlaskConical, Lightbulb } from 'lucide-react';
import { LearningCheckpoint } from '../LearningCheckpoint';
import { CourseLessonActivity } from './CourseLessonActivity';
import { CourseLessonNotes } from './CourseLessonNotes';
import { ExperimentHeading, MechanismBrief } from './LessonSpine';
import { LLM_COURSE_EVIDENCE, type LlmCourseLesson } from './llmCourseCatalog';

export function CourseLearnView({ lesson, onComplete }: { lesson: LlmCourseLesson; onComplete: () => void }) {
  return (
    <div className="space-y-10 learning-enter" data-testid="course-view-learn">
      <nav className="flex flex-wrap items-center gap-x-7 gap-y-3 border-b border-stone-200 pb-5 text-xs font-semibold" aria-label="Lesson materials">
        <a href="#lesson-intro" className="inline-flex items-center gap-2 text-slate-600 transition hover:text-sky-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-600"><Lightbulb className="h-3.5 w-3.5" /> Intro</a>
        <a href="#lesson-experiment" className="inline-flex items-center gap-2 text-slate-600 transition hover:text-sky-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-600"><FlaskConical className="h-3.5 w-3.5" /> Experiment</a>
        <a href="#lesson-question" className="inline-flex items-center gap-2 text-slate-600 transition hover:text-sky-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-600"><CircleHelp className="h-3.5 w-3.5" /> Question</a>
        <a href="#lesson-theory" className="inline-flex items-center gap-2 text-slate-600 transition hover:text-sky-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-600"><BookOpen className="h-3.5 w-3.5" /> Deep dive</a>
      </nav>
      <div className="space-y-10" data-testid="mandatory-lesson-spine">
        <div id="lesson-intro" className="scroll-mt-20"><MechanismBrief content={lesson.educational} accent="sky" /></div>
        <div id="lesson-experiment" className="scroll-mt-20 space-y-6">
          <ExperimentHeading evidence={LLM_COURSE_EVIDENCE[lesson.id]} accent="sky" />
          <CourseLessonActivity lesson={lesson} />
        </div>
        <div id="lesson-question" className="scroll-mt-20"><LearningCheckpoint id={`course-${lesson.id}`} eyebrow="03 · Check your understanding" {...lesson.checkpoint} onCorrect={onComplete} compact /></div>
      </div>
      <div id="lesson-theory" className="scroll-mt-20"><CourseLessonNotes lesson={lesson} /></div>
      <p className="border-l-2 border-sky-500 pl-5 text-sm leading-7 text-slate-600" data-testid="course-forward-bridge"><span className="font-semibold text-slate-900">Next:</span> {lesson.bridgeForward}</p>
    </div>
  );
}
