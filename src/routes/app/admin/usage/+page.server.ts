import type { PageServerLoad } from './$types'
import { apiGet } from '$lib/server/api'
import type { TPlatformUsage } from '$lib/types'

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.session) {
    return { platformUsage: null }
  }

  const usage = await apiGet<TPlatformUsage>('/platform/usage', locals.session)

  return { platformUsage: usage }
}
