export interface BookLevel {
  price: string
  quantity: string
}

export type RowStatus = 'added' | 'updated' | 'removed' | 'unchanged'

export interface DiffResult {
  added: Set<string>
  updated: Set<string>
  removed: Set<string>
}

export function diffOrderBook(prev: BookLevel[], curr: BookLevel[]): DiffResult {
  const prevMap = new Map(prev.map(l => [l.price, l.quantity]))
  const currMap = new Map(curr.map(l => [l.price, l.quantity]))

  const added = new Set<string>()
  const updated = new Set<string>()
  const removed = new Set<string>()

  for (const [price, qty] of currMap) {
    if (!prevMap.has(price)) {
      added.add(price)
    } else if (prevMap.get(price) !== qty) {
      updated.add(price)
    }
  }

  for (const price of prevMap.keys()) {
    if (!currMap.has(price)) {
      removed.add(price)
    }
  }

  return { added, updated, removed }
}

export function getRowStatus(price: string, diff: DiffResult): RowStatus {
  if (diff.added.has(price)) return 'added'
  if (diff.updated.has(price)) return 'updated'
  if (diff.removed.has(price)) return 'removed'
  return 'unchanged'
}
