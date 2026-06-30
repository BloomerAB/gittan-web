import type { PageServerLoad } from './$types'
import { apiGet } from '$lib/server/api'
import type { TRepo, TRepoActivity, TTeamMetrics } from '$lib/types'

type TPipelineRunSummary = {
  readonly runId: string
  readonly repoId: string
  readonly branch: string
  readonly status: string
  readonly startedAt: string
}

type TSharedPipeline = {
  readonly name: string
  readonly scope: string
  readonly mode: 'enforce' | 'default'
  readonly match: { files?: string[]; name?: string; tags?: string[] } | null
  readonly stepCount: number
  readonly steps: { name: string; use?: string; image?: string }[]
  readonly description: string
}

export const load: PageServerLoad = async ({ params, parent, locals }) => {
  const { teams, reposByTeam } = await parent()
  const team = teams.find((t: any) => t.name === params.teamName)

  if (!team) {
    return { pipelines: [], sharedPipelines: [], repoMap: {}, teamNotFound: true, activity: {}, metrics: null }
  }

  if (!locals.session) {
    return { pipelines: [], sharedPipelines: [], repoMap: {}, teamNotFound: false, activity: {}, metrics: null }
  }

  const repos = (reposByTeam[team.id] ?? []) as TRepo[]
  const repoMap = Object.fromEntries(repos.map(r => [r.id, r]))

  const [pipelines, sharedPipelines, activityList, metrics] = await Promise.all([
    apiGet<TPipelineRunSummary[]>(`/teams/${team.id}/pipelines`, locals.session!).catch(() => []),
    apiGet<TSharedPipeline[]>(`/teams/${team.id}/shared-pipelines`, locals.session!).catch(() => []),
    apiGet<TRepoActivity[]>(`/teams/${team.id}/activity`, locals.session!).catch(() => []),
    apiGet<TTeamMetrics>(`/teams/${team.id}/metrics`, locals.session!).catch(() => null),
  ])

  const activity: Record<string, TRepoActivity> = {}
  for (const a of activityList) activity[a.repoId] = a

  return { pipelines, sharedPipelines, repoMap, teamNotFound: false, activity, metrics }
}
