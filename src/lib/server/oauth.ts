import crypto from 'node:crypto'
import { config } from './config.js'

export type OAuthTokens = {
  readonly access_token: string
  readonly refresh_token: string
  readonly token_type: string
  readonly expires_in: number
  readonly scope: string
}

export function generateState(): string {
  return crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '')
}

export function validateState(expected: string | undefined, received: string | null): boolean {
  if (!expected || !received) return false
  if (expected.length !== received.length) return false
  const enc = new TextEncoder()
  const a = enc.encode(expected)
  const b = enc.encode(received)
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i]
  }
  return result === 0
}

export function buildAuthorizeUrl(): { url: string; state: string } {
  const state = generateState()
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.oauthClientId,
    redirect_uri: `${config.appUrl}/auth/callback`,
    scope: 'openid email profile read write',
    state,
  })
  return {
    url: `${config.authPublicUrl}/oauth/authorize?${params.toString()}`,
    state,
  }
}

export async function exchangeCodeForTokens(code: string): Promise<OAuthTokens> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: config.oauthClientId,
    client_secret: config.oauthClientSecret,
    redirect_uri: `${config.appUrl}/auth/callback`,
  })

  const response = await fetch(`${config.authApiUrl}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error_description || error.error || 'Token exchange failed')
  }

  const tokens = await response.json() as OAuthTokens
  if (!tokens.access_token) {
    throw new Error('Invalid token response from auth server')
  }
  return tokens
}

export async function revokeToken(token: string): Promise<void> {
  const body = new URLSearchParams({
    token,
    client_id: config.oauthClientId,
    client_secret: config.oauthClientSecret,
  })

  await fetch(`${config.authApiUrl}/oauth/revoke`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  }).catch(() => {})
}

export async function refreshAccessToken(refreshToken: string): Promise<OAuthTokens> {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: config.oauthClientId,
    client_secret: config.oauthClientSecret,
  })

  const response = await fetch(`${config.authApiUrl}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error_description || error.error || 'Token refresh failed')
  }

  const tokens = await response.json() as OAuthTokens
  if (!tokens.access_token) {
    throw new Error('Invalid token response from auth server')
  }
  return tokens
}
