import { redirect, error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { config } from '$lib/server/config'
import { getSession } from '$lib/server/session'
import { apiPut } from '$lib/server/api'

export const GET: RequestHandler = async ({ url, cookies }) => {
  const code = url.searchParams.get('code')
  if (!code) {
    error(400, 'Missing code parameter from Slack')
  }

  if (!config.slackConfigured) {
    error(503, 'Slack integration is not configured')
  }

  const session = getSession(cookies)
  if (!session) {
    redirect(302, '/auth/login')
  }

  const orgId = cookies.get('gittan-active-org')
  if (!orgId) {
    error(400, 'No active organization')
  }

  const tokenResponse = await fetch('https://slack.com/api/oauth.v2.access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: config.slackClientId,
      client_secret: config.slackClientSecret,
      code,
      redirect_uri: `${config.appUrl}/api/integrations/slack/callback`,
    }).toString(),
  })

  const data = await tokenResponse.json()

  if (!data.ok) {
    error(502, `Slack OAuth failed: ${data.error ?? 'unknown error'}`)
  }

  await apiPut(`/orgs/${orgId}`, session, {
    slackTeamName: data.team?.name ?? 'Unknown',
    slackBotToken: data.access_token,
  })

  redirect(302, '/app/admin/integrations')
}
