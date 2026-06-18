import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('./config.js', () => ({
  config: {
    authApiUrl: 'https://auth.test',
    authPublicUrl: 'https://auth.test',
    oauthClientId: 'test-client-id',
    oauthClientSecret: 'test-client-secret',
    appUrl: 'https://app.test',
  },
}))

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

import {
  refreshAccessToken,
  exchangeCodeForTokens,
  generateState,
  validateState,
  buildAuthorizeUrl,
} from './oauth.js'

describe('refreshAccessToken', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns new tokens on successful refresh', async () => {
    const mockTokens = {
      access_token: 'new-access-token',
      refresh_token: 'new-refresh-token',
      token_type: 'Bearer',
      expires_in: 3600,
      scope: 'openid email profile read write',
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTokens,
    })

    const result = await refreshAccessToken('old-refresh-token')

    expect(result).toEqual(mockTokens)
    expect(result.access_token).toBe('new-access-token')
    expect(result.refresh_token).toBe('new-refresh-token')
  })

  it('sends correct request body with grant_type refresh_token', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: 'tok',
        refresh_token: 'ref',
        token_type: 'Bearer',
        expires_in: 3600,
        scope: 'openid',
      }),
    })

    await refreshAccessToken('my-refresh-token')

    expect(mockFetch).toHaveBeenCalledOnce()
    const [url, opts] = mockFetch.mock.calls[0]
    expect(url).toBe('https://auth.test/oauth/token')
    expect(opts.method).toBe('POST')
    expect(opts.headers['Content-Type']).toBe('application/x-www-form-urlencoded')

    const body = new URLSearchParams(opts.body)
    expect(body.get('grant_type')).toBe('refresh_token')
    expect(body.get('refresh_token')).toBe('my-refresh-token')
    expect(body.get('client_id')).toBe('test-client-id')
    expect(body.get('client_secret')).toBe('test-client-secret')
  })

  it('throws on non-200 response with error_description', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'invalid_grant',
        error_description: 'Refresh token expired',
      }),
    })

    await expect(refreshAccessToken('expired-token'))
      .rejects.toThrow('Refresh token expired')
  })

  it('throws on non-200 response with error field only', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'invalid_grant',
      }),
    })

    await expect(refreshAccessToken('bad-token'))
      .rejects.toThrow('invalid_grant')
  })

  it('throws generic message when error response is not JSON', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => { throw new Error('not json') },
    })

    await expect(refreshAccessToken('bad-token'))
      .rejects.toThrow('Token refresh failed')
  })

  it('throws when response is 200 but access_token is missing', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        refresh_token: 'ref',
        token_type: 'Bearer',
        expires_in: 3600,
      }),
    })

    await expect(refreshAccessToken('some-token'))
      .rejects.toThrow('Invalid token response from auth server')
  })

  it('throws when response is 200 but access_token is empty string', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: '',
        refresh_token: 'ref',
        token_type: 'Bearer',
        expires_in: 3600,
      }),
    })

    await expect(refreshAccessToken('some-token'))
      .rejects.toThrow('Invalid token response from auth server')
  })
})

describe('exchangeCodeForTokens', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns tokens on successful exchange', async () => {
    const mockTokens = {
      access_token: 'access-tok',
      refresh_token: 'refresh-tok',
      token_type: 'Bearer',
      expires_in: 3600,
      scope: 'openid',
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTokens,
    })

    const result = await exchangeCodeForTokens('auth-code-123')

    expect(result).toEqual(mockTokens)
  })

  it('sends correct request body with grant_type authorization_code', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: 'tok',
        refresh_token: 'ref',
        token_type: 'Bearer',
        expires_in: 3600,
        scope: 'openid',
      }),
    })

    await exchangeCodeForTokens('auth-code-abc')

    const [url, opts] = mockFetch.mock.calls[0]
    expect(url).toBe('https://auth.test/oauth/token')
    expect(opts.method).toBe('POST')

    const body = new URLSearchParams(opts.body)
    expect(body.get('grant_type')).toBe('authorization_code')
    expect(body.get('code')).toBe('auth-code-abc')
    expect(body.get('client_id')).toBe('test-client-id')
    expect(body.get('client_secret')).toBe('test-client-secret')
    expect(body.get('redirect_uri')).toBe('https://app.test/auth/callback')
  })

  it('throws on non-200 response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'invalid_grant', error_description: 'Code expired' }),
    })

    await expect(exchangeCodeForTokens('expired-code'))
      .rejects.toThrow('Code expired')
  })

  it('throws when access_token missing from response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token_type: 'Bearer', expires_in: 3600 }),
    })

    await expect(exchangeCodeForTokens('code'))
      .rejects.toThrow('Invalid token response from auth server')
  })
})

describe('generateState', () => {
  it('returns a string of expected length (two UUIDs without hyphens)', () => {
    const state = generateState()
    // UUID without hyphens = 32 chars, two of them = 64
    expect(state).toHaveLength(64)
    expect(state).toMatch(/^[a-f0-9]{64}$/)
  })

  it('returns unique values on successive calls', () => {
    const a = generateState()
    const b = generateState()
    expect(a).not.toBe(b)
  })
})

describe('validateState', () => {
  it('returns true for matching states', () => {
    expect(validateState('abc123', 'abc123')).toBe(true)
  })

  it('returns false for mismatched states', () => {
    expect(validateState('abc123', 'xyz789')).toBe(false)
  })

  it('returns false when expected is undefined', () => {
    expect(validateState(undefined, 'abc')).toBe(false)
  })

  it('returns false when received is null', () => {
    expect(validateState('abc', null)).toBe(false)
  })

  it('returns false for different length strings', () => {
    expect(validateState('abc', 'abcd')).toBe(false)
  })

  it('uses constant-time comparison (same length, different content)', () => {
    // This tests the timing-safe comparison path
    expect(validateState('aaaa', 'aaab')).toBe(false)
  })
})

describe('buildAuthorizeUrl', () => {
  it('returns url with correct base and parameters', () => {
    const { url, state } = buildAuthorizeUrl()

    expect(state).toHaveLength(64)
    expect(url).toContain('https://auth.test/oauth/authorize?')

    const parsed = new URL(url)
    expect(parsed.searchParams.get('response_type')).toBe('code')
    expect(parsed.searchParams.get('client_id')).toBe('test-client-id')
    expect(parsed.searchParams.get('redirect_uri')).toBe('https://app.test/auth/callback')
    expect(parsed.searchParams.get('scope')).toBe('openid email profile read write')
    expect(parsed.searchParams.get('state')).toBe(state)
  })
})
