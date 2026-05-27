export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateJobSlug(title: string, companyName: string, id: string): string {
  return `${slugify(title)}-at-${slugify(companyName)}-${id.slice(0, 8)}`;
}
