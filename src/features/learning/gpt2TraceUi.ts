export function visibleGpt2Token(text: string) {
  return text.split(' ').join('·').split('\n').join('↵') || '∅';
}

export function gpt2TraceError(error: unknown) {
  if (typeof error === 'object' && error && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string; detail?: string } } }).response;
    return response?.data?.message ?? response?.data?.detail ?? 'The GPT-2 inspector could not produce a trace.';
  }
  return 'The GPT-2 inspector could not produce a trace.';
}
