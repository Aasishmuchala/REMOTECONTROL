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
  throw new Error('Not implemented')
}

export function getRowStatus(price: string, diff: DiffResult): RowStatus {
  throw new Error('Not implemented')
}
