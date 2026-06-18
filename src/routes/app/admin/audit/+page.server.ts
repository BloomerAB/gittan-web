import { apiGet } from '$lib/server/api'
import type { PageServerLoad } from './$types'

type TAuditEvent = {
  id: string
  actorEmail: string
  action: string
  resourceType: string
  resourceId: string
  detail: string
  createdAt: string
}

export const load: PageServerLoad = async ({ parent, locals }) => {
  const { activeOrgId } = await parent()
  const orgId = activeOrgId
  if (!orgId || !locals.session) return { auditEvents: [] }

  try {
    const auditEvents = await apiGet<TAuditEvent[]>(`/orgs/${orgId}/audit?limit=50`, locals.session)
    return { auditEvents: auditEvents ?? [] }
  } catch {
    return { auditEvents: [] }
  }
}
