import { fail } from '@sveltejs/kit'
import { apiGet, apiPut } from '$lib/server/api'
import type { PageServerLoad, Actions } from './$types'
import type { TTeam } from '$lib/types'

export const load: PageServerLoad = async ({ params, parent, locals }) => {
  const { teams, activeOrgId } = await parent()
  const team = (teams as TTeam[]).find((t) => t.name === params.teamName)
  if (!team) return { team: null, slackConnected: false }

  let slackConnected = false
  try {
    const org = await apiGet<{ slackBotToken?: string }>(`/orgs/${activeOrgId}`, locals.session!)
    slackConnected = !!org.slackBotToken
  } catch { /* ignore */ }

  return { team, slackConnected }
}

export const actions: Actions = {
  save: async ({ request, locals, cookies, params }) => {
    if (!locals.session) return fail(401, { error: 'Unauthorized' })
    const orgId = cookies.get('gittan-active-org')
    if (!orgId) return fail(400, { error: 'No active org' })

    const data = await request.formData()
    const slackChannel = (data.get('slackChannel') as string)?.trim() ?? ''

    const allTeams = await apiGet<TTeam[]>(`/orgs/${orgId}/teams`, locals.session).catch(() => [] as TTeam[])
    const team = allTeams.find((t) => t.name === params.teamName)
    if (!team) return fail(400, { error: 'Team not found' })

    try {
      await apiPut(`/teams/${team.id}`, locals.session, { slackChannel: slackChannel || null })
      return { saved: true }
    } catch {
      return fail(500, { error: 'Failed to save notification settings' })
    }
  },
}
