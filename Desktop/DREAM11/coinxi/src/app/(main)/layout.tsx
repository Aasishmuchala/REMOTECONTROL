'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/stores/auth'
import ExchangeNav from '@/components/ExchangeNav'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { token, user, setAuth, setLoading, isLoading, logout } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!token) {
      fetch('/api/auth/auto-login', { method: 'POST' })
        .then((res) => res.json())
        .then((data) => {
          if (data.token) {
            setAuth(data.token, data.user)
          } else {
            setLoading(false)
          }
        })
        .catch(() => setLoading(false))
    } else {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((u) => {
          if (u.id) setAuth(token, u)
          else setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  if (isLoading || !token) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center gap-4">
        <div className="w-14 h-14 rounded-xl glass flex items-center justify-center">
          <span className="text-xl font-bold font-display text-[var(--color-cyan)]">CX</span>
        </div>
        <p className="text-sm text-[var(--color-text-muted)] animate-pulse uppercase tracking-widest">
          Loading...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] pb-20">
      <header className="fixed top-0 z-40 w-full glass border-b border-white/10">
        <div className="flex justify-between items-center h-14 px-5 max-w-7xl mx-auto">
          <Link href="/trade">
            <span className="text-xl font-bold font-display tracking-tight text-[var(--color-cyan)]">
              COINXI
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-medium uppercase tracking-widest">
            {[
              { href: '/trade',     label: 'Trade'     },
              { href: '/portfolio', label: 'Portfolio' },
              { href: '/history',   label: 'History'   },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-cyan)] transition-colors duration-150"
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-xs text-[var(--color-text-muted)] font-mono">
              {user?.username}
            </span>
            <button
              onClick={handleLogout}
              className="text-xs px-3 py-1.5 rounded-lg glass text-[var(--color-text-secondary)] hover:text-[var(--color-red)] transition-colors duration-150"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="pt-20 pb-8 px-4 max-w-7xl mx-auto">
        {children}
      </main>

      <ExchangeNav />
    </div>
  )
}
