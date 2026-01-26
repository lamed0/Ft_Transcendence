export function normalizePair(a: number, b: number) {
  return a < b ? { low: a, high: b } : { low: b, high: a };
}
