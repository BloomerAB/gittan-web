import { fail } from '@sveltejs/kit'
import { apiGet, apiPut } from '$lib/server/api'
import type { PageServerLoad, Actions } from './$types'
import type { TOrg } from '$lib/types'

type TOrgIntegrations = TOrg & {
  oidcIssuer?: string
  oidcClientId?: string
  groupsClaim?: string
  mandatorySso?: boolean
  slackTeamName?: string
  slackBotToken?: string
}

export const load: PageServerLoad = async ({ parent, locals }) => {
  const { orgs, activeOrgId } = await parent()
  const orgId = activeOrgId
  if (!orgId || !locals.session) return { org: null }

  try {
    const org = await apiGet<TOrgIntegrations>(`/orgs/${orgId}`, locals.session)
    return { org }
  } catch {
    const org = (orgs.find((o: TOrg) => o.id === orgId) as TOrgIntegrations | undefined) ?? null
    return { org }
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
    const groupsClaim = data.get('groupsClaim') as string
    const mandatorySso = data.get('mandatorySso') === 'true'

    try {
      await apiPut(`/orgs/${orgId}`, locals.session, {
        oidcIssuer: oidcIssuer || undefined,
        oidcClientId: oidcClientId || undefined,
        groupsClaim: groupsClaim || undefined,
        mandatorySso,
      })
      return { savedOidc: true }
    } catch {
      return fail(500, { error: 'Failed to save OIDC configuration' })
    }
  },

  disconnectSlack: async ({ locals, cookies }) => {
    if (!locals.session) return fail(401, { error: 'Unauthorized' })
    const orgId = cookies.get('gittan-active-org')
    if (!orgId) return fail(400, { error: 'No active org' })

    try {
      await apiPut(`/orgs/${orgId}`, locals.session, {
        slackTeamName: null,
        slackBotToken: null,
      })
      return { disconnected: true }
    } catch {
      return fail(500, { slackError: 'Failed to disconnect Slack' })
    }
  },
}
