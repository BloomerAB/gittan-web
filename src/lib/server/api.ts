import { config } from './config.js'
import type { SessionData } from './session.js'

function authHeaders(session: SessionData): Record<string, string> {
  return {
    Authorization: `Bearer ${session.accessToken}`,
    'Content-Type': 'application/json',
  }
}

async function throwApiError(method: string, path: string, res: Response): Promise<never> {
  const text = await res.text().catch(() => '')
  let message = ''
  try {
    const json = JSON.parse(text)
    message = (json as { message?: string }).message ?? (json as { error?: string }).error ?? ''
  } catch {
    message = text
  }
  throw new Error(message || `API ${method} ${path}: ${res.status}`)
}

export async function apiGet<T>(path: string, session: SessionData): Promise<T> {
  const res = await fetch(`${config.gittanApiUrl}${path}`, {
    headers: authHeaders(session),
  })
  if (!res.ok) await throwApiError('GET', path, res)
  return res.json() as Promise<T>
}

export async function apiPost<T>(path: string, session: SessionData, body: unknown): Promise<T> {
  const res = await fetch(`${config.gittanApiUrl}${path}`, {
    method: 'POST',
    headers: authHeaders(session),
    body: JSON.stringify(body),
  })
  if (!res.ok) await throwApiError('POST', path, res)
  return res.json() as Promise<T>
}

export async function apiPut<T>(path: string, session: SessionData, body: unknown): Promise<T> {
  const res = await fetch(`${config.gittanApiUrl}${path}`, {
    method: 'PUT',
    headers: authHeaders(session),
    body: JSON.stringify(body),
  })
  if (!res.ok) await throwApiError('PUT', path, res)
  return res.json() as Promise<T>
}

export async function apiDelete(path: string, session: SessionData): Promise<void> {
  const res = await fetch(`${config.gittanApiUrl}${path}`, {
    method: 'DELETE',
    headers: authHeaders(session),
  })
  if (!res.ok) await throwApiError('DELETE', path, res)
}
