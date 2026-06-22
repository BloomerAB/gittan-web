import { redirect, error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { config } from '$lib/server/config'
import { getSession } from '$lib/server/session'
import { apiGet, apiPut } from '$lib/server/api'

type TOrgSlack = {
  slackClientId?: string
  slackClientSecret?: string
}

export const GET: RequestHandler = async ({ url, cookies }) => {
  const code = url.searchParams.get('code')
  if (!code) error(400, 'Missing code parameter from Slack')

  const session = getSession(cookies)
  if (!session) redirect(302, '/auth/login')

  const orgId = cookies.get('gittan-active-org')
  if (!orgId) error(400, 'No active organization')

  const org = await apiGet<TOrgSlack>(`/orgs/${orgId}`, session)
  if (!org?.slackClientId || !org?.slackClientSecret) {
    error(400, 'Slack credentials not configured for this organization')
  }

  const tokenResponse = await fetch('https://slack.com/api/oauth.v2.access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: org.slackClientId,
      client_secret: org.slackClientSecret,
      code,
      redirect_uri: `${config.appUrl}/api/integrations/slack/callback`,
    }).toString(),
  })

  const data = await tokenResponse.json()

  if (!data.ok) {
    error(502, `Slack OAuth failed: ${data.error ?? 'unknown error'}`)
  }

  await apiPut(`/orgs/${orgId}`, session, {
    slackBotToken: data.access_token,
    slackTeamName: data.team?.name ?? 'Unknown',
  })

  redirect(302, '/app/admin/integrations')
}
