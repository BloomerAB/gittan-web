import type { PageServerLoad } from './$types'
import { apiGet } from '$lib/server/api'

type TStep = {
  scope: string
  name: string
  image: string
  run: string
  description?: string
}

export const load: PageServerLoad = async ({ params, parent, locals }) => {
  const { teams, activeOrgId } = await parent()
  const team = teams?.find((t: any) => t.name === params.teamName)
  const orgId = team?.orgId ?? activeOrgId

  if (!orgId || !team || !locals.session) {
    return { teamSteps: [], orgSteps: [], teamName: params.teamName }
  }

  const [teamSteps, orgSteps] = await Promise.all([
    apiGet<TStep[]>(`/teams/${team.id}/steps`, locals.session).catch(() => []),
    apiGet<TStep[]>(`/orgs/${orgId}/steps`, locals.session).catch(() => []),
  ])

  return { teamSteps, orgSteps, teamName: params.teamName }
}
