import { fail } from '@sveltejs/kit'
import { apiGet, apiPost, apiDelete } from '$lib/server/api'
import type { PageServerLoad, Actions } from './$types'

type TSSHKey = {
  id: number
  title: string
  fingerprint: string
  createdAt: string
}

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.session) return { keys: [] }

  const keys = await apiGet<TSSHKey[]>('/user/ssh-keys', locals.session).catch(() => [] as TSSHKey[])
  return { keys }
}

export const actions: Actions = {
  add: async ({ request, locals }) => {
    if (!locals.session) return fail(401, { error: 'Unauthorized' })

    const data = await request.formData()
    const title = (data.get('title') as string)?.trim()
    const key = (data.get('key') as string)?.trim()

    if (!title) return fail(400, { error: 'Title is required' })
    if (!key) return fail(400, { error: 'Public key is required' })

    try {
      await apiPost('/user/ssh-keys', locals.session, { title, key })
      return { added: true }
    } catch (err) {
      const raw = err instanceof Error ? err.message : 'Failed to add SSH key'
      if (raw.includes('422')) return fail(422, { error: 'Invalid SSH key or key already exists' })
      return fail(500, { error: raw })
    }
  },

  remove: async ({ request, locals }) => {
    if (!locals.session) return fail(401, { error: 'Unauthorized' })

    const data = await request.formData()
    const keyId = data.get('keyId') as string

    if (!keyId) return fail(400, { error: 'Key ID is required' })

    try {
      await apiDelete(`/user/ssh-keys/${keyId}`, locals.session)
      return { removed: true }
    } catch {
      return fail(500, { error: 'Failed to remove SSH key' })
    }
  },
}
