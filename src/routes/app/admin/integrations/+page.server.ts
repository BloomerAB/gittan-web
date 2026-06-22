import { fail, redirect } from '@sveltejs/kit'
import { apiGet, apiPut } from '$lib/server/api'
import type { PageServerLoad, Actions } from './$types'
import type { TOrg } from '$lib/types'

type TOrgIntegrations = TOrg & {
  slackClientId?: string
  slackClientSecret?: string
  slackBotToken?: string
  slackTeamName?: string
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
  saveSlackCredentials: async ({ request, locals, cookies }) => {
    if (!locals.session) return fail(401, { error: 'Unauthorized' })
    const orgId = cookies.get('gittan-active-org')
    if (!orgId) return fail(400, { error: 'No active org' })

    const data = await request.formData()
    const slackClientId = (data.get('slackClientId') as string).trim()
    const slackClientSecret = (data.get('slackClientSecret') as string).trim()

    if (!slackClientId || !slackClientSecret) {
      return fail(400, { error: 'Both Client ID and Client Secret are required' })
    }

    try {
      await apiPut(`/orgs/${orgId}`, locals.session, {
        slackClientId,
        slackClientSecret,
      })
    } catch {
      return fail(500, { error: 'Failed to save Slack credentials' })
    }

    redirect(302, '/api/integrations/slack/install')
  },

  disconnectSlack: async ({ locals, cookies }) => {
    if (!locals.session) return fail(401, { error: 'Unauthorized' })
    const orgId = cookies.get('gittan-active-org')
    if (!orgId) return fail(400, { error: 'No active org' })

    try {
      await apiPut(`/orgs/${orgId}`, locals.session, {
        slackClientId: null,
        slackClientSecret: null,
        slackBotToken: null,
        slackTeamName: null,
      })
      return { disconnected: true }
    } catch {
      return fail(500, { error: 'Failed to disconnect Slack' })
    }
  },
}
