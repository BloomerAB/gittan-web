import type { RequestHandler } from './$types'
import { config } from '$lib/server/config'

export const GET: RequestHandler = async ({ url, locals }) => {
  if (!locals.session) {
    return new Response('Not authenticated', { status: 401 })
  }

  const orgId = url.searchParams.get('orgId')
  const repoId = url.searchParams.get('repoId')

  if (!orgId || !repoId) {
    return new Response('Missing orgId or repoId', { status: 400 })
  }

  const apiUrl = `${config.gittanApiUrl}/orgs/${encodeURIComponent(orgId)}/repos/${encodeURIComponent(repoId)}/pipelines/live`

  const upstream = await fetch(apiUrl, {
    headers: { Authorization: `Bearer ${locals.session.accessToken}` },
  })

  if (!upstream.ok || !upstream.body) {
    return new Response('Failed to connect to pipeline stream', { status: 502 })
  }

  return new Response(upstream.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
