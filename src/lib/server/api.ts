import { config } from './config.js'
import type { SessionData } from './session.js'

function authHeaders(session: SessionData): Record<string, string> {
  return {
    Authorization: `Bearer ${session.accessToken}`,
    'Content-Type': 'application/json',
  }
}

export async function apiGet<T>(path: string, session: SessionData): Promise<T> {
  const res = await fetch(`${config.gittanApiUrl}${path}`, {
    headers: authHeaders(session),
  })
  if (!res.ok) throw new Error(`API GET ${path}: ${res.status}`)
  return res.json() as Promise<T>
}

export async function apiPost<T>(path: string, session: SessionData, body: unknown): Promise<T> {
  const res = await fetch(`${config.gittanApiUrl}${path}`, {
    method: 'POST',
    headers: authHeaders(session),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`API POST ${path}: ${res.status}`)
  return res.json() as Promise<T>
}

export async function apiPut<T>(path: string, session: SessionData, body: unknown): Promise<T> {
  const res = await fetch(`${config.gittanApiUrl}${path}`, {
    method: 'PUT',
    headers: authHeaders(session),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`API PUT ${path}: ${res.status}`)
  return res.json() as Promise<T>
}

export async function apiDelete(path: string, session: SessionData): Promise<void> {
  const res = await fetch(`${config.gittanApiUrl}${path}`, {
    method: 'DELETE',
    headers: authHeaders(session),
  })
  if (!res.ok) throw new Error(`API DELETE ${path}: ${res.status}`)
}
