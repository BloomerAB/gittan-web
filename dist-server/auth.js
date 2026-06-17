import { Router } from 'express';
import { buildAuthorizeUrl, exchangeCodeForTokens, validateState } from './oauth.js';
import { setSession, getSession, clearSession, setStateCookie, getStateCookie, clearStateCookie } from './session.js';
import { config } from './config.js';
export const authRouter = Router();
authRouter.get('/login', (_req, res) => {
    const { url, state } = buildAuthorizeUrl();
    setStateCookie(res, state);
    res.redirect(url);
});
authRouter.get('/callback', async (req, res) => {
    const code = req.query.code;
    const state = req.query.state;
    const error = req.query.error;
    if (error || !code) {
        res.redirect('/?auth_error=login_failed');
        return;
    }
    const expectedState = getStateCookie(req);
    clearStateCookie(res);
    if (!validateState(expectedState, state ?? null)) {
        res.redirect('/?auth_error=invalid_state');
        return;
    }
    try {
        const tokens = await exchangeCodeForTokens(code);
        setSession(res, {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresAt: Date.now() + tokens.expires_in * 1000,
        });
        res.redirect('/');
    }
    catch (err) {
        console.error('Token exchange failed:', err);
        res.redirect('/?auth_error=token_exchange_failed');
    }
});
authRouter.get('/logout', (_req, res) => {
    clearSession(res);
    res.redirect('/');
});
authRouter.get('/me', async (req, res) => {
    const session = getSession(req);
    if (!session) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
    }
    try {
        const response = await fetch(`${config.authApiUrl}/oauth/userinfo`, {
            headers: { Authorization: `Bearer ${session.accessToken}` },
        });
        if (!response.ok) {
            clearSession(res);
            res.status(401).json({ error: 'Session expired' });
            return;
        }
        const user = await response.json();
        res.json(user);
    }
    catch {
        res.status(500).json({ error: 'Failed to fetch user info' });
    }
});
