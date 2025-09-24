export function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null;
}

export function getData(obj: unknown): Record<string, unknown> | null {
  if (isRecord(obj) && "data" in obj) {
    const d = (obj as { data?: unknown }).data;
    if (isRecord(d)) return d as Record<string, unknown>;
  }
  return null;
}

export function getImageUrl(val: unknown): string | undefined {
  if (typeof val === "string") return val;
  if (isRecord(val) && typeof (val as Record<string, unknown>).src === "string") return (val as Record<string, unknown>).src as string;
  if (isRecord(val) && typeof (val as Record<string, unknown>).image === "string") return (val as Record<string, unknown>).image as string;
  return undefined;
}

export function getTags(val: unknown): string[] {
  if (Array.isArray(val)) {
    const out: string[] = [];
    for (const t of val) {
      if (typeof t === "string") out.push(t);
      else if (isRecord(t)) {
        const r = t as Record<string, unknown>;
        if (typeof r.value === "string") out.push(r.value as string);
        else if (typeof r.name === "string") out.push(r.name as string);
        else if (typeof r.title === "string") out.push(r.title as string);
      }
    }
    return Array.from(new Set(out.filter(Boolean))).slice(0, 50);
  }
  if (typeof val === "string" && val.trim()) return [val.trim()];
  return [];
}
