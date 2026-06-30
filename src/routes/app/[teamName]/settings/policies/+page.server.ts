import type { PageServerLoad } from './$types'
import { apiGet } from '$lib/server/api'

type TPolicyStep = { position: 'before' | 'after'; name: string; use: string }
type TPolicy = {
  id: string
  name: string
  description?: string
  matchFiles?: string
  matchTeam?: string
  matchName?: string
  steps: TPolicyStep[]
}

export const load: PageServerLoad = async ({ params, parent, locals }) => {
  const { teams, activeOrgId } = await parent()
  const team = teams.find((t: any) => t.name === params.teamName)
  const orgId = team?.orgId ?? activeOrgId

  if (!team || !orgId || !locals.session) {
    return { policies: [], teamName: params.teamName }
  }

  const all = await apiGet<TPolicy[]>(`/orgs/${orgId}/policies`, locals.session).catch(() => [])
  // Team-scoped policies are those whose match.team is this team.
  const policies = all.filter((p) => p.matchTeam === params.teamName)

  return { policies, teamName: params.teamName }
}
