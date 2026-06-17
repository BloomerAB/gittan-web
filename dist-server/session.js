import crypto from 'node:crypto';
import { config } from './config.js';
const SESSION_COOKIE = 'gittan-session';
const STATE_COOKIE = 'gittan-oauth-state';
const SESSION_MAX_AGE = 30 * 24 * 60 * 60 * 1000;
const STATE_MAX_AGE = 10 * 60 * 1000;
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;
function deriveKey() {
    return crypto.scryptSync(config.cookieSecret, 'gittan-session-salt', 32);
}
function encrypt(plaintext) {
    const key = deriveKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, encrypted]).toString('base64url');
}
function decrypt(ciphertext) {
    try {
        const key = deriveKey();
        const buf = Buffer.from(ciphertext, 'base64url');
        const iv = buf.subarray(0, IV_LENGTH);
        const tag = buf.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
        const encrypted = buf.subarray(IV_LENGTH + TAG_LENGTH);
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(tag);
        return decipher.update(encrypted) + decipher.final('utf8');
    }
    catch {
        return null;
    }
}
const cookieOptions = (maxAge) => ({
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge,
});
export function setSession(res, data) {
    const encrypted = encrypt(JSON.stringify(data));
    res.cookie(SESSION_COOKIE, encrypted, cookieOptions(SESSION_MAX_AGE));
}
export function getSession(req) {
    const cookie = req.cookies?.[SESSION_COOKIE];
    if (!cookie)
        return null;
    const json = decrypt(cookie);
    if (!json)
        return null;
    try {
        return JSON.parse(json);
    }
    catch {
        return null;
    }
}
export function clearSession(res) {
    res.clearCookie(SESSION_COOKIE, { path: '/' });
}
export function setStateCookie(res, state) {
    res.cookie(STATE_COOKIE, state, cookieOptions(STATE_MAX_AGE));
}
export function getStateCookie(req) {
    const state = req.cookies?.[STATE_COOKIE];
    return state || undefined;
}
export function clearStateCookie(res) {
    res.clearCookie(STATE_COOKIE, { path: '/' });
}
