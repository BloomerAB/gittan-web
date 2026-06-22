import { redirect, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { config } from '$lib/server/config'

export const GET: RequestHandler = async () => {
  if (!config.slackConfigured) {
    return json(
      { error: 'Slack integration is not configured yet. Contact your platform administrator.' },
      { status: 503 },
    )
  }

  const params = new URLSearchParams({
    client_id: config.slackClientId,
    scope: 'chat:write,channels:read',
    redirect_uri: `${config.appUrl}/api/integrations/slack/callback`,
  })

  redirect(302, `https://slack.com/oauth/v2/authorize?${params.toString()}`)
}
