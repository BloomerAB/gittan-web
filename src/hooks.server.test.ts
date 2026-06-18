import { describe, it, expect, beforeEach, vi } from 'vitest'

const { mockGetSession, mockSetSession, mockRefreshAccessToken } = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  mockSetSession: vi.fn(),
  mockRefreshAccessToken: vi.fn(),
}))

vi.mock('$lib/server/session', () => ({
  getSession: mockGetSession,
  setSession: mockSetSession,
}))

vi.mock('$lib/server/oauth', () => ({
  refreshAccessToken: mockRefreshAccessToken,
}))

import { handle } from './hooks.server.js'

function createMockEvent() {
  const locals: Record<string, unknown> = {}
  return {
    cookies: {},
    locals,
    request: new Request('https://app.test/'),
    url: new URL('https://app.test/'),
  }
}

function createMockResolve() {
  return vi.fn().mockResolvedValue(new Response('OK'))
}

describe('hooks.server handle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  it('sets session to null when no session cookie exists', async () => {
    mockGetSession.mockReturnValue(null)
    const event = createMockEvent()
    const resolve = createMockResolve()

    await handle({ event: event as any, resolve })

    expect(event.locals.session).toBeNull()
    expect(resolve).toHaveBeenCalledWith(event)
    expect(mockRefreshAccessToken).not.toHaveBeenCalled()
  })

  it('passes through session when token is not near expiry', async () => {
    const now = Date.now()
    const session = {
      accessToken: 'valid-token',
      refreshToken: 'refresh-token',
      expiresAt: now + 5 * 60 * 1000, // expires in 5 minutes (> 60s buffer)
    }
    mockGetSession.mockReturnValue(session)
    const event = createMockEvent()
    const resolve = createMockResolve()

    await handle({ event: event as any, resolve })

    expect(event.locals.session).toBe(session)
    expect(mockRefreshAccessToken).not.toHaveBeenCalled()
    expect(mockSetSession).not.toHaveBeenCalled()
  })

  it('refreshes token when within 60 seconds of expiry', async () => {
    const now = Date.now()
    const session = {
      accessToken: 'old-token',
      refreshToken: 'refresh-token',
      expiresAt: now + 30 * 1000, // expires in 30 seconds (< 60s buffer)
    }
    mockGetSession.mockReturnValue(session)

    const newTokens = {
      access_token: 'new-access-token',
      refresh_token: 'new-refresh-token',
      token_type: 'Bearer',
      expires_in: 3600,
      scope: 'openid',
    }
    mockRefreshAccessToken.mockResolvedValue(newTokens)

    const event = createMockEvent()
    const resolve = createMockResolve()

    await handle({ event: event as any, resolve })

    expect(mockRefreshAccessToken).toHaveBeenCalledWith('refresh-token')
    expect(mockSetSession).toHaveBeenCalledWith(event.cookies, {
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
      expiresAt: expect.any(Number),
    })
    expect(event.locals.session).toEqual({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
      expiresAt: expect.any(Number),
    })
  })

  it('refreshes token when already expired', async () => {
    const now = Date.now()
    const session = {
      accessToken: 'expired-token',
      refreshToken: 'refresh-token',
      expiresAt: now - 10 * 1000, // expired 10 seconds ago
    }
    mockGetSession.mockReturnValue(session)

    const newTokens = {
      access_token: 'fresh-token',
      refresh_token: 'fresh-refresh',
      token_type: 'Bearer',
      expires_in: 7200,
      scope: 'openid',
    }
    mockRefreshAccessToken.mockResolvedValue(newTokens)

    const event = createMockEvent()
    const resolve = createMockResolve()

    await handle({ event: event as any, resolve })

    expect(mockRefreshAccessToken).toHaveBeenCalledWith('refresh-token')
    expect(event.locals.session).toEqual({
      accessToken: 'fresh-token',
      refreshToken: 'fresh-refresh',
      expiresAt: expect.any(Number),
    })
  })

  it('falls back to existing session when refresh fails', async () => {
    const now = Date.now()
    const session = {
      accessToken: 'old-token',
      refreshToken: 'bad-refresh',
      expiresAt: now + 10 * 1000, // within buffer
    }
    mockGetSession.mockReturnValue(session)
    mockRefreshAccessToken.mockRejectedValue(new Error('Token refresh failed'))

    const event = createMockEvent()
    const resolve = createMockResolve()

    await handle({ event: event as any, resolve })

    expect(event.locals.session).toBe(session)
    expect(mockSetSession).not.toHaveBeenCalled()
  })

  it('calculates new expiresAt from expires_in', async () => {
    const now = 1700000000000
    vi.setSystemTime(now)

    const session = {
      accessToken: 'old',
      refreshToken: 'ref',
      expiresAt: now + 10 * 1000,
    }
    mockGetSession.mockReturnValue(session)

    mockRefreshAccessToken.mockResolvedValue({
      access_token: 'new',
      refresh_token: 'new-ref',
      token_type: 'Bearer',
      expires_in: 3600,
      scope: 'openid',
    })

    const event = createMockEvent()
    const resolve = createMockResolve()

    await handle({ event: event as any, resolve })

    const savedSession = mockSetSession.mock.calls[0][1]
    // expires_in is 3600 seconds = 3600000 ms from now
    expect(savedSession.expiresAt).toBeGreaterThanOrEqual(now + 3600 * 1000)
    // Allow small tolerance for code execution time
    expect(savedSession.expiresAt).toBeLessThanOrEqual(now + 3600 * 1000 + 100)

    vi.useRealTimers()
  })

  it('does not refresh when exactly at buffer boundary', async () => {
    const now = Date.now()
    const session = {
      accessToken: 'token',
      refreshToken: 'refresh',
      expiresAt: now + 60 * 1000, // exactly at 60s boundary
    }
    mockGetSession.mockReturnValue(session)

    const event = createMockEvent()
    const resolve = createMockResolve()

    await handle({ event: event as any, resolve })

    // expiresAt - now === TOKEN_REFRESH_BUFFER_MS, so needsRefresh is false (uses <)
    expect(mockRefreshAccessToken).not.toHaveBeenCalled()
    expect(event.locals.session).toBe(session)
  })

  it('always calls resolve regardless of session state', async () => {
    mockGetSession.mockReturnValue(null)
    const event = createMockEvent()
    const resolve = createMockResolve()

    await handle({ event: event as any, resolve })

    expect(resolve).toHaveBeenCalledOnce()
    expect(resolve).toHaveBeenCalledWith(event)
  })
})
