import { useMemo, useState } from 'react';
import { Box, CheckCircle2, CircleAlert, FileCheck2, LockKeyhole, MessageSquareText, Play, ShieldAlert, ShieldCheck, UserCheck, Webhook, XCircle } from 'lucide-react';
import { LabPageHeader } from './LabPageHeader';
import { LearningCheckpoint } from './LearningCheckpoint';
import { evaluateToolCall, TEACHING_TOOL_CALLS, type PermissionPolicy, type ToolDecision } from './agentHarnessMath';

const decisionStyle: Record<ToolDecision, { icon: typeof CheckCircle2; color: string; label: string }> = {
  allowed: { icon: CheckCircle2, color: 'border-emerald-300 bg-emerald-50 text-emerald-950', label: 'Execution allowed' },
  approval: { icon: UserCheck, color: 'border-amber-300 bg-amber-50 text-amber-950', label: 'Human approval required' },
  denied: { icon: ShieldAlert, color: 'border-red-300 bg-red-50 text-red-950', label: 'Execution denied' },
  invalid: { icon: CircleAlert, color: 'border-violet-300 bg-violet-50 text-violet-950', label: 'Invalid tool arguments' },
};

export function ToolBoundariesLabPage() {
  const [callIndex, setCallIndex] = useState(0);
  const [policy, setPolicy] = useState<PermissionPolicy>('strict');
  const [approved, setApproved] = useState(false);
  const call = TEACHING_TOOL_CALLS[callIndex];
  const result = useMemo(() => evaluateToolCall(call, policy), [call, policy]);
  const presentation = decisionStyle[result.decision];
  const DecisionIcon = presentation.icon;
  const executed = result.decision === 'allowed' || (result.decision === 'approval' && approved);

  const selectCall = (index: number) => {
    setCallIndex(index);
    setApproved(false);
  };

  return (
    <div className="space-y-6" data-testid="tool-boundaries-lab-page">
      <LabPageHeader eyebrow="Agent safety · step 2" title="Validate tools and permissions" description="Send four model-proposed calls through the deterministic boundary: schema validation, risk policy, optional approval, execution, and an observable result." aside="Proposal ≠ permission" />

      <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50/75 p-4 text-sm leading-6 text-amber-950" role="note">
        A prompt can ask the model to behave safely, but only application code can enforce authentication, authorization, schemas, sandboxing, and approval gates.
      </div>

      <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white/85">
        <div className="grid gap-5 border-b border-stone-200 p-5 md:grid-cols-[1fr_auto] md:items-end md:p-7">
          <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Proposed model output</p><h2 className="mt-2 text-xl font-semibold text-slate-950">Choose a structured tool call</h2></div>
          <div className="inline-flex rounded-full border border-stone-200 bg-stone-50 p-1" role="group" aria-label="Permission policy">
            {(['strict', 'trusted'] as const).map((value) => <button key={value} type="button" onClick={() => { setPolicy(value); setApproved(false); }} aria-pressed={policy === value} className={`min-h-10 rounded-full px-4 text-sm font-semibold capitalize ${policy === value ? 'bg-slate-950 text-white' : 'text-slate-600'}`} data-testid={`tool-policy-${value}`}>{value}</button>)}
          </div>
        </div>

        <div className="grid lg:grid-cols-[minmax(300px,0.64fr)_minmax(0,1.36fr)]">
          <div className="border-b border-stone-200 p-5 lg:border-b-0 lg:border-r md:p-7">
            <div className="space-y-2">
              {TEACHING_TOOL_CALLS.map((candidate, index) => (
                <button key={`${candidate.name}-${index}`} type="button" onClick={() => selectCall(index)} aria-pressed={callIndex === index} className={`w-full rounded-xl border px-4 py-3 text-left transition ${callIndex === index ? 'border-slate-950 bg-slate-950 text-white' : 'border-stone-200 text-slate-700 hover:bg-stone-50'}`} data-testid={`tool-call-${index}`}>
                  <span className="font-mono text-sm font-semibold">{candidate.name}</span><span className="mt-1 block text-xs capitalize opacity-60">{candidate.risk} effect</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 md:p-7">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
              <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">01 · Parse and validate</p><pre className="mt-3 overflow-x-auto rounded-xl bg-slate-950 p-4 font-mono text-xs leading-6 text-sky-100" data-testid="tool-call-payload">{`${call.name}(${JSON.stringify(call.arguments, null, 2)})`}</pre></div>
              <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold capitalize text-slate-600">{call.risk}</span>
            </div>

            <div className={`mt-5 rounded-2xl border p-5 ${presentation.color}`} data-testid="tool-decision">
              <div className="flex items-start gap-3"><DecisionIcon className="mt-0.5 h-5 w-5 shrink-0" /><div><p className="font-semibold">02 · {presentation.label}</p><p className="mt-1 text-sm leading-6 opacity-80">{result.reason}</p></div></div>
              {result.decision === 'approval' && !approved ? <button type="button" onClick={() => setApproved(true)} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white" data-testid="tool-approve"><UserCheck className="h-4 w-4" /> Approve this simulated call</button> : null}
            </div>

            <div className={`mt-5 flex items-start gap-3 rounded-2xl border p-5 ${executed ? 'border-emerald-300 bg-emerald-50 text-emerald-950' : 'border-stone-200 bg-stone-50 text-slate-500'}`} data-testid="tool-execution">
              {executed ? <Play className="mt-0.5 h-5 w-5 shrink-0" /> : <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0" />}
              <div><p className="font-semibold">03 · {executed ? 'Application code executes' : 'No side effect occurs'}</p><p className="mt-1 text-sm leading-6">{executed ? 'A structured tool result is recorded and returned to the next model turn as an observation.' : 'The proposal remains in the trace, together with the validation or policy decision.'}</p></div>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500"><FileCheck2 className="h-4 w-4 text-violet-600" /> Schema</div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500"><ShieldAlert className="h-4 w-4 text-red-600" /> Policy</div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">{executed ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-slate-400" />} Outcome</div>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white/85" aria-labelledby="boundary-layers-title">
        <div className="border-b border-stone-200 p-5 md:p-7"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Defense in depth</p><h2 id="boundary-layers-title" className="mt-2 text-2xl font-semibold text-slate-950">Four mechanisms answer four different questions.</h2></div>
        <div className="grid gap-px bg-stone-200 sm:grid-cols-2 xl:grid-cols-4">
          {[
            [MessageSquareText, 'Instruction', 'How should the model behave?', 'Influences proposals'],
            [Webhook, 'Hook', 'What logic runs at this event?', 'Intercepts lifecycle'],
            [ShieldCheck, 'Permission', 'May this capability be used?', 'Authorizes action'],
            [Box, 'Sandbox', 'What can the process actually reach?', 'Limits blast radius'],
          ].map(([Icon, label, question, answer]) => { const LayerIcon = Icon as typeof ShieldCheck; return <div key={String(label)} className="bg-white p-5 md:p-6"><LayerIcon className="h-5 w-5 text-amber-700" /><p className="mt-4 font-semibold text-slate-950">{String(label)}</p><p className="mt-2 text-sm leading-6 text-slate-600">{String(question)}</p><p className="mt-4 border-t border-stone-200 pt-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{String(answer)}</p></div>; })}
        </div>
      </section>

      <LearningCheckpoint id="tool-boundary-owner" question="Can a stronger system prompt replace a permission check?" choices={[{ value: 'yes', label: 'Yes, if the model is capable enough' }, { value: 'no', label: 'No, permissions must be enforced outside the model' }, { value: 'schema', label: 'Only when the JSON schema is valid' }]} correctValue="no" explanation="Instructions shape model behavior; permissions control actual capabilities. Reliable systems use both, with deterministic enforcement at the tool boundary." />

      <p className="text-xs leading-5 text-slate-500">Research basis: <a className="underline" href="https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/" target="_blank" rel="noreferrer">OpenAI agent guardrails and human intervention guidance</a> and <a className="underline" href="https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents" target="_blank" rel="noreferrer">Anthropic’s distinction between traces and outcomes</a>.</p>
    </div>
  );
}
