import type { PageServerLoad } from './$types'
import { apiGet } from '$lib/server/api'
import type { TRepoActivity, TTeamMetrics } from '$lib/types'

export const load: PageServerLoad = async ({ params, parent, locals }) => {
  const { teams } = await parent()
  const team = teams.find((t: any) => t.name === params.teamName)
  if (!team) return { activity: {}, metrics: null }

  const [activityList, metrics] = await Promise.all([
    apiGet<TRepoActivity[]>(`/teams/${team.id}/activity`, locals.session!),
    apiGet<TTeamMetrics>(`/teams/${team.id}/metrics`, locals.session!),
  ])

  const activity: Record<string, TRepoActivity> = {}
  for (const a of activityList) activity[a.repoId] = a

  return { activity, metrics }
}
