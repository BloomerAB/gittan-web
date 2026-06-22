import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { getSession } from '$lib/server/session'

export const GET: RequestHandler = async ({ url, cookies }) => {
  const session = getSession(cookies)
  if (!session) return json({ ok: false, error: 'Not authenticated' }, { status: 401 })

  const issuer = url.searchParams.get('issuer')
  if (!issuer) return json({ ok: false, error: 'Missing issuer parameter' }, { status: 400 })

  const discoveryUrl = issuer.replace(/\/$/, '') + '/.well-known/openid-configuration'

  try {
    const res = await fetch(discoveryUrl, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) {
      return json({ ok: false, error: `Discovery endpoint returned ${res.status}` })
    }

    const config = await res.json() as Record<string, unknown>

    if (!config.issuer || !config.authorization_endpoint || !config.token_endpoint) {
      return json({ ok: false, error: 'Response missing required OIDC fields (issuer, authorization_endpoint, token_endpoint)' })
    }

    return json({ ok: true, issuer: config.issuer as string })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return json({ ok: false, error: `Could not reach ${discoveryUrl}: ${message}` })
  }
}
