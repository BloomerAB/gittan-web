import { fail } from '@sveltejs/kit'
import { apiGet, apiPut } from '$lib/server/api'
import { getProviderIdForIssuer, startIdentityLink } from '$lib/server/auth-identity'
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

  try {
    const org = await apiGet<TOrgAuth>(`/orgs/${orgId}`, locals.session)
    return { org }
  } catch {
    const org = (orgs.find((o: TOrg) => o.id === orgId) as TOrgAuth | undefined) ?? null
    return { org }
  }
}

export const actions: Actions = {
  saveAuth: async ({ request, locals, cookies }) => {
    if (!locals.session) return fail(401, { error: 'Unauthorized' })
    const orgId = cookies.get('gittan-active-org')
    if (!orgId) return fail(400, { error: 'No active org' })

    const data = await request.formData()
    const selfRegistration = data.get('selfRegistration') === 'true'
    const emailVerification = data.get('emailVerification') === 'true'

    try {
      await apiPut(`/orgs/${orgId}`, locals.session, {
        selfRegistration,
        emailVerification,
      })
      return { saved: true }
    } catch {
      return fail(500, { error: 'Failed to save auth configuration' })
    }
  },

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
    const mandatorySso = data.get('mandatorySso') === 'true'

    try {
      await apiPut(`/orgs/${orgId}`, locals.session, {
        oidcIssuer: oidcIssuer || undefined,
        oidcClientId: oidcClientId || undefined,
        oidcClientSecret: oidcClientSecret || undefined,
        ssoEmailDomain: ssoEmailDomain || null,
        groupsClaim: groupsClaim || undefined,
        mandatorySso,
      })
    } catch {
      return fail(500, { error: 'Failed to save OIDC configuration' })
    }

    if (oidcIssuer && oidcClientId) {
      console.log('[saveOidc] looking up provider for issuer:', oidcIssuer)
      const providerId = await getProviderIdForIssuer(oidcIssuer)
      console.log('[saveOidc] providerId:', providerId)
      if (providerId) {
        const redirectUri = `${config.appUrl}/app/admin/auth`
        console.log('[saveOidc] starting identity link, redirectUri:', redirectUri)
        const url = await startIdentityLink(locals.session, providerId, redirectUri)
        console.log('[saveOidc] identity link url:', url)
        if (url) {
          return { savedOidc: true, verifyUrl: url }
        }
      }
    }

    return { savedOidc: true }
  },
}
