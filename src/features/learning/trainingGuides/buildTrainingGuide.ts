import type { TrainingSlideDefinition } from '../trainingSlideCatalog';
import { getLabTheory, getTrackTheory } from './catalog';
import type { GuideSource, LabTheory } from './types';

export type TrainingCurriculum = 'llm' | 'agent';

export type TrainingGuideSection = {
  id: string;
  label: string;
  markdown: string;
};

const curriculumSources: Record<TrainingCurriculum, GuideSource[]> = {
  llm: [
    { label: 'Stephen Welch — The Welch Labs Illustrated Guide to AI, revision V15 (2026)', url: 'https://www.welchlabs.com/' },
    { label: 'Vaswani et al. — Attention Is All You Need', url: 'https://arxiv.org/abs/1706.03762' },
    { label: 'Rumelhart, Hinton & Williams — Learning representations by back-propagating errors', url: 'https://www.nature.com/articles/323533a0' },
  ],
  agent: [
    { label: 'Yao et al. — ReAct', url: 'https://arxiv.org/abs/2210.03629' },
    { label: 'Model Context Protocol — specification', url: 'https://modelcontextprotocol.io/specification/2025-03-26/index' },
    { label: 'OWASP — Excessive Agency', url: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/2_0_vulns/LLM06_ExcessiveAgency.html' },
  ],
};

function renderSources(sources: GuideSource[]): string {
  return sources.map(({ label, url }) => `- ${url ? `[${label}](${url})` : label}`).join('\n');
}

function renderDiagram(diagram: string): string {
  return `\n\n### System map\n\n\`\`\`mermaid\n${diagram}\n\`\`\``;
}

function renderAgentLabSlide(slide: TrainingSlideDefinition, theory: LabTheory): string {
  const sourceBlock = `### Sources and further reading\n\n${renderSources(theory.sources)}`;
  const teachingCue = `> **Instructor cue:** ${slide.notes}`;

  if (slide.kind === 'hook') {
    return `${theory.premise}\n\n### Why this matters to users\n\n${theory.debrief}\n\n${teachingCue}\n\n${sourceBlock}`;
  }
  if (slide.kind === 'mechanism') {
    return `${theory.mechanism}\n\n### Practical design decision\n\nName which component owns each decision, side effect, and stop condition. If ownership is unclear, the system will be difficult to debug or govern.${renderDiagram(theory.diagram)}\n\n${teachingCue}\n\n${sourceBlock}`;
  }
  if (slide.kind === 'exercise') {
    return `${theory.exercise}\n\n### What to observe\n\nFollow the user-visible goal through the trace. Check the environment outcome, recovery behavior, approval points, and whether the system explains failure in a way the user can act on.${renderDiagram(theory.diagram)}\n\n${teachingCue}\n\n${sourceBlock}`;
  }
  return `${theory.debrief}\n\n### Take this back to work\n\nTurn the lesson into one explicit product rule, one deterministic boundary, and one observable success criterion.\n\n${teachingCue}\n\n${sourceBlock}`;
}

function renderLabSlide(slide: TrainingSlideDefinition, theory: LabTheory, curriculum: TrainingCurriculum): string {
  if (curriculum === 'agent') return renderAgentLabSlide(slide, theory);
  const sourceBlock = `### Sources and further reading\n\n${renderSources(theory.sources)}`;
  const teachingCue = `> **Instructor cue:** ${slide.notes}`;

  if (slide.kind === 'hook') {
    return `${theory.premise}\n\n### Mathematical lens\n\n${theory.mathematics}\n\n${teachingCue}\n\n${sourceBlock}`;
  }
  if (slide.kind === 'mechanism') {
    return `${theory.mechanism}\n\n### Derivation and notation\n\n${theory.mathematics}${renderDiagram(theory.diagram)}\n\n${teachingCue}\n\n${sourceBlock}`;
  }
  if (slide.kind === 'exercise') {
    return `${theory.exercise}\n\n### Quantities to keep visible\n\n${theory.mathematics}${renderDiagram(theory.diagram)}\n\n${teachingCue}\n\n${sourceBlock}`;
  }
  return `${theory.debrief}\n\n### The mathematical claim to retain\n\n${theory.mathematics}\n\n${teachingCue}\n\n${sourceBlock}`;
}

function renderOpening(curriculum: TrainingCurriculum): string {
  if (curriculum === 'agent') {
    return `An AI agent is best taught as a user-facing software system. The model proposes; the harness supplies context and owns control flow; tools expose capabilities; the environment contains the state that actually changes. The course repeatedly asks who owns each operation, what the user can observe, and what evidence proves the requested outcome.\n\n### Practical lens\n\nStart with a real user goal. Trace it through context selection, model proposal, authorization, tool execution, recovery, and stopping. A polished final answer is not enough: success means the intended environment change happened, unwanted changes did not happen, and the user can understand the result or recover from failure.\n\n### Course promise\n\nEvery chapter ends with a decision participants can apply to an agent product: a boundary to enforce, an event to observe, or an outcome to evaluate.\n\n${renderSources(curriculumSources.agent)}`;
  }
  return `The curriculum follows a representation-first method: name what is represented, apply the smallest useful operation, inspect the output, and state the limitation. This mirrors the book's goal of “finding the bottom” of AI mechanisms. The deck extends the book with tokenization, sentence embeddings, KV caching, and agent engineering from primary literature.\n\n### Mathematical lens\n\nAcross the deck, the recurring pattern is $r_{k+1}=f_k(r_k;\theta_k)$: one representation becomes another through an explicit operation. Training adds a scalar loss $L$ and computes $\nabla_\theta L$; inference turns final logits into a conditional distribution.\n\n${renderSources(curriculumSources.llm)}`;
}

function renderRecap(curriculum: TrainingCurriculum): string {
  const core = curriculum === 'agent'
    ? 'A capable agent is a probabilistic decision component embedded in deterministic control boundaries. Diagnose failures by locating them in proposal, context assembly, validation, authorization, execution, observation, or stopping.'
    : 'The apparent black box is a chain: discrete tokens, vector representations, routed context, accumulated residual updates, vocabulary probabilities, learned parameters, and composed visual features. Each mechanism has a distinct representation, equation, and limitation.';
  const heading = curriculum === 'agent' ? '### Practical review' : '### Synthesis equation';
  const audit = curriculum === 'agent'
    ? 'For every agent feature, ask: **user goal → available context → proposed action → enforced boundary → observable outcome → recovery path**. If one step cannot be named, the feature is not ready to rely on.'
    : 'A useful final audit is **representation → operation → output → evidence → limitation**. If any arrow cannot be named, return to the corresponding lab rather than replacing the missing mechanism with an anthropomorphic explanation.';
  return `${core}\n\n${heading}\n\n${audit}\n\n### Sources and further reading\n\n${renderSources(curriculumSources[curriculum])}`;
}

const agentTrackPractice: Record<string, string> = {
  agency: 'Give every delegated task a clear user outcome, bounded writable scope, return format, and accountable owner. Parallel work is useful only when the combined result can be reviewed and verified.',
  context: 'Keep the smallest sufficient context for the next decision. Make instructions, summaries, retrieved evidence, and durable state visible as different product concepts with different lifetimes.',
  safety: 'Treat model output as a proposal. Validate it, apply least privilege, ask for approval when consequences warrant it, observe the real outcome, and evaluate repeated runs rather than the best demo.',
};

export function buildTrainingGuide(
  slides: TrainingSlideDefinition[],
  curriculum: TrainingCurriculum,
): TrainingGuideSection[] {
  return slides.map((slide, index) => {
    let body: string;
    if (slide.labId) body = renderLabSlide(slide, getLabTheory(slide.labId), curriculum);
    else if (slide.kind === 'track' && slide.trackId) {
      const theory = getTrackTheory(slide.trackId);
      body = curriculum === 'agent'
        ? `${theory.premise}\n\n### Practical focus\n\n${agentTrackPractice[slide.trackId] ?? 'Connect each system decision to a user outcome and observable evidence.'}${renderDiagram(theory.diagram)}\n\n> **Instructor cue:** ${slide.notes}\n\n### Sources and further reading\n\n${renderSources(theory.sources)}`
        : `${theory.premise}\n\n### Mathematical spine\n\n${theory.mathematics}${renderDiagram(theory.diagram)}\n\n> **Instructor cue:** ${slide.notes}\n\n### Sources and further reading\n\n${renderSources(theory.sources)}`;
    } else if (slide.kind === 'recap') body = renderRecap(curriculum);
    else body = renderOpening(curriculum);

    return {
      id: slide.id,
      label: `${index + 1}. ${slide.title}`,
      markdown: `# Slide ${index + 1} — ${slide.title}\n\n_${slide.chapterLabel} · ${slide.kicker}_\n\n${body}`,
    };
  });
}
