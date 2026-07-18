import { Link } from 'react-router-dom';
import { Activity, ArrowRight, Axis3d, Binary, BookOpenText, Bot, BrainCircuit, Cpu, FlaskConical, GitBranch, Hand, Layers3, LibraryBig, MemoryStick, Network, PanelTop, Presentation, ScanLine, ShieldCheck, Sigma, TextCursorInput, TrendingDown, UsersRound, Webhook } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { LEARNING_LABS, LEARNING_SECTIONS, getSectionLabs, getSectionTracks, type LearningLabId } from './learningCatalog';

const icons: Record<LearningLabId, typeof Sigma> = {
  tokenization: Binary,
  attention: Network,
  'residual-stream': Activity,
  'next-token': TextCursorInput,
  'kv-cache': Cpu,
  embeddings: Axis3d,
  perceptron: Sigma,
  'gradient-descent': TrendingDown,
  backpropagation: GitBranch,
  depth: Layers3,
  convolution: ScanLine,
  digits: Hand,
  'agent-loop': Bot,
  subagents: UsersRound,
  'context-harness': PanelTop,
  'memory-instructions': MemoryStick,
  'hooks-lifecycle': Webhook,
  'tool-boundaries': ShieldCheck,
  'agent-evals': FlaskConical,
};

export function LearningHomePage() {
  return (
    <div className="space-y-12" data-testid="learning-home-page">
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-9 text-white shadow-[0_30px_90px_-60px_rgba(15,23,42,0.95)] md:px-10 md:py-12" data-testid="learning-hero">
        <div className="absolute inset-y-0 right-0 hidden w-[44%] md:block" aria-hidden="true">
          <div className="absolute right-16 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full border border-sky-300/20" />
          <div className="absolute right-24 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full border border-amber-300/25" />
          <div className="absolute right-32 top-1/2 grid h-24 w-24 -translate-y-1/2 grid-cols-2 gap-2 rotate-12">{[0.82, 0.24, 0.48, 0.94].map((opacity, index) => <span key={index} className={index > 1 ? 'rounded-2xl bg-amber-300' : 'rounded-2xl bg-sky-400'} style={{ opacity }} />)}</div>
        </div>
        <div className="relative z-10 max-w-2xl">
          <Badge variant="outline" tone="tracking" className="border-white/15 bg-white/5 text-sky-100"><BrainCircuit className="mr-2 h-4 w-4" /> Two-part interactive curriculum</Badge>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight md:text-5xl" data-testid="learning-home-title">Open the black box—then inspect the harness around it.</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">{LEARNING_LABS.length} practical labs separate how a model computes from how an agent observes, acts, and continues work.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#how-llm-works" className="inline-flex items-center gap-2 rounded-full bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950">How LLM works? <ArrowRight className="h-4 w-4" /></a>
            <a href="#how-ai-agent-works" className="inline-flex items-center gap-2 rounded-full border border-amber-300/35 px-5 py-3 text-sm font-semibold text-amber-100">How AI Agent works? <ArrowRight className="h-4 w-4" /></a>
          </div>
        </div>
      </section>

      {LEARNING_SECTIONS.map((section) => {
        const labs = getSectionLabs(section.id);
        const tracks = getSectionTracks(section.id);
        const agentSection = section.id === 'agent';
        return (
          <section key={section.id} id={section.id === 'llm' ? 'how-llm-works' : 'how-ai-agent-works'} className="scroll-mt-24" data-testid={`learning-section-${section.id}`}>
            <div className={`border-l-4 pl-5 md:flex md:items-end md:justify-between md:gap-8 ${agentSection ? 'border-amber-400' : 'border-sky-500'}`}>
              <div><p className={`text-xs font-semibold uppercase tracking-[0.24em] ${agentSection ? 'text-amber-700' : 'text-sky-700'}`}>{section.label} · {labs.length} labs</p><h2 className="mt-2 text-3xl font-semibold text-slate-950 md:text-4xl">{section.title}</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{section.description}</p></div>
              <div className="mt-5 flex shrink-0 flex-wrap gap-2 md:mt-0">
                <Link to={labs[0].route} className={`inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold text-white ${agentSection ? 'bg-amber-600 hover:bg-amber-700' : 'bg-sky-600 hover:bg-sky-700'}`} data-testid={`learning-start-${section.id}`}>Start section <ArrowRight className="h-4 w-4" /></Link>
                <Link to={section.materialsRoute} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-950 bg-slate-950 px-5 text-sm font-semibold text-white hover:bg-slate-800" data-testid={`learning-materials-${section.id}`}><LibraryBig className="h-4 w-4" /> All materials</Link>
                <Link to={section.slidesRoute} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-stone-300 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-stone-50" data-testid={`learning-slides-${section.id}`}><Presentation className="h-4 w-4" /> Instructor slides</Link>
                <Link to={section.guideRoute} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-stone-300 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-stone-50" data-testid={`learning-theory-${section.id}`}><BookOpenText className="h-4 w-4" /> Theory guide</Link>
              </div>
            </div>

            <div className={`mt-7 grid gap-6 ${tracks.length === 3 ? 'xl:grid-cols-3' : 'xl:grid-cols-2'}`}>
              {tracks.map((track) => (
                <div key={track.id} className="overflow-hidden rounded-[2rem] border border-stone-200/80 bg-white/82" data-testid={`learning-track-${track.id}`}>
                  <div className="border-b border-stone-200/80 bg-stone-50/70 px-5 py-5 md:px-7"><p className={`text-[0.65rem] font-semibold uppercase tracking-[0.22em] ${agentSection ? 'text-amber-700' : 'text-sky-700'}`}>{track.label}</p><h3 className="mt-2 text-xl font-semibold text-slate-950">{track.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{track.description}</p></div>
                  {labs.filter((lab) => lab.track === track.id).map((lab) => {
                    const Icon = icons[lab.id];
                    return <Link key={lab.id} to={lab.route} className="group grid grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-stone-200/80 px-5 py-5 transition last:border-b-0 hover:bg-stone-50/85 md:px-7" data-testid={`learning-path-${lab.id}`}><span className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl text-white transition ${agentSection ? 'bg-amber-600 group-hover:bg-amber-700' : 'bg-slate-950 group-hover:bg-sky-600'}`}><Icon className="h-5 w-5" /></span><div><p className="text-xs font-semibold tabular-nums text-slate-400">0{lab.trackOrder}</p><h4 className="mt-1 font-semibold text-slate-950">{lab.title}</h4><p className="mt-1 text-sm leading-5 text-slate-600">{lab.takeaway}</p></div><ArrowRight className={`h-5 w-5 text-slate-400 transition group-hover:translate-x-1 ${agentSection ? 'group-hover:text-amber-700' : 'group-hover:text-sky-700'}`} /></Link>;
                  })}
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
