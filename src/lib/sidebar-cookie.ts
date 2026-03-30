import { cookies } from "next/headers"

/** Совпадает с SIDEBAR_COOKIE_NAME в components/ui/sidebar.tsx */
export const SIDEBAR_STATE_COOKIE = "sidebar_state"

/** Для `defaultOpen` у SidebarProvider: первый HTML уже с нужной шириной, без мигания. */
export async function getSidebarDefaultOpen(): Promise<boolean> {
  const store = await cookies()
  const raw = store.get(SIDEBAR_STATE_COOKIE)?.value
  if (raw === "true") return true
  if (raw === "false") return false
  return true
}
