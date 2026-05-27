export function formatSalary(
  min: number | null,
  max: number | null,
  currency = "USD"
): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });

  if (min !== null && max !== null) {
    return `${formatter.format(min)} – ${formatter.format(max)}`;
  }
  if (min !== null) return `From ${formatter.format(min)}`;
  if (max !== null) return `Up to ${formatter.format(max)}`;
  return "Salary not disclosed";
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatCompanySize(size: string): string {
  const labels: Record<string, string> = {
    "1-10": "1–10 employees",
    "11-50": "11–50 employees",
    "51-200": "51–200 employees",
    "201-500": "201–500 employees",
    "501-1000": "501–1,000 employees",
    "1001-5000": "1,001–5,000 employees",
    "5000+": "5,000+ employees",
  };
  return labels[size] ?? size;
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}

export function initials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}
