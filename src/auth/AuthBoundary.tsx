import { useEffect, useState, type ReactNode } from 'react';
import { authStorage, buildLoginUrl, currentReturnTo, redirectToLogin } from '@awesome-testing/platform-client';
import { auth } from '../lib/api';

type AuthState = 'checking' | 'authenticated' | 'unavailable';

export function AuthBoundary({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>('checking');
  const returnTo = currentReturnTo();

  useEffect(() => {
    let active = true;
    if (!authStorage.getAccessToken()) {
      redirectToLogin(returnTo);
      return () => {
        active = false;
      };
    }

    auth.me()
      .then(() => {
        if (active) setState('authenticated');
      })
      .catch(() => {
        if (active) setState('unavailable');
      });

    return () => {
      active = false;
    };
  }, [returnTo]);

  if (state === 'authenticated') return children;

  if (state === 'unavailable') {
    return (
      <main className="grid min-h-screen place-items-center bg-stone-50 px-6" data-testid="auth-unavailable">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold text-slate-950">We could not verify your session</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">The API may be unavailable. Sign in again, or retry when the platform is reachable.</p>
          <a className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white" href={buildLoginUrl(returnTo)} data-navigation="document">Continue to sign in</a>
        </div>
      </main>
    );
  }

  return (
    <main className="grid min-h-screen place-items-center bg-stone-50" data-testid="auth-checking" aria-live="polite">
      <p className="text-sm font-semibold text-slate-600">Checking your session…</p>
    </main>
  );
}
