import type { PageServerLoad } from './$types'
import { apiGet } from '$lib/server/api'

type TSharedPipeline = {
  readonly name: string
  readonly mode: 'enforce' | 'default'
  readonly match: { files?: string[]; name?: string; tags?: string[] } | null
  readonly stepCount: number
  readonly steps: { name: string; use?: string; image?: string }[]
  readonly description: string
}

export const load: PageServerLoad = async ({ params, parent, locals }) => {
  const { teams } = await parent()
  const team = teams.find((t: any) => t.name === params.teamName)

  if (!team || !locals.session) {
    return { sharedPipelines: [], teamName: params.teamName }
  }

  const sharedPipelines = await apiGet<TSharedPipeline[]>(
    `/teams/${team.id}/shared-pipelines`,
    locals.session,
  ).catch(() => [])

  return { sharedPipelines, teamName: params.teamName }
}
