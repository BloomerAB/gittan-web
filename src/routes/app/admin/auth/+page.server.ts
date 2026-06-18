import { fail } from '@sveltejs/kit'
import { apiGet, apiPut } from '$lib/server/api'
import type { PageServerLoad, Actions } from './$types'
import type { TOrg } from '$lib/types'

type TOrgDetail = TOrg & {
  oidcIssuer?: string
  oidcClientId?: string
  groupsClaim?: string
  mandatorySso?: boolean
  selfRegistration?: boolean
  emailVerification?: boolean
}

export const load: PageServerLoad = async ({ parent, locals }) => {
  const { orgs, activeOrgId } = await parent()
  const orgId = activeOrgId
  if (!orgId || !locals.session) return { org: null }

  try {
    const org = await apiGet<TOrgDetail>(`/orgs/${orgId}`, locals.session)
    return { org }
  } catch {
    const org = (orgs.find((o: TOrg) => o.id === orgId) as TOrgDetail | undefined) ?? null
    return { org }
  }
}

export const actions: Actions = {
  saveAuth: async ({ request, locals, cookies }) => {
    if (!locals.session) return fail(401, { error: 'Unauthorized' })
    const orgId = cookies.get('gittan-active-org')
    if (!orgId) return fail(400, { error: 'No active org' })

    const data = await request.formData()
    const authMode = data.get('mode') as string
    const oidcIssuer = data.get('oidcIssuer') as string
    const oidcClientId = data.get('oidcClientId') as string
    const groupsClaim = data.get('groupsClaim') as string
    const mandatorySso = data.get('mandatorySso') === 'true'
    const selfRegistration = data.get('selfRegistration') === 'true'
    const emailVerification = data.get('emailVerification') === 'true'

    const payload: Record<string, unknown> =
      authMode === 'oidc'
        ? {
            oidcIssuer: oidcIssuer || undefined,
            oidcClientId: oidcClientId || undefined,
            groupsClaim: groupsClaim || undefined,
            mandatorySso,
          }
        : { selfRegistration, emailVerification }

    try {
      await apiPut(`/orgs/${orgId}`, locals.session, payload)
      return { saved: true }
    } catch {
      return fail(500, { error: 'Failed to save auth configuration' })
    }
  },
}
