/**
 * Formats an ISO date string as DD/MM/YYYY.
 * Manual formatting to prevent locale-dependent variations across environments
 * (mismo criterio que formatARS en utils/currency.ts).
 * Example: "2026-06-09T19:36:19Z" → "09/06/2026"
 */
export function formatPurchaseDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}
