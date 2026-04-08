import { describe, it, expect } from 'vitest'
import { diffOrderBook, getRowStatus, type BookLevel, type DiffResult } from '@/lib/order-book-diff'

// RED PHASE: These tests will fail with 'Not implemented' until order-book-diff is implemented in Plan 02

describe('diffOrderBook', () => {
  it('detects a newly added row (price in curr but not in prev)', () => {
    const prev: BookLevel[] = [{ price: '50000.00', quantity: '1.00' }]
    const curr: BookLevel[] = [
      { price: '50000.00', quantity: '1.00' },
      { price: '50100.00', quantity: '0.50' },
    ]
    const result = diffOrderBook(prev, curr)
    expect(result.added.has('50100.00')).toBe(true)
    expect(result.updated.has('50100.00')).toBe(false)
    expect(result.removed.has('50100.00')).toBe(false)
  })

  it('detects an updated row (same price, different quantity)', () => {
    const prev: BookLevel[] = [{ price: '50000.00', quantity: '1.00' }]
    const curr: BookLevel[] = [{ price: '50000.00', quantity: '2.00' }]
    const result = diffOrderBook(prev, curr)
    expect(result.updated.has('50000.00')).toBe(true)
    expect(result.added.has('50000.00')).toBe(false)
    expect(result.removed.has('50000.00')).toBe(false)
  })

  it('detects a removed row (price in prev but not in curr)', () => {
    const prev: BookLevel[] = [
      { price: '50000.00', quantity: '1.00' },
      { price: '49900.00', quantity: '0.75' },
    ]
    const curr: BookLevel[] = [{ price: '50000.00', quantity: '1.00' }]
    const result = diffOrderBook(prev, curr)
    expect(result.removed.has('49900.00')).toBe(true)
    expect(result.added.has('49900.00')).toBe(false)
    expect(result.updated.has('49900.00')).toBe(false)
  })

  it('returns empty diff sets for identical order books', () => {
    const book: BookLevel[] = [
      { price: '50000.00', quantity: '1.00' },
      { price: '49900.00', quantity: '0.50' },
    ]
    const result = diffOrderBook(book, book)
    expect(result.added.size).toBe(0)
    expect(result.updated.size).toBe(0)
    expect(result.removed.size).toBe(0)
  })

  it('handles empty prev — all curr rows are added', () => {
    const curr: BookLevel[] = [
      { price: '50000.00', quantity: '1.00' },
      { price: '49900.00', quantity: '0.50' },
    ]
    const result = diffOrderBook([], curr)
    expect(result.added.has('50000.00')).toBe(true)
    expect(result.added.has('49900.00')).toBe(true)
    expect(result.updated.size).toBe(0)
    expect(result.removed.size).toBe(0)
  })

  it('handles empty curr — all prev rows are removed', () => {
    const prev: BookLevel[] = [
      { price: '50000.00', quantity: '1.00' },
      { price: '49900.00', quantity: '0.50' },
    ]
    const result = diffOrderBook(prev, [])
    expect(result.removed.has('50000.00')).toBe(true)
    expect(result.removed.has('49900.00')).toBe(true)
    expect(result.added.size).toBe(0)
    expect(result.updated.size).toBe(0)
  })

  it('correctly classifies mix of added, updated, and removed in one call', () => {
    const prev: BookLevel[] = [
      { price: '50000.00', quantity: '1.00' }, // will be updated
      { price: '49900.00', quantity: '0.50' }, // will be removed
    ]
    const curr: BookLevel[] = [
      { price: '50000.00', quantity: '1.50' }, // updated quantity
      { price: '50100.00', quantity: '0.25' }, // newly added
    ]
    const result = diffOrderBook(prev, curr)
    expect(result.updated.has('50000.00')).toBe(true)
    expect(result.removed.has('49900.00')).toBe(true)
    expect(result.added.has('50100.00')).toBe(true)
  })
})

describe('getRowStatus', () => {
  const makeDiff = (
    added: string[] = [],
    updated: string[] = [],
    removed: string[] = [],
  ): DiffResult => ({
    added: new Set(added),
    updated: new Set(updated),
    removed: new Set(removed),
  })

  it('returns "added" when price is in diff.added', () => {
    const diff = makeDiff(['50100.00'])
    expect(getRowStatus('50100.00', diff)).toBe('added')
  })

  it('returns "updated" when price is in diff.updated', () => {
    const diff = makeDiff([], ['50000.00'])
    expect(getRowStatus('50000.00', diff)).toBe('updated')
  })

  it('returns "removed" when price is in diff.removed', () => {
    const diff = makeDiff([], [], ['49900.00'])
    expect(getRowStatus('49900.00', diff)).toBe('removed')
  })

  it('returns "unchanged" when price is not in any diff set', () => {
    const diff = makeDiff(['50100.00'], ['50000.00'], ['49900.00'])
    expect(getRowStatus('49800.00', diff)).toBe('unchanged')
  })
})
