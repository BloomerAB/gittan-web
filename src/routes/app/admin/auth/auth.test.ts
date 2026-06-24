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
}))

const { mockGetProviderIdForIssuer, mockStartIdentityLink } = vi.hoisted(() => ({
  mockGetProviderIdForIssuer: vi.fn().mockResolvedValue(null),
  mockStartIdentityLink: vi.fn().mockResolvedValue(null),
}))

vi.mock('$lib/server/auth-identity', () => ({
  getLinkedIdentities: vi.fn().mockResolvedValue([]),
  getProviderIdForIssuer: mockGetProviderIdForIssuer,
  startIdentityLink: mockStartIdentityLink,
}))

vi.mock('$lib/server/config', () => ({
  config: { appUrl: 'https://gittan.eu' },
}))

vi.mock('./$types', () => ({}))

import { actions, load } from './+page.server.js'

type TLoadResult = { org: Record<string, unknown> | null; linkedIdentities: unknown[] }

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

describe('auth page load', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns org data and linked identities from API', async () => {
    const orgData = {
      id: 'org-1',
      name: 'test-org',
      displayName: 'Test Org',
      oidcIssuer: 'https://idp.example.com',
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
    expect(result.linkedIdentities).toEqual([])
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
})

describe('auth actions - saveOidc', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('saves OIDC configuration', async () => {
    mockApiPut.mockResolvedValue({})
    const cookies = createMockCookies('org-1')

    const result = await actions.saveOidc({
      request: {
        formData: async () => createFormData({
          oidcIssuer: 'https://idp.example.com',
          oidcClientId: 'my-oidc-client',
          oidcClientSecret: '',
          ssoEmailDomain: 'example.com',
          groupsClaim: 'groups',
        }),
      },
      locals: { session: TEST_SESSION },
      cookies,
    } as any)

    expect(result).toEqual({ savedOidc: true })
    expect(mockApiPut).toHaveBeenCalledWith('/orgs/org-1', TEST_SESSION, {
      oidcIssuer: 'https://idp.example.com',
      oidcClientId: 'my-oidc-client',
      oidcClientSecret: undefined,
      ssoEmailDomain: 'example.com',
      groupsClaim: 'groups',
    })
  })

  it('converts empty strings to undefined/null', async () => {
    mockApiPut.mockResolvedValue({})
    const cookies = createMockCookies('org-1')

    await actions.saveOidc({
      request: {
        formData: async () => createFormData({
          oidcIssuer: '',
          oidcClientId: '',
          oidcClientSecret: '',
          ssoEmailDomain: '',
          groupsClaim: '',
        }),
      },
      locals: { session: TEST_SESSION },
      cookies,
    } as any)

    expect(mockApiPut).toHaveBeenCalledWith('/orgs/org-1', TEST_SESSION, {
      oidcIssuer: undefined,
      oidcClientId: undefined,
      oidcClientSecret: undefined,
      ssoEmailDomain: null,
      groupsClaim: undefined,
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
  })

  it('returns 500 when API call fails', async () => {
    mockApiPut.mockRejectedValue(new Error('Network error'))
    const cookies = createMockCookies('org-1')

    const result = await actions.saveOidc({
      request: {
        formData: async () => createFormData({
          oidcIssuer: 'https://idp.example.com',
          oidcClientId: 'client',
          oidcClientSecret: '',
          ssoEmailDomain: '',
          groupsClaim: '',
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
})

describe('auth actions - verifyOidc', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns verify URL when provider exists', async () => {
    mockApiGet.mockResolvedValue({ oidcIssuer: 'https://idp.example.com' })
    mockGetProviderIdForIssuer.mockResolvedValue('provider-1')
    mockStartIdentityLink.mockResolvedValue('https://idp.example.com/auth?state=xyz')
    const cookies = createMockCookies('org-1')

    const result = await actions.verifyOidc({
      locals: { session: TEST_SESSION },
      cookies,
    } as any)

    expect(result).toEqual({ verifyUrl: 'https://idp.example.com/auth?state=xyz' })
  })

  it('returns alreadyVerified when link returns null', async () => {
    mockApiGet.mockResolvedValue({ oidcIssuer: 'https://idp.example.com' })
    mockGetProviderIdForIssuer.mockResolvedValue('provider-1')
    mockStartIdentityLink.mockResolvedValue(null)
    const cookies = createMockCookies('org-1')

    const result = await actions.verifyOidc({
      locals: { session: TEST_SESSION },
      cookies,
    } as any)

    expect(result).toEqual({ alreadyVerified: true })
  })

  it('returns 401 when not authenticated', async () => {
    const result = await actions.verifyOidc({
      locals: { session: null },
      cookies: createMockCookies('org-1'),
    } as any)

    expect(result).toEqual({
      status: 401,
      data: { error: 'Unauthorized' },
      type: 'failure',
    })
  })

  it('returns 400 when no OIDC issuer configured', async () => {
    mockApiGet.mockResolvedValue({ oidcIssuer: null })
    const cookies = createMockCookies('org-1')

    const result = await actions.verifyOidc({
      locals: { session: TEST_SESSION },
      cookies,
    } as any)

    expect(result).toEqual({
      status: 400,
      data: { error: 'No OIDC issuer configured' },
      type: 'failure',
    })
  })
})
