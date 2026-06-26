import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'
import type { TOrg } from '$lib/types'

export const load: LayoutServerLoad = async ({ parent }) => {
  const { orgs, activeOrgId } = await parent()
  const activeOrg = (orgs as TOrg[]).find((o) => o.id === activeOrgId)

  if (!activeOrg || activeOrg.role !== 'owner') {
    redirect(302, '/app')
  }

  return { activeOrg }
}
