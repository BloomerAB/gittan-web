import type { PageServerLoad } from './$types'
import { apiGet } from '$lib/server/api'
import type { TRepoActivity, TTeamMetrics } from '$lib/types'

export const load: PageServerLoad = async ({ params, parent, locals }) => {
  const { teams, reposByTeam } = await parent()
  const team = teams.find((t: any) => t.name === params.teamName)

  if (!team || !locals.session) {
    return { activity: {}, metrics: null }
  }

  // reposByTeam comes from the parent (app) layout; this page only needs the
  // per-team activity + metrics that the team index loads.
  void reposByTeam

  const [activityList, metrics] = await Promise.all([
    apiGet<TRepoActivity[]>(`/teams/${team.id}/activity`, locals.session!).catch(() => []),
    apiGet<TTeamMetrics>(`/teams/${team.id}/metrics`, locals.session!).catch(() => null),
  ])

  const activity: Record<string, TRepoActivity> = {}
  for (const a of activityList) activity[a.repoId] = a

  return { activity, metrics }
}
