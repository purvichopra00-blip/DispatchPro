import { nhost } from './nhost';
import { useAppStore } from './useAppStore';
import { setAuthToken } from './api';

// TypeScript types for the authenticated user
export type AuthUser = {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
};

/**
 * Register a new user with Nhost Auth
 */
export async function signUp(email: string, password: string) {
  try {
    console.log('[Nhost Auth] Sign-up request for:', email);
    const { session, error } = await nhost.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    
    const user = session?.user ?? null;
    if (user) {
      setAuthToken(session?.accessToken);
      useAppStore.getState().setAuthUser(user);
    }
    return user;
  } catch (e) {
    console.error('[Nhost Auth] Sign-up failed:', e);
    throw e;
  }
}

/**
 * Log in an existing user with Nhost Auth
 */
export async function signIn(email: string, password: string) {
  try {
    console.log('[Nhost Auth] Sign-in request for:', email);
    const { session, error } = await nhost.auth.signIn({
      email,
      password,
    });

    if (error) throw error;

    const user = session?.user ?? null;
    if (user) {
      setAuthToken(session?.accessToken);
      useAppStore.getState().setAuthUser(user);
    }
    return user;
  } catch (e) {
    console.error('[Nhost Auth] Sign-in failed:', e);
    throw e;
  }
}

/**
 * Log out the current user
 */
export async function signOut() {
  try {
    console.log('[Nhost Auth] Sign-out requested');
    const { error } = await nhost.auth.signOut();
    // No active session is not a real failure — just clear local state.
    if (error && (error as any).error !== 'unauthenticated-user') throw error;
    useAppStore.getState().clearAuthUser();
  } catch (e) {
    console.error('[Nhost Auth] Sign-out failed:', e);
    throw e;
  }
}

// Automatically subscribe to session state changes (token refreshes, cold boots)
nhost.auth.onAuthStateChanged((event, session) => {
  console.log('[Nhost Auth] State Change Event:', event);
  const user = session?.user ?? null;
  if (user) {
    setAuthToken(session?.accessToken);
    useAppStore.getState().setAuthUser(user);
    // Session (and JWT) are ready here — load all DB-backed data.
    useAppStore.getState().hydrate();
  } else {
    setAuthToken(undefined);
    useAppStore.getState().clearAuthUser();
  }
});
