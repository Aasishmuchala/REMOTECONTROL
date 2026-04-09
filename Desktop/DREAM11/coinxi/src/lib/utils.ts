/**
 * Combines class names, filtering falsy values.
 * Lightweight replacement for clsx/tailwind-merge.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
