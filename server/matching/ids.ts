/** Compare Mongo ObjectIds, strings, or mixed values safely. */
export function sameUserId(a: unknown, b: unknown): boolean {
  return String(a) === String(b);
}
