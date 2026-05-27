/**
 * Formats a numeric value as Argentine Peso string.
 * Uses manual formatting to prevent locale-dependent variations across environments.
 * Example: 1250.75 → "$1.251"
 */
export function formatARS(value: number): string {
  const formatted = Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `$${formatted}`;
}
