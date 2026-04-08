import { cn } from '@/lib/utils'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  elevated?: boolean
}

export default function GlassCard({ children, className, elevated = false }: GlassCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl p-4',
        elevated ? 'glass-elevated' : 'glass',
        className
      )}
    >
      {children}
    </div>
  )
}
