export function differenceSets<T>(setA: Set<T>, setB: Set<T>): Set<T> {
  const difference = new Set(setA);
  for (const elem of setB) {
    difference.delete(elem);
  }
  return difference;
}
