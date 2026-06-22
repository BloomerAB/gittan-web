import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { apiGet } from '$lib/server/api'
import { getProviderIdForIssuer, startIdentityLink } from '$lib/server/auth-identity'
import { config } from '$lib/server/config'
import type { TOrg } from '$lib/types'

type TOrgFull = TOrg & { oidcIssuer?: string }

export const POST: RequestHandler = async ({ locals, cookies }) => {
  const session = locals.session
  if (!session) return json({ error: 'Unauthorized' }, { status: 401 })

  const orgId = cookies.get('gittan-active-org')
  if (!orgId) return json({ error: 'No active org' }, { status: 400 })

  const org = await apiGet<TOrgFull>(`/orgs/${orgId}`, session).catch(() => null)
  if (!org?.oidcIssuer) return json({ error: 'Org has no OIDC provider' }, { status: 400 })

  const providerId = await getProviderIdForIssuer(org.oidcIssuer)
  if (!providerId) return json({ error: 'Provider not found in auth-server' }, { status: 404 })

  const redirectUri = `${config.appUrl}/app`
  const url = await startIdentityLink(session, providerId, redirectUri)
  if (!url) return json({ error: 'Failed to start identity link' }, { status: 500 })

  return json({ url })
}
