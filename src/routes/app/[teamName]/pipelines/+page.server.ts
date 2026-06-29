import type { PageServerLoad } from './$types'
import { apiGet } from '$lib/server/api'
import type { TRepo } from '$lib/types'

type TPipelineRunSummary = {
  readonly runId: string
  readonly repoId: string
  readonly branch: string
  readonly status: string
  readonly startedAt: string
}

export const load: PageServerLoad = async ({ params, parent, locals }) => {
  const { teams, reposByTeam } = await parent()
  const team = teams.find((t: any) => t.name === params.teamName)

  if (!team) {
    return { pipelines: [], repoMap: {}, teamNotFound: true }
  }

  if (!locals.session) {
    return { pipelines: [], repoMap: {}, teamNotFound: false }
  }

  const repos = (reposByTeam[team.id] ?? []) as TRepo[]
  const repoMap = Object.fromEntries(repos.map(r => [r.id, r]))

  const pipelines = await apiGet<TPipelineRunSummary[]>(
    `/teams/${team.id}/pipelines`,
    locals.session!
  ).catch(() => [])

  return { pipelines, repoMap, teamNotFound: false }
}
