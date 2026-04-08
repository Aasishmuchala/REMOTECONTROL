'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import GlassCard from '@/components/GlassCard'
import Button from '@/components/Button'
import Input from '@/components/Input'
import { apiFetch } from '@/stores/auth'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<{ username?: string; password?: string; confirm?: string; general?: string }>({})
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const validate = (): boolean => {
    const next: typeof errors = {}
    if (!username.trim() || username.trim().length < 3) {
      next.username = 'Username must be at least 3 characters'
    }
    if (password.length < 8) {
      next.password = 'Password must be at least 8 characters'
    }
    if (password !== confirm) {
      next.confirm = 'Passwords do not match'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setIsLoading(true)
    setErrors({})
    try {
      await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username: username.trim(), password }),
      })
      router.push('/login')
    } catch (err) {
      setErrors({ general: err instanceof Error ? err.message : 'Registration failed' })
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
          <p className="text-sm text-[var(--color-text-muted)] mt-1">Create your account</p>
        </div>

        <GlassCard elevated className="p-6">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-5">Register</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Username"
              type="text"
              autoComplete="username"
              placeholder="choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={errors.username}
            />

            <Input
              label="Password"
              type="password"
              autoComplete="new-password"
              placeholder="min 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
            />

            <Input
              label="Confirm Password"
              type="password"
              autoComplete="new-password"
              placeholder="repeat password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              error={errors.confirm}
            />

            {errors.general && <p className="text-sm text-[var(--color-red)]">{errors.general}</p>}

            <Button type="submit" variant="primary" isLoading={isLoading} className="w-full mt-1">
              Create account
            </Button>
          </form>

          <p className="text-xs text-center text-[var(--color-text-muted)] mt-5">
            Already have an account?{' '}
            <Link href="/login" className="text-[var(--color-cyan)] hover:underline">
              Sign in
            </Link>
          </p>
        </GlassCard>
      </div>
    </div>
  )
}
