// Argentina es UTC-3 fijo (no usa horario de verano desde 2009).
const AR_OFFSET_MS = 3 * 60 * 60 * 1000;

/**
 * Formats an ISO date string as DD/MM/YYYY in Argentina time (UTC-3).
 * Manual formatting to prevent locale-dependent variations across environments
 * (mismo criterio que formatARS en utils/currency.ts).
 * Example: "2026-06-09T19:36:19Z" → "09/06/2026"
 */
export function formatPurchaseDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  // Llevamos el instante a hora AR y leemos con getters UTC: así la fecha es la
  // que ve el usuario (una compra a las 23:00 AR no salta al día siguiente) sin
  // depender del timezone del dispositivo (determinístico, como formatARS).
  const ar = new Date(d.getTime() - AR_OFFSET_MS);
  const dd = String(ar.getUTCDate()).padStart(2, '0');
  const mm = String(ar.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = ar.getUTCFullYear();
  return `${dd}/${mm}/${yyyy}`;
}
