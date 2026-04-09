'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthUser {
  id: string
  username: string
  coinBalance: number
  loginStreak: number
  isAdmin: boolean
}

interface AuthState {
  token: string | null
  user: AuthUser | null
  isLoading: boolean
  setAuth: (token: string, user: AuthUser) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isLoading: true,
      setAuth: (token, user) => set({ token, user, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ token: null, user: null, isLoading: false }),
    }),
    {
      name: 'coinxi-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
)

/**
 * Authenticated fetch wrapper.
 * Reads JWT token from the auth store and attaches it as Bearer token.
 * Throws on non-2xx responses with error message from response body.
 */
export async function apiFetch(path: string, options?: RequestInit): Promise<unknown> {
  const token = useAuthStore.getState().token

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(path, {
    ...options,
    headers,
  })

  if (!res.ok) {
    let message = `HTTP ${res.status}`
    try {
      const body = await res.json()
      message = body.error ?? body.message ?? message
    } catch {
      // ignore parse error
    }
    throw new Error(message)
  }

  // Handle empty responses (e.g. DELETE 204)
  const text = await res.text()
  if (!text) return null
  return JSON.parse(text)
}
