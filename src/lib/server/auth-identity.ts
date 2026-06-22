import { config } from './config.js'
import type { SessionData } from './session.js'

export type TLinkedIdentity = {
  issuer: string
  subject: string
  email: string
  displayName: string
  linkedAt: string
}

export async function getLinkedIdentities(session: SessionData): Promise<TLinkedIdentity[]> {
  const res = await fetch(`${config.authApiUrl}/identity/links`, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
    signal: AbortSignal.timeout(5000),
  })

  if (!res.ok) return []
  const data = (await res.json()) as { linked_identities: TLinkedIdentity[] }
  return data.linked_identities ?? []
}

export async function startIdentityLink(
  session: SessionData,
  providerId: string,
  redirectUri: string,
): Promise<string | null> {
  const res = await fetch(`${config.authApiUrl}/identity/link`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ providerId, redirectUri }),
    signal: AbortSignal.timeout(5000),
  })

  if (!res.ok) return null
  const data = (await res.json()) as { url: string }
  return data.url
}

export async function getProviderIdForIssuer(issuer: string): Promise<string | null> {
  const res = await fetch(`${config.authApiUrl}/identity/providers`, {
    signal: AbortSignal.timeout(5000),
  })

  if (!res.ok) return null
  const data = (await res.json()) as { providers: Array<{ id: string; issuer: string }> }
  const match = data.providers.find((p) => p.issuer === issuer)
  return match?.id ?? null
}
