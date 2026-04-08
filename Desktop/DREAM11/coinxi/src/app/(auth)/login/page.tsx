'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import GlassCard from '@/components/GlassCard'
import Button from '@/components/Button'
import Input from '@/components/Input'
import { useAuthStore, apiFetch } from '@/stores/auth'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!username.trim()) { setError('Username is required'); return }
    if (!password) { setError('Password is required'); return }

    setIsLoading(true)
    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }) as { token: string; user: { id: string; username: string; coinBalance: number; loginStreak: number; isAdmin: boolean } }
      setAuth(data.token, data.user)
      router.push('/trade')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-display tracking-tight text-[var(--color-cyan)]">
            COINXI
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">Credits-only crypto exchange</p>
        </div>

        <GlassCard elevated className="p-6">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-5">Sign in</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Username"
              type="text"
              autoComplete="username"
              placeholder="your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && <p className="text-sm text-[var(--color-red)]">{error}</p>}

            <Button type="submit" variant="primary" isLoading={isLoading} className="w-full mt-1">
              Sign in
            </Button>
          </form>

          <p className="text-xs text-center text-[var(--color-text-muted)] mt-5">
            No account?{' '}
            <Link href="/register" className="text-[var(--color-cyan)] hover:underline">
              Register
            </Link>
          </p>
        </GlassCard>
      </div>
    </div>
  )
}
