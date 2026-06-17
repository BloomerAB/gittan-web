import { config } from './config.js'
import type { SessionData } from './session.js'

export async function apiGet<T>(path: string, session: SessionData): Promise<T> {
  const res = await fetch(`${config.gittanApiUrl}${path}`, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  })
  if (!res.ok) throw new Error(`API GET ${path}: ${res.status}`)
  return res.json() as Promise<T>
}
