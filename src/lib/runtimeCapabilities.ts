export function resolveLiveAiRuntimeEnabled(configuredValue: string | boolean | undefined) {
  return configuredValue === true || configuredValue === 'true';
}

export const LIVE_AI_RUNTIME_ENABLED = resolveLiveAiRuntimeEnabled(import.meta.env.VITE_AI_LIVE_RUNTIME_ENABLED);
