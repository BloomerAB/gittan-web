import { redirect, error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { config } from '$lib/server/config'
import { getSession } from '$lib/server/session'
import { apiGet } from '$lib/server/api'

export const GET: RequestHandler = async ({ cookies }) => {
  const session = getSession(cookies)
  if (!session) redirect(302, '/auth/login')

  const orgId = cookies.get('gittan-active-org')
  if (!orgId) error(400, 'No active organization')

  const org = await apiGet<{ slackClientId?: string }>(`/orgs/${orgId}`, session)
  if (!org?.slackClientId) {
    redirect(302, '/app/admin/integrations')
  }

  const params = new URLSearchParams({
    client_id: org.slackClientId,
    scope: 'chat:write,channels:read',
    redirect_uri: `${config.appUrl}/api/integrations/slack/callback`,
  })

  redirect(302, `https://slack.com/oauth/v2/authorize?${params.toString()}`)
}
