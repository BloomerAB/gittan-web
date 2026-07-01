import type { PageServerLoad } from './$types'
import { apiGet } from '$lib/server/api'
import type { TTeamMetrics } from '$lib/types'

// One entry per repo the team owns (LEFT-JOINed with its latest run by the API).
// `status` is the latest run's status, or "never_run" if the repo has no runs.
type TRepoStatus = {
  readonly repoId: string
  readonly repoName: string
  readonly branch: string | null
  readonly status: string
  readonly startedAt: string | null
  readonly runId: string | null
}

export const load: PageServerLoad = async ({ params, parent, locals }) => {
  const { teams } = await parent()
  const team = teams?.find((t: any) => t.name === params.teamName)

  if (!team) {
    return { statuses: [], teamId: '', teamNotFound: true, metrics: null }
  }
  if (!locals.session) {
    return { statuses: [], teamId: team.id, teamNotFound: false, metrics: null }
  }

  const [statuses, metrics] = await Promise.all([
    apiGet<TRepoStatus[]>(`/teams/${team.id}/pipeline-status`, locals.session).catch(() => []),
    apiGet<TTeamMetrics>(`/teams/${team.id}/metrics`, locals.session).catch(() => null),
  ])

  return { statuses, teamId: team.id, teamNotFound: false, metrics }
}
