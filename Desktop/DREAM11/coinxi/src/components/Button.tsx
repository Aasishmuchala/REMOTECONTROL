'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  isLoading?: boolean
  children: React.ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    'bg-[var(--color-cyan)] text-[#0a0a0f] font-semibold',
    'hover:shadow-[0_0_20px_var(--color-cyan-glow)]',
  ].join(' '),
  secondary: [
    'glass text-[var(--color-text-primary)] font-medium',
    'hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)]',
  ].join(' '),
  danger: [
    'bg-[var(--color-red)] text-white font-semibold',
    'hover:shadow-[0_0_16px_rgba(255,68,102,0.4)]',
  ].join(' '),
  ghost: 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
}

export default function Button({
  variant = 'primary',
  isLoading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(
        'relative inline-flex items-center justify-center gap-2',
        'rounded-xl px-5 py-2.5 text-sm transition-colors duration-150',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantStyles[variant],
        className
      )}
      disabled={disabled || isLoading}
      {...(props as React.ComponentPropsWithoutRef<typeof motion.button>)}
    >
      {isLoading ? (
        <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : null}
      {children}
    </motion.button>
  )
}
