/**
 * Escapes special characters in a string to be used in a regular expression.
 * This prevents NoSQL injection and ReDoS attacks when using user input in $regex queries.
 */
export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
