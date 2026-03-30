/** Белый список ключей из сохранённой query родительского экрана */
export function sanitizeReturnQuery(raw: string | undefined): string {
  if (!raw) return ""
  let decoded = raw
  try {
    decoded = decodeURIComponent(raw)
  } catch {
    return ""
  }
  const p = new URLSearchParams(decoded)
  const out = new URLSearchParams()
  const page = p.get("page")
  if (page && /^\d+$/.test(page)) {
    const n = Number.parseInt(page, 10)
    if (n >= 1) out.set("page", String(n))
  }
  const view = p.get("view")
  if (view === "calendar") out.set("view", "calendar")
  return out.toString()
}
