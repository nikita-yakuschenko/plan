import { sanitizeReturnQuery } from "@/lib/return-query"

const STORAGE_KEY = "modul.plan.returnFromObject"

export type StoredReturnContext = {
  objectId: string
  path: string
  search: string
}

/** Перед переходом на карточку — только whitelist query, привязка к id объекта. */
export function writeReturnContext(path: string, fullSearchParams: string, objectId: string): void {
  if (typeof window === "undefined") return
  const search = sanitizeReturnQuery(fullSearchParams)
  if (!search) {
    sessionStorage.removeItem(STORAGE_KEY)
    return
  }
  const payload: StoredReturnContext = { objectId, path, search }
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // квота / приватный режим
  }
}

/** Href для «Назад», только если контекст относится к текущей карточке. */
export function readReturnHrefForObject(objectId: string): string {
  if (typeof window === "undefined") return "/"
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return "/"
    const parsed = JSON.parse(raw) as StoredReturnContext
    if (
      typeof parsed.objectId !== "string" ||
      typeof parsed.path !== "string" ||
      typeof parsed.search !== "string"
    ) {
      return "/"
    }
    if (parsed.objectId !== objectId) return "/"
    if (!parsed.path.startsWith("/") || parsed.path.includes("..")) return "/"
    return parsed.search ? `${parsed.path}?${parsed.search}` : parsed.path
  } catch {
    return "/"
  }
}
