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

/**
 * Formats a tax rate (percentage) for display.
 * Example: 21 → "21%", 10.5 → "10,5%"
 */
export function formatRate(rate: number): string {
  const text = Number.isInteger(rate) ? String(rate) : String(rate).replace('.', ',');
  return `${text}%`;
}
