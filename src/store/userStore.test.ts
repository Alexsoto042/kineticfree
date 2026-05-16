import { describe, it, expect, beforeEach } from 'vitest';
import { useUserStore } from './userStore';
import type { Session } from '@supabase/supabase-js';

describe('userStore', () => {
  beforeEach(() => {
    useUserStore.setState({
      session: null,
      profile: null,
      loading: true
    });
  });

  it('should have initial state', () => {
    const state = useUserStore.getState();
    expect(state.session).toBeNull();
    expect(state.profile).toBeNull();
    expect(state.loading).toBe(true);
  });

  it('should set session', () => {
    const mockSession = { user: { id: '123' } } as Session;
    useUserStore.getState().setSession(mockSession);
    expect(useUserStore.getState().session).toEqual(mockSession);
  });

  it('should set profile', () => {
    const mockProfile = { id: '123', username: 'testuser' };
    useUserStore.getState().setProfile(mockProfile);
    expect(useUserStore.getState().profile).toEqual(mockProfile);
  });

  it('should set loading', () => {
    useUserStore.getState().setLoading(false);
    expect(useUserStore.getState().loading).toBe(false);
  });

  it('should clear user', () => {
    const mockSession = { user: { id: '123' } } as Session;
    const mockProfile = { id: '123', username: 'testuser' };
    
    useUserStore.getState().setSession(mockSession);
    useUserStore.getState().setProfile(mockProfile);
    useUserStore.getState().setLoading(false);

    useUserStore.getState().clearUser();

    const state = useUserStore.getState();
    expect(state.session).toBeNull();
    expect(state.profile).toBeNull();
    expect(state.loading).toBe(false); // clearUser sets loading to false? Let's check store implementation logic if needed.
    // Actually clearUser usually just clears data. Let's check if it resets loading.
    // Looking at previous view of userStore.ts (step 100ish), clearUser: () => set({ session: null, profile: null, loading: false })
  });
});
