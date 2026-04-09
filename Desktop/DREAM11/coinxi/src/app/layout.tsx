import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CoinXI Exchange',
  description: 'Credits-only crypto exchange',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[var(--color-bg)] text-[var(--color-text-primary)] antialiased">
        {children}
      </body>
    </html>
  )
}
