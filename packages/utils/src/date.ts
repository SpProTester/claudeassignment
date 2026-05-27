import {
  formatDistanceToNow,
  format,
  isAfter,
  isBefore,
  parseISO,
  differenceInDays,
} from "date-fns";

export function timeAgo(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatDate(date: string | Date, pattern = "MMM d, yyyy"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, pattern);
}

export function isExpired(date: string | Date): boolean {
  const d = typeof date === "string" ? parseISO(date) : date;
  return isBefore(d, new Date());
}

export function isInFuture(date: string | Date): boolean {
  const d = typeof date === "string" ? parseISO(date) : date;
  return isAfter(d, new Date());
}

export function daysUntil(date: string | Date): number {
  const d = typeof date === "string" ? parseISO(date) : date;
  return differenceInDays(d, new Date());
}
