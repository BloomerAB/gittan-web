import { describe, it, expect, beforeEach, vi } from 'vitest'

const { mockApiGet, mockApiPut } = vi.hoisted(() => ({
  mockApiGet: vi.fn(),
  mockApiPut: vi.fn(),
}))

vi.mock('$lib/server/api', () => ({
  apiGet: mockApiGet,
  apiPut: mockApiPut,
}))

vi.mock('@sveltejs/kit', () => ({
  fail: (status: number, data: Record<string, unknown>) => ({
    status,
    data,
    type: 'failure',
  }),
  redirect: (status: number, location: string) => {
    throw Object.assign(new Error('redirect'), { status, location })
  },
}))

vi.mock('./$types', () => ({}))

import { actions, load } from './+page.server.js'

type TLoadResult = { org: Record<string, unknown> | null }

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

function createMockFormData(data: Record<string, string>) {
  return {
    get: vi.fn((key: string) => data[key] ?? null),
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
      slackBotToken: 'xoxb-token',
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

  it('falls back to orgs list when API fails', async () => {
    mockApiGet.mockRejectedValue(new Error('API error'))

    const orgs = [
      { id: 'org-1', name: 'test-org', displayName: 'Test Org' },
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
})

describe('integrations actions - saveSlackCredentials', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('saves credentials and redirects to Slack install', async () => {
    mockApiPut.mockResolvedValue({})
    const cookies = createMockCookies('org-1')

    await expect(actions.saveSlackCredentials({
      request: { formData: async () => createMockFormData({ slackClientId: 'cid', slackClientSecret: 'csec' }) },
      locals: { session: TEST_SESSION },
      cookies,
    } as any)).rejects.toMatchObject({ status: 302, location: '/api/integrations/slack/install' })

    expect(mockApiPut).toHaveBeenCalledWith('/orgs/org-1', TEST_SESSION, {
      slackClientId: 'cid',
      slackClientSecret: 'csec',
    })
  })

  it('trims whitespace from credentials', async () => {
    mockApiPut.mockResolvedValue({})
    const cookies = createMockCookies('org-1')

    await expect(actions.saveSlackCredentials({
      request: { formData: async () => createMockFormData({ slackClientId: '  cid  ', slackClientSecret: ' csec ' }) },
      locals: { session: TEST_SESSION },
      cookies,
    } as any)).rejects.toMatchObject({ status: 302 })

    expect(mockApiPut).toHaveBeenCalledWith('/orgs/org-1', TEST_SESSION, {
      slackClientId: 'cid',
      slackClientSecret: 'csec',
    })
  })

  it('returns 400 when credentials missing', async () => {
    const cookies = createMockCookies('org-1')

    const result = await actions.saveSlackCredentials({
      request: { formData: async () => createMockFormData({ slackClientId: '', slackClientSecret: '' }) },
      locals: { session: TEST_SESSION },
      cookies,
    } as any)

    expect(result).toEqual({
      status: 400,
      data: { error: 'Both Client ID and Client Secret are required' },
      type: 'failure',
    })
  })

  it('returns 401 when not authenticated', async () => {
    const result = await actions.saveSlackCredentials({
      request: { formData: async () => createMockFormData({ slackClientId: 'cid', slackClientSecret: 'csec' }) },
      locals: { session: null },
      cookies: createMockCookies('org-1'),
    } as any)

    expect(result).toEqual({
      status: 401,
      data: { error: 'Unauthorized' },
      type: 'failure',
    })
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
      slackClientId: null,
      slackClientSecret: null,
      slackBotToken: null,
      slackTeamName: null,
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
      data: { error: 'Failed to disconnect Slack' },
      type: 'failure',
    })
  })
})
