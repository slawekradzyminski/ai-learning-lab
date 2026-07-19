import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authStorage, redirectToLogin } from '@awesome-testing/platform-client';
import { AuthBoundary } from './AuthBoundary';
import { auth } from '../lib/api';

vi.mock('../lib/api', () => ({ auth: { me: vi.fn() } }));
vi.mock('@awesome-testing/platform-client', async (importOriginal) => ({
  ...await importOriginal<typeof import('@awesome-testing/platform-client')>(),
  redirectToLogin: vi.fn(),
}));

describe('AuthBoundary', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    window.history.replaceState({}, '', '/learn/next-token');
  });

  it('redirects an anonymous visitor to login with the current Lab URL', async () => {
    render(<AuthBoundary><p>Protected Lab</p></AuthBoundary>);

    await waitFor(() => expect(redirectToLogin).toHaveBeenCalledWith('/learn/next-token'));
    expect(screen.queryByText('Protected Lab')).not.toBeInTheDocument();
  });

  it('renders the Lab after validating the existing platform session', async () => {
    authStorage.setTokens({ token: 'access', refreshToken: 'refresh' });
    vi.mocked(auth.me).mockResolvedValue({ username: 'client' });

    render(<AuthBoundary><p>Protected Lab</p></AuthBoundary>);

    expect(await screen.findByText('Protected Lab')).toBeInTheDocument();
    expect(auth.me).toHaveBeenCalledOnce();
  });

  it('does not expose the Lab when session validation is unavailable', async () => {
    authStorage.setTokens({ token: 'access', refreshToken: 'refresh' });
    vi.mocked(auth.me).mockRejectedValue(new Error('offline'));

    render(<AuthBoundary><p>Protected Lab</p></AuthBoundary>);

    expect(await screen.findByTestId('auth-unavailable')).toBeInTheDocument();
    expect(screen.queryByText('Protected Lab')).not.toBeInTheDocument();
  });
});
