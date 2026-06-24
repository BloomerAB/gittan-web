import { fail } from '@sveltejs/kit'
import { apiGet, apiPut } from '$lib/server/api'
import { getLinkedIdentities, getProviderIdForIssuer, startIdentityLink } from '$lib/server/auth-identity'
import { config } from '$lib/server/config'
import type { PageServerLoad, Actions } from './$types'
import type { TOrg } from '$lib/types'

type TOrgAuth = TOrg & {
  selfRegistration?: boolean
  emailVerification?: boolean
  oidcIssuer?: string
  oidcClientId?: string
  oidcClientSecret?: string
  ssoEmailDomain?: string
  groupsClaim?: string
  mandatorySso?: boolean
}

export const load: PageServerLoad = async ({ parent, locals }) => {
  const { orgs, activeOrgId } = await parent()
  const orgId = activeOrgId
  if (!orgId || !locals.session) return { org: null }

  const linkedIdentities = await getLinkedIdentities(locals.session)

  try {
    const org = await apiGet<TOrgAuth>(`/orgs/${orgId}`, locals.session)
    return { org, linkedIdentities }
  } catch {
    const org = (orgs.find((o: TOrg) => o.id === orgId) as TOrgAuth | undefined) ?? null
    return { org, linkedIdentities }
  }
}

export const actions: Actions = {
  saveOidc: async ({ request, locals, cookies }) => {
    if (!locals.session) return fail(401, { error: 'Unauthorized' })
    const orgId = cookies.get('gittan-active-org')
    if (!orgId) return fail(400, { error: 'No active org' })

    const data = await request.formData()
    const oidcIssuer = data.get('oidcIssuer') as string
    const oidcClientId = data.get('oidcClientId') as string
    const oidcClientSecret = data.get('oidcClientSecret') as string
    const ssoEmailDomain = data.get('ssoEmailDomain') as string
    const groupsClaim = data.get('groupsClaim') as string

    try {
      await apiPut(`/orgs/${orgId}`, locals.session, {
        oidcIssuer: oidcIssuer || undefined,
        oidcClientId: oidcClientId || undefined,
        oidcClientSecret: oidcClientSecret || undefined,
        ssoEmailDomain: ssoEmailDomain || null,
        groupsClaim: groupsClaim || undefined,
      })
    } catch {
      return fail(500, { error: 'Failed to save OIDC configuration' })
    }

    return { savedOidc: true }
  },

  verifyOidc: async ({ locals, cookies }) => {
    if (!locals.session) return fail(401, { error: 'Unauthorized' })
    const orgId = cookies.get('gittan-active-org')
    if (!orgId) return fail(400, { error: 'No active org' })

    try {
      const org = await apiGet<TOrgAuth>(`/orgs/${orgId}`, locals.session)
      if (!org.oidcIssuer) return fail(400, { error: 'No OIDC issuer configured' })

      const providerId = await getProviderIdForIssuer(org.oidcIssuer)
      if (!providerId) return fail(400, { error: 'Provider not found' })

      const redirectUri = `${config.appUrl}/app/admin/auth`
      const url = await startIdentityLink(locals.session, providerId, redirectUri)
      if (url) {
        return { verifyUrl: url }
      }
      return { alreadyVerified: true }
    } catch {
      return fail(500, { error: 'Failed to start verification' })
    }
  },

  savePolicy: async ({ request, locals, cookies }) => {
    if (!locals.session) return fail(401, { error: 'Unauthorized' })
    const orgId = cookies.get('gittan-active-org')
    if (!orgId) return fail(400, { error: 'No active org' })

    const data = await request.formData()
    const selfRegistration = data.get('selfRegistration') === 'true'
    const emailVerification = data.get('emailVerification') === 'true'
    const mandatorySso = data.get('mandatorySso') === 'true'

    try {
      await apiPut(`/orgs/${orgId}`, locals.session, {
        selfRegistration,
        emailVerification,
        mandatorySso,
      })
      return { savedPolicy: true }
    } catch {
      return fail(500, { error: 'Failed to save access policy' })
    }
  },
}
