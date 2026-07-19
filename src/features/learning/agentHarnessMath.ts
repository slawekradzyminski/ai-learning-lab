export type AgentActor = 'user' | 'model' | 'harness' | 'tool' | 'final';

export type AgentTraceStep = {
  actor: AgentActor;
  label: string;
  detail: string;
  payload?: string;
};

const happyTrace: AgentTraceStep[] = [
  { actor: 'user', label: 'Goal enters the harness', detail: 'Research three laptops under €900, verify current evidence, and write laptop-comparison.md. Do not purchase or contact a vendor.' },
  { actor: 'harness', label: 'Context is assembled', detail: 'Instructions, history, and available tool schemas are sent to the model.', payload: 'model + tools + messages' },
  { actor: 'model', label: 'Model proposes a tool call', detail: 'The response asks the harness to find matching laptop records.', payload: 'search_catalog({ category: "laptops", max_price_eur: 900 })' },
  { actor: 'tool', label: 'Harness validates and executes', detail: 'The schema and policy pass, so application code runs the tool.', payload: '3 matching products' },
  { actor: 'harness', label: 'Tool result becomes an observation', detail: 'The result is appended to the message history for another model turn.' },
  { actor: 'model', label: 'Model requests current evidence', detail: 'The next proposal asks for the price, specifications, source, and retrieval time for a candidate.', payload: 'fetch_product({ id: "laptop-pro" })' },
  { actor: 'tool', label: 'Environment returns evidence', detail: 'The tool reports a sourced, timestamped product snapshot.', payload: '€849 · 16 GB RAM · source + retrieved_at' },
  { actor: 'model', label: 'Model proposes the approved deliverable', detail: 'After verifying all three records, the model requests a workspace-only report write.', payload: 'write_report({ path: "laptop-comparison.md", ... })' },
  { actor: 'tool', label: 'Harness verifies the effect', detail: 'The report exists at the approved path and contains three sourced comparisons.' },
  { actor: 'final', label: 'Model returns a final answer', detail: 'The harness accepts the stop because the deliverable is verified and no external commitment occurred.' },
];

const recoveryTrace: AgentTraceStep[] = [
  ...happyTrace.slice(0, 3),
  { actor: 'tool', label: 'Tool execution fails', detail: 'The catalog service times out. The failure is data, not a hidden exception.', payload: '503 catalog unavailable' },
  { actor: 'harness', label: 'Failure becomes an observation', detail: 'The error is appended with retry limits and the model gets another turn.' },
  { actor: 'model', label: 'Model adapts its plan', detail: 'It retries once with a narrower query instead of repeating blindly.', payload: 'search_catalog({ category: "laptops", max_price_eur: 850 })' },
  { actor: 'tool', label: 'Fallback tool succeeds', detail: 'The environment returns a smaller current result set.', payload: '2 current matches' },
  { actor: 'final', label: 'Model answers with a limitation', detail: 'The loop stops without writing a misleading three-product report and identifies the missing evidence.' },
];

export function getAgentTrace(includeFailure: boolean): AgentTraceStep[] {
  return includeFailure ? recoveryTrace : happyTrace;
}

export type ContextSegment = {
  id: string;
  label: string;
  cost: number;
  compactCost?: number;
  required: boolean;
  priority: number;
  copy: string;
};

export const CONTEXT_SEGMENTS: ContextSegment[] = [
  { id: 'system', label: 'System instructions', cost: 34, required: true, priority: 100, copy: 'Role, behavior, stop conditions, and non-negotiable rules.' },
  { id: 'user', label: 'Current user goal', cost: 18, required: true, priority: 100, copy: 'The task the next model call must advance.' },
  { id: 'tools', label: 'Tool definitions', cost: 46, compactCost: 24, required: false, priority: 90, copy: 'Names, descriptions, and JSON schemas for available actions.' },
  { id: 'recent', label: 'Recent conversation', cost: 38, compactCost: 22, required: false, priority: 80, copy: 'The latest turns, including unresolved decisions.' },
  { id: 'results', label: 'Tool results', cost: 58, compactCost: 18, required: false, priority: 70, copy: 'Observations returned by the environment.' },
  { id: 'memory', label: 'Persistent project memory', cost: 30, compactCost: 14, required: false, priority: 60, copy: 'Curated facts and handoff artifacts from earlier sessions.' },
  { id: 'older', label: 'Older raw history', cost: 66, compactCost: 16, required: false, priority: 20, copy: 'Turns that may be summarized or dropped when the budget tightens.' },
];

export type ContextAssembly = {
  included: Array<ContextSegment & { effectiveCost: number }>;
  excluded: ContextSegment[];
  used: number;
};

export function assembleContext(budget: number, compact: boolean): ContextAssembly {
  const safeBudget = Math.max(0, Math.trunc(budget));
  const candidates = CONTEXT_SEGMENTS.map((segment) => ({
    ...segment,
    effectiveCost: compact && segment.compactCost ? segment.compactCost : segment.cost,
  }));
  const included = candidates.filter((segment) => segment.required);
  let used = included.reduce((sum, segment) => sum + segment.effectiveCost, 0);

  for (const segment of candidates.filter((candidate) => !candidate.required).sort((a, b) => b.priority - a.priority)) {
    if (used + segment.effectiveCost <= safeBudget) {
      included.push(segment);
      used += segment.effectiveCost;
    }
  }

  const ids = new Set(included.map(({ id }) => id));
  return {
    included: candidates.filter(({ id }) => ids.has(id)),
    excluded: CONTEXT_SEGMENTS.filter(({ id }) => !ids.has(id)),
    used,
  };
}

export type PermissionPolicy = 'strict' | 'trusted';
export type ToolRisk = 'read' | 'write' | 'destructive';
export type ToolDecision = 'allowed' | 'approval' | 'denied' | 'invalid';

export type TeachingToolCall = {
  name: string;
  risk: ToolRisk;
  arguments: Record<string, string>;
  required: string[];
};

export const TEACHING_TOOL_CALLS: TeachingToolCall[] = [
  { name: 'search_catalog', risk: 'read', arguments: { category: 'laptops', max_price_eur: '900' }, required: ['category', 'max_price_eur'] },
  { name: 'write_report', risk: 'write', arguments: { path: 'laptop-comparison.md', format: 'markdown' }, required: ['path', 'format'] },
  { name: 'purchase_product', risk: 'destructive', arguments: { product_id: 'laptop-pro', price_eur: '849' }, required: ['product_id', 'price_eur'] },
  { name: 'write_report', risk: 'write', arguments: { format: 'markdown' }, required: ['path', 'format'] },
];

export function evaluateToolCall(call: TeachingToolCall, policy: PermissionPolicy): { decision: ToolDecision; reason: string } {
  const missing = call.required.filter((field) => !call.arguments[field]);
  if (missing.length) return { decision: 'invalid', reason: `Schema validation failed: missing ${missing.join(', ')}.` };
  if (call.risk === 'destructive') {
    return policy === 'trusted'
      ? { decision: 'approval', reason: 'Destructive effects still require a human checkpoint.' }
      : { decision: 'denied', reason: 'Strict policy does not expose destructive execution.' };
  }
  if (call.risk === 'write' && policy === 'strict') {
    return { decision: 'approval', reason: 'External writes require explicit user approval.' };
  }
  return { decision: 'allowed', reason: 'The schema and active permission policy allow execution.' };
}
