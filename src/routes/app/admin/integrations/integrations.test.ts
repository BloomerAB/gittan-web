import { describe, it, expect, beforeEach, vi } from 'vitest'

const { mockApiGet, mockApiPut } = vi.hoisted(() => ({
  mockApiGet: vi.fn(),
  mockApiPut: vi.fn(),
}))

vi.mock('$lib/server/api', () => ({
  apiGet: mockApiGet,
  apiPut: mockApiPut,
}))

vi.mock('$lib/server/config', () => ({
  config: {
    slackConfigured: false,
  },
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

type TLoadResult = { org: Record<string, unknown> | null; slackConfigured: boolean }

const TEST_SESSION = {
  accessToken: 'test-access-token',
  refreshToken: 'test-refresh-token',
  expiresAt: Date.now() + 3600 * 1000,
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

describe('integrations page load', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns org data from API', async () => {
    const orgData = {
      id: 'org-1',
      name: 'test-org',
      displayName: 'Test Org',
      slackTeamName: 'My Workspace',
    }
    mockApiGet.mockResolvedValue(orgData)

    const result = await load({
      parent: async () => ({
        orgs: [{ id: 'org-1', name: 'test-org', displayName: 'Test Org' }],
        activeOrgId: 'org-1',
      }),
      locals: { session: TEST_SESSION },
    } as any) as TLoadResult

    expect(result.org).toEqual(orgData)
    expect(mockApiGet).toHaveBeenCalledWith('/orgs/org-1', TEST_SESSION)
  })

  it('returns null org when no active org', async () => {
    const result = await load({
      parent: async () => ({
        orgs: [],
        activeOrgId: undefined,
      }),
      locals: { session: TEST_SESSION },
    } as any) as TLoadResult

    expect(result.org).toBeNull()
    expect(mockApiGet).not.toHaveBeenCalled()
  })

  it('returns null org when no session', async () => {
    const result = await load({
      parent: async () => ({
        orgs: [],
        activeOrgId: 'org-1',
      }),
      locals: { session: null },
    } as any) as TLoadResult

    expect(result.org).toBeNull()
  })

  it('includes slackConfigured flag', async () => {
    mockApiGet.mockResolvedValue({ id: 'org-1' })

    const result = await load({
      parent: async () => ({
        orgs: [],
        activeOrgId: 'org-1',
      }),
      locals: { session: TEST_SESSION },
    } as any) as TLoadResult

    expect(result).toHaveProperty('slackConfigured')
  })

  it('falls back to orgs list when API fails', async () => {
    mockApiGet.mockRejectedValue(new Error('API error'))

    const orgs = [
      { id: 'org-1', name: 'test-org', displayName: 'Test Org', role: 'owner', plan: 'team' },
    ]

    const result = await load({
      parent: async () => ({
        orgs,
        activeOrgId: 'org-1',
      }),
      locals: { session: TEST_SESSION },
    } as any) as TLoadResult

    expect(result.org).toEqual(orgs[0])
  })

  it('falls back to null when API fails and org not in list', async () => {
    mockApiGet.mockRejectedValue(new Error('API error'))

    const result = await load({
      parent: async () => ({
        orgs: [],
        activeOrgId: 'org-1',
      }),
      locals: { session: TEST_SESSION },
    } as any) as TLoadResult

    expect(result.org).toBeNull()
  })
})

describe('integrations actions - disconnectSlack', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('disconnects Slack successfully', async () => {
    mockApiPut.mockResolvedValue({})
    const cookies = createMockCookies('org-1')

    const result = await actions.disconnectSlack({
      locals: { session: TEST_SESSION },
      cookies,
    } as any)

    expect(result).toEqual({ disconnected: true })
    expect(mockApiPut).toHaveBeenCalledWith('/orgs/org-1', TEST_SESSION, {
      slackTeamName: null,
      slackBotToken: null,
    })
  })

  it('returns 401 when not authenticated', async () => {
    const result = await actions.disconnectSlack({
      locals: { session: null },
      cookies: createMockCookies('org-1'),
    } as any)

    expect(result).toEqual({
      status: 401,
      data: { error: 'Unauthorized' },
      type: 'failure',
    })
    expect(mockApiPut).not.toHaveBeenCalled()
  })

  it('returns 400 when no active org', async () => {
    const result = await actions.disconnectSlack({
      locals: { session: TEST_SESSION },
      cookies: createMockCookies(undefined),
    } as any)

    expect(result).toEqual({
      status: 400,
      data: { error: 'No active org' },
      type: 'failure',
    })
    expect(mockApiPut).not.toHaveBeenCalled()
  })

  it('returns 500 when API call fails', async () => {
    mockApiPut.mockRejectedValue(new Error('API down'))
    const cookies = createMockCookies('org-1')

    const result = await actions.disconnectSlack({
      locals: { session: TEST_SESSION },
      cookies,
    } as any)

    expect(result).toEqual({
      status: 500,
      data: { slackError: 'Failed to disconnect Slack' },
      type: 'failure',
    })
  })
})
