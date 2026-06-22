import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'
import { apiGet } from '$lib/server/api'
import { getLinkedIdentities } from '$lib/server/auth-identity'
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
    teams = await apiGet<TTeam[]>(`/orgs/${activeOrgId}/teams`, session).catch(() => [] as TTeam[])

    const repoMap: Record<string, TRepo[]> = {}
    await Promise.all(
      teams.map(async (team) => {
        repoMap[team.id] = await apiGet<TRepo[]>(`/teams/${team.id}/repos`, session).catch(() => [] as TRepo[])
      }),
    )
    reposByTeam = repoMap

    usage = await apiGet<TOrgUsage>(`/orgs/${activeOrgId}/usage`, session).catch(() => null)
  }

  const activeOrg = orgs.find((o) => o.id === activeOrgId)
  let ssoRequired = false

  if (activeOrg?.oidcIssuer && activeOrg.mandatorySso && activeOrg.role !== 'owner') {
    const links = await getLinkedIdentities(session)
    const hasLink = links.some((l) => l.issuer === activeOrg.oidcIssuer)
    ssoRequired = !hasLink
  }

  return { orgs, activeOrgId, teams, reposByTeam, usage, ssoRequired }
}
