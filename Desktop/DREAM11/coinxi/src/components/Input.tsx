'use client'

import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  prefix?: string
  suffix?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, prefix, suffix, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {prefix && (
            <span className="absolute left-3 text-sm text-[var(--color-text-muted)] font-mono">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-xl glass px-4 py-2.5 text-sm font-mono',
              'text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]',
              'outline-none transition-all duration-150',
              'focus:border-[var(--color-cyan)] focus:shadow-[0_0_0_2px_var(--color-cyan-dim)]',
              error && 'border-[var(--color-red)] focus:border-[var(--color-red)] focus:shadow-[0_0_0_2px_rgba(255,68,102,0.2)]',
              prefix && 'pl-8',
              suffix && 'pr-8',
              className
            )}
            {...props}
          />
          {suffix && (
            <span className="absolute right-3 text-xs text-[var(--color-text-muted)]">
              {suffix}
            </span>
          )}
        </div>
        {error && (
          <p className="text-xs text-[var(--color-red)]">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
