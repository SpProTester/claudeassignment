export function buildQueryString(params: Record<string, string | number | boolean | string[] | undefined>): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;

    if (Array.isArray(value)) {
      for (const item of value) {
        searchParams.append(key, String(item));
      }
    } else {
      searchParams.set(key, String(value));
    }
  }

  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}

export function getAbsoluteUrl(path: string): string {
  const base = process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000";
  return `${base}${path}`;
}
