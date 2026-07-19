import { describe, expect, test } from 'vitest';
import { resolveLiveAiRuntimeEnabled } from './runtimeCapabilities';

describe('resolveLiveAiRuntimeEnabled', () => {
  test('requires an explicit opt-in for private live-runtime controls', () => {
    expect(resolveLiveAiRuntimeEnabled(undefined)).toBe(false);
    expect(resolveLiveAiRuntimeEnabled('false')).toBe(false);
    expect(resolveLiveAiRuntimeEnabled('true')).toBe(true);
    expect(resolveLiveAiRuntimeEnabled(true)).toBe(true);
  });
});
