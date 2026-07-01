import type { PageServerLoad } from './$types'
import { apiGet } from '$lib/server/api'
import type { TRepo, TTeamMetrics } from '$lib/types'

type TRunSummary = {
  readonly runId: string
  readonly repoId: string
  readonly branch: string
  readonly status: string
  readonly startedAt: string
}

export const load: PageServerLoad = async ({ params, parent, locals }) => {
  const { teams, reposByTeam } = await parent()
  const team = teams?.find((t: any) => t.name === params.teamName)

  if (!team) {
    return { statuses: [], repoMap: {}, teamId: '', teamNotFound: true, metrics: null }
  }
  if (!locals.session) {
    return { statuses: [], repoMap: {}, teamId: team.id, teamNotFound: false, metrics: null }
  }

  const repos = (reposByTeam[team.id] ?? []) as TRepo[]
  const repoMap = Object.fromEntries(repos.map((r) => [r.id, r]))

  const [statuses, metrics] = await Promise.all([
    apiGet<TRunSummary[]>(`/teams/${team.id}/pipeline-status`, locals.session).catch(() => []),
    apiGet<TTeamMetrics>(`/teams/${team.id}/metrics`, locals.session).catch(() => null),
  ])

  return { statuses, repoMap, teamId: team.id, teamNotFound: false, metrics }
}
