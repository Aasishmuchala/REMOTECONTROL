'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { name: 'Trade',     path: '/trade',     icon: '⬆⬇' },
  { name: 'Portfolio', path: '/portfolio', icon: '◈' },
  { name: 'History',   path: '/history',   icon: '⊡' },
]

export default function ExchangeNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 glass border-t border-white/10">
      <div className="flex justify-around items-center h-16 px-4 pb-safe">
        {tabs.map((tab) => {
          const isActive = pathname === tab.path || pathname.startsWith(tab.path + '/')
          return (
            <Link
              key={tab.name}
              href={tab.path}
              className={[
                'relative flex flex-col items-center justify-center gap-1 px-4 py-2',
                'text-xs font-medium uppercase tracking-wider transition-colors duration-150',
                'active:scale-90',
                isActive
                  ? 'text-[var(--color-cyan)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]',
              ].join(' ')}
            >
              <span className="text-base leading-none">{tab.icon}</span>
              <span>{tab.name}</span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[var(--color-cyan)] rounded-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
