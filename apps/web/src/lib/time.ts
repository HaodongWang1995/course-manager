/**
 * Parse a timestamp string returned by PostgreSQL as local time.
 *
 * PostgreSQL TIMESTAMP (without timezone) returns strings like
 * "2026-01-20T09:00:00" with no offset. The pg driver may append "Z" or
 * leave it bare. Without this helper, `new Date(str)` treats the value as
 * UTC and adds a local-timezone offset (e.g. +8 hours for UTC+8).
 *
 * We strip any trailing "Z" or explicit offset so the value is treated as
 * local wall-clock time — matching exactly what the user typed.
 */
export function parseLocalTime(isoStr: string): Date {
  const normalized = isoStr.replace(/Z$/, "").replace(/[+-]\d{2}:\d{2}$/, "");
  return new Date(normalized);
}

export function formatLocalDateTime(isoStr: string, locale = "zh-CN"): string {
  return parseLocalTime(isoStr).toLocaleString(locale);
}

export function formatLocalTime(isoStr: string, locale = "zh-CN"): string {
  return parseLocalTime(isoStr).toLocaleTimeString(locale);
}
