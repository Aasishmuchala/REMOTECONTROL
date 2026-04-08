import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      // Only measure coverage for the Phase 1 exchange modules (not legacy cricket code)
      include: [
        'src/lib/auth.ts',
        'src/lib/wallet.ts',
        'src/lib/matching-engine.ts',
        'src/lib/price-simulator.ts',
        'src/lib/order-book-diff.ts',
        'src/hooks/useOrderBook.ts',
        'src/hooks/usePriceFeed.ts',
        'src/hooks/useRecentTrades.ts',
      ],
      thresholds: {
        lines: 80,
        branches: 75,
        functions: 80,
        statements: 80,
      },
    },
    include: ['src/__tests__/**/*.test.{ts,tsx}'],
    setupFiles: ['src/__tests__/setup.ts'],
    environmentMatchGlobs: [
      ['src/__tests__/**/*.test.tsx', 'jsdom'],
    ],
  },
})
