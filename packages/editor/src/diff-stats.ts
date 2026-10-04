export interface DiffStats {
  readonly added: number
  readonly deleted: number
}

function lines(value: string): string[] {
  if (value === '') return []
  return (value.endsWith('\n') ? value.slice(0, -1) : value).split('\n')
}

export function diffStats(originalValue: string, value: string): DiffStats {
  const original = lines(originalValue)
  const modified = lines(value)
  let start = 0
  while (
    start < original.length &&
    start < modified.length &&
    original[start] === modified[start]
  )
    start++

  let originalEnd = original.length
  let modifiedEnd = modified.length
  while (
    originalEnd > start &&
    modifiedEnd > start &&
    original[originalEnd - 1] === modified[modifiedEnd - 1]
  ) {
    originalEnd--
    modifiedEnd--
  }

  const originalLength = originalEnd - start
  const modifiedLength = modifiedEnd - start
  if (originalLength === 0) return { added: modifiedLength, deleted: 0 }
  if (modifiedLength === 0) return { added: 0, deleted: originalLength }
  // Hunt-Szymanski computes the exact LCS from matching line positions.
  // Keeping only positions and LIS tails avoids a quadratic table.
  const shorter = originalLength <= modifiedLength ? original : modified
  const longer = originalLength <= modifiedLength ? modified : original
  const shorterEnd =
    originalLength <= modifiedLength ? originalEnd : modifiedEnd
  const longerEnd = originalLength <= modifiedLength ? modifiedEnd : originalEnd
  const positions = new Map<string, number[]>()
  for (let shortIndex = start; shortIndex < shorterEnd; shortIndex++) {
    const line = shorter[shortIndex]
    let indices = positions.get(line)
    if (!indices) {
      indices = []
      positions.set(line, indices)
    }
    indices.push(shortIndex - start)
  }
  const tails: number[] = []
  for (let longIndex = start; longIndex < longerEnd; longIndex++) {
    const indices = positions.get(longer[longIndex])
    if (!indices) continue
    for (let index = indices.length - 1; index >= 0; index--) {
      const position = indices[index]
      let low = 0
      let high = tails.length
      while (low < high) {
        const middle = (low + high) >>> 1
        if (tails[middle] < position) low = middle + 1
        else high = middle
      }
      tails[low] = position
    }
  }
  const common = tails.length
  return {
    added: modifiedLength - common,
    deleted: originalLength - common,
  }
}
