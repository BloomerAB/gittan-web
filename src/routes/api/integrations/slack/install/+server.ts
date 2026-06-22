import { redirect, error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { config } from '$lib/server/config'

export const GET: RequestHandler = async () => {
  if (!config.slackConfigured) {
    error(503, 'Slack integration is not configured yet. The platform needs SLACK_CLIENT_ID and SLACK_CLIENT_SECRET to be set.')
  }

  const params = new URLSearchParams({
    client_id: config.slackClientId,
    scope: 'chat:write,channels:read',
    redirect_uri: `${config.appUrl}/api/integrations/slack/callback`,
  })

  redirect(302, `https://slack.com/oauth/v2/authorize?${params.toString()}`)
}
