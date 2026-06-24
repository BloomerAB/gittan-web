import { describe, it, expect, beforeEach, vi } from 'vitest'

const { mockApiGet, mockApiPost, mockApiDelete } = vi.hoisted(() => ({
  mockApiGet: vi.fn(),
  mockApiPost: vi.fn(),
  mockApiDelete: vi.fn(),
}))

vi.mock('$lib/server/api', () => ({
  apiGet: mockApiGet,
  apiPost: mockApiPost,
  apiDelete: mockApiDelete,
}))

vi.mock('@sveltejs/kit', () => ({
  fail: (status: number, data: Record<string, unknown>) => ({
    status,
    data,
    type: 'failure',
  }),
}))

vi.mock('./$types', () => ({}))

import { actions, load } from './+page.server.js'

const TEST_SESSION = {
  accessToken: 'test-token',
  refreshToken: 'test-refresh',
  expiresAt: Date.now() + 3600_000,
}

function createFormData(entries: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [key, value] of Object.entries(entries)) {
    fd.set(key, value)
  }
  return fd
}

function createMockCookies(activeOrg?: string) {
  return {
    get: vi.fn((name: string) => {
      if (name === 'gittan-active-org') return activeOrg
      return undefined
    }),
    set: vi.fn(),
    delete: vi.fn(),
  }
}

describe('members page load', () => {
  beforeEach(() => vi.clearAllMocks())

  it('loads members and invites', async () => {
    const members = [{ userId: 'u1', email: 'a@b.c', name: 'A', role: 'owner', joinedAt: '2026-01-01' }]
    const invites = [{ id: 'i1', email: 'x@y.z', role: 'member', createdAt: '2026-01-01', expiresAt: '2026-01-08' }]
    mockApiGet.mockImplementation((path: string) => {
      if (path.includes('/members')) return Promise.resolve(members)
      if (path.includes('/invites')) return Promise.resolve(invites)
      return Promise.resolve([])
    })

    const result = await load({
      parent: async () => ({ orgs: [], activeOrgId: 'org-1' }),
      locals: { session: TEST_SESSION },
      cookies: createMockCookies('org-1'),
    } as any)

    expect((result as Record<string, unknown>).members).toEqual(members)
    expect((result as Record<string, unknown>).invites).toEqual(invites)
  })

  it('returns empty arrays when no session', async () => {
    const result = await load({
      parent: async () => ({ orgs: [], activeOrgId: 'org-1' }),
      locals: { session: null },
      cookies: createMockCookies(),
    } as any)

    expect((result as Record<string, unknown>).members).toEqual([])
    expect((result as Record<string, unknown>).invites).toEqual([])
  })
})

describe('members actions - invite', () => {
  beforeEach(() => vi.clearAllMocks())

  it('sends invite', async () => {
    mockApiPost.mockResolvedValue({ id: 'i1' })
    const cookies = createMockCookies('org-1')

    const result = await actions.invite({
      request: { formData: async () => createFormData({ email: 'new@test.com', role: 'member' }) },
      locals: { session: TEST_SESSION },
      cookies,
    } as any)

    expect(result).toEqual({ invited: true })
    expect(mockApiPost).toHaveBeenCalledWith('/orgs/org-1/invites', TEST_SESSION, { email: 'new@test.com', role: 'member' })
  })

  it('returns 400 when email is empty', async () => {
    const result = await actions.invite({
      request: { formData: async () => createFormData({ email: '', role: 'member' }) },
      locals: { session: TEST_SESSION },
      cookies: createMockCookies('org-1'),
    } as any)

    expect(result).toMatchObject({ status: 400 })
  })

  it('returns 401 when not authenticated', async () => {
    const result = await actions.invite({
      request: { formData: async () => createFormData({ email: 'a@b.c' }) },
      locals: { session: null },
      cookies: createMockCookies('org-1'),
    } as any)

    expect(result).toMatchObject({ status: 401 })
  })
})

describe('members actions - revoke', () => {
  beforeEach(() => vi.clearAllMocks())

  it('revokes invite', async () => {
    mockApiDelete.mockResolvedValue(undefined)
    const cookies = createMockCookies('org-1')

    const result = await actions.revoke({
      request: { formData: async () => createFormData({ inviteId: 'inv-1' }) },
      locals: { session: TEST_SESSION },
      cookies,
    } as any)

    expect(result).toEqual({ revoked: true })
    expect(mockApiDelete).toHaveBeenCalledWith('/orgs/org-1/invites/inv-1', TEST_SESSION)
  })
})

describe('members actions - remove', () => {
  beforeEach(() => vi.clearAllMocks())

  it('removes member', async () => {
    mockApiDelete.mockResolvedValue(undefined)
    const cookies = createMockCookies('org-1')

    const result = await actions.remove({
      request: { formData: async () => createFormData({ userId: 'user-1' }) },
      locals: { session: TEST_SESSION },
      cookies,
    } as any)

    expect(result).toEqual({ removed: true })
    expect(mockApiDelete).toHaveBeenCalledWith('/orgs/org-1/members/user-1', TEST_SESSION)
  })

  it('returns 401 when not authenticated', async () => {
    const result = await actions.remove({
      request: { formData: async () => createFormData({ userId: 'user-1' }) },
      locals: { session: null },
      cookies: createMockCookies('org-1'),
    } as any)

    expect(result).toMatchObject({ status: 401 })
  })
})
