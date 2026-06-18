import { describe, it, expect, beforeEach, vi } from 'vitest'

const { mockApiGet, mockApiPut } = vi.hoisted(() => ({
  mockApiGet: vi.fn(),
  mockApiPut: vi.fn(),
}))

vi.mock('$lib/server/api', () => ({
  apiGet: mockApiGet,
  apiPut: mockApiPut,
}))

// SvelteKit's fail() returns an ActionFailure object
vi.mock('@sveltejs/kit', () => ({
  fail: (status: number, data: Record<string, unknown>) => ({
    status,
    data,
    type: 'failure',
  }),
}))

// Mock the SvelteKit generated types
vi.mock('./$types', () => ({}))

import { actions, load } from './+page.server.js'

const TEST_SESSION = {
  accessToken: 'test-access-token',
  refreshToken: 'test-refresh-token',
  expiresAt: Date.now() + 3600 * 1000,
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

describe('integrations page load', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns org data from API', async () => {
    const orgData = {
      id: 'org-1',
      name: 'test-org',
      displayName: 'Test Org',
      oidcIssuer: 'https://idp.example.com',
      oidcClientId: 'oidc-client',
    }
    mockApiGet.mockResolvedValue(orgData)

    const result = await load({
      parent: async () => ({
        orgs: [{ id: 'org-1', name: 'test-org', displayName: 'Test Org' }],
        activeOrgId: 'org-1',
      }),
      locals: { session: TEST_SESSION },
    } as any)

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
    } as any)

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
    } as any)

    expect(result.org).toBeNull()
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
    } as any)

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
    } as any)

    expect(result.org).toBeNull()
  })
})

describe('integrations actions - saveOidc', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('saves OIDC configuration successfully', async () => {
    mockApiPut.mockResolvedValue({})
    const cookies = createMockCookies('org-1')

    const result = await actions.saveOidc({
      request: {
        formData: async () => createFormData({
          oidcIssuer: 'https://idp.example.com',
          oidcClientId: 'my-oidc-client',
          groupsClaim: 'groups',
          mandatorySso: 'true',
        }),
      },
      locals: { session: TEST_SESSION },
      cookies,
    } as any)

    expect(result).toEqual({ savedOidc: true })
    expect(mockApiPut).toHaveBeenCalledWith('/orgs/org-1', TEST_SESSION, {
      oidcIssuer: 'https://idp.example.com',
      oidcClientId: 'my-oidc-client',
      groupsClaim: 'groups',
      mandatorySso: true,
    })
  })

  it('converts empty strings to undefined', async () => {
    mockApiPut.mockResolvedValue({})
    const cookies = createMockCookies('org-1')

    await actions.saveOidc({
      request: {
        formData: async () => createFormData({
          oidcIssuer: '',
          oidcClientId: '',
          groupsClaim: '',
          mandatorySso: 'false',
        }),
      },
      locals: { session: TEST_SESSION },
      cookies,
    } as any)

    expect(mockApiPut).toHaveBeenCalledWith('/orgs/org-1', TEST_SESSION, {
      oidcIssuer: undefined,
      oidcClientId: undefined,
      groupsClaim: undefined,
      mandatorySso: false,
    })
  })

  it('returns 401 when not authenticated', async () => {
    const result = await actions.saveOidc({
      request: { formData: async () => createFormData({}) },
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
    const result = await actions.saveOidc({
      request: { formData: async () => createFormData({}) },
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
    mockApiPut.mockRejectedValue(new Error('Network error'))
    const cookies = createMockCookies('org-1')

    const result = await actions.saveOidc({
      request: {
        formData: async () => createFormData({
          oidcIssuer: 'https://idp.example.com',
          oidcClientId: 'client',
          groupsClaim: '',
          mandatorySso: 'false',
        }),
      },
      locals: { session: TEST_SESSION },
      cookies,
    } as any)

    expect(result).toEqual({
      status: 500,
      data: { error: 'Failed to save OIDC configuration' },
      type: 'failure',
    })
  })

  it('treats mandatorySso as false when value is not "true"', async () => {
    mockApiPut.mockResolvedValue({})
    const cookies = createMockCookies('org-1')

    await actions.saveOidc({
      request: {
        formData: async () => createFormData({
          oidcIssuer: 'https://idp.example.com',
          oidcClientId: 'client',
          groupsClaim: '',
          mandatorySso: 'false',
        }),
      },
      locals: { session: TEST_SESSION },
      cookies,
    } as any)

    const putBody = mockApiPut.mock.calls[0][2]
    expect(putBody.mandatorySso).toBe(false)
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
