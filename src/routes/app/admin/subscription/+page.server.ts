import { apiGet } from '$lib/server/api'
import type { PageServerLoad } from './$types'

type TUsage = {
  storageBytes: number
  ciMinutesUsed: number
  ciMinutesLimit: number
}

export const load: PageServerLoad = async ({ parent, locals }) => {
  const { activeOrgId } = await parent()
  if (!activeOrgId || !locals.session) return { usage: null }

  try {
    const usage = await apiGet<TUsage>(`/orgs/${activeOrgId}/usage`, locals.session)
    return { usage }
  } catch {
    return { usage: null }
  }
}
