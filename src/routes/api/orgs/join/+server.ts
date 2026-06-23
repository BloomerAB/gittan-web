import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { apiGet } from '$lib/server/api'
import { getProviderIdForIssuer, startIdentityLink } from '$lib/server/auth-identity'
import { config } from '$lib/server/config'

type TOrgLookup = {
  id: string
  name: string
  displayName: string
  oidcIssuer?: string
  ssoEmailDomain?: string
}

export const POST: RequestHandler = async ({ request, locals }) => {
  const session = locals.session
  if (!session) return json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await request.json()) as { orgName: string }
  if (!body.orgName) return json({ error: 'Missing orgName' }, { status: 400 })

  let org: TOrgLookup
  try {
    org = await apiGet<TOrgLookup>(`/orgs/by-name/${encodeURIComponent(body.orgName)}`, session)
  } catch {
    return json({ error: 'Organization not found' }, { status: 404 })
  }

  if (!org.oidcIssuer) {
    return json({ error: 'This organization requires an invite to join', requiresInvite: true }, { status: 403 })
  }

  const providerId = await getProviderIdForIssuer(org.oidcIssuer)
  if (!providerId) {
    return json({ error: 'SSO provider not configured' }, { status: 500 })
  }

  const redirectUri = `${config.appUrl}/app`
  const url = await startIdentityLink(session, providerId, redirectUri)
  if (!url) {
    return json({ error: 'Failed to start identity verification' }, { status: 500 })
  }

  return json({ url, ssoEmailDomain: org.ssoEmailDomain })
}
