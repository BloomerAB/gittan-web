import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'
import { apiGet } from '$lib/server/api'
import type { TOrg, TTeam, TRepo, TOrgUsage } from '$lib/types'

export const load: LayoutServerLoad = async ({ locals, cookies }) => {
  const session = locals.session
  if (!session) {
    redirect(302, '/auth/login')
  }

  const orgs = await apiGet<TOrg[]>('/user/orgs', session).catch(() => [] as TOrg[])

  const savedOrg = cookies.get('gittan-active-org')
  const activeOrgId = orgs.find(o => o.id === savedOrg)?.id ?? orgs[0]?.id ?? ''

  if (activeOrgId && activeOrgId !== savedOrg) {
    cookies.set('gittan-active-org', activeOrgId, {
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })
  }

  let teams: TTeam[] = []
  let reposByTeam: Record<string, TRepo[]> = {}
  let usage: TOrgUsage | null = null

  if (activeOrgId) {
    teams = await apiGet<TTeam[]>(`/orgs/${activeOrgId}/teams`, session)

    const repoMap: Record<string, TRepo[]> = {}
    await Promise.all(
      teams.map(async (team) => {
        repoMap[team.id] = await apiGet<TRepo[]>(`/teams/${team.id}/repos`, session)
      }),
    )
    reposByTeam = repoMap

    usage = await apiGet<TOrgUsage>(`/orgs/${activeOrgId}/usage`, session).catch(() => null)
  }

  return { orgs, activeOrgId, teams, reposByTeam, usage }
}
