function required(value: string | undefined, name: string): string {
  if (!value) throw new Error(`${name} environment variable is required`);
  return value;
}

export const config = {
  port: Number(process.env.PORT || '3000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  get isProduction() { return this.nodeEnv === 'production'; },
  get appUrl() { return required(process.env.APP_URL, 'APP_URL'); },
  get authPublicUrl() { return required(process.env.AUTH_PUBLIC_URL, 'AUTH_PUBLIC_URL'); },
  get authApiUrl() { return required(process.env.AUTH_API_URL, 'AUTH_API_URL'); },
  get oauthClientId() { return required(process.env.OAUTH_CLIENT_ID, 'OAUTH_CLIENT_ID'); },
  get oauthClientSecret() { return required(process.env.OAUTH_CLIENT_SECRET, 'OAUTH_CLIENT_SECRET'); },
  get cookieSecret() { return required(process.env.COOKIE_SECRET, 'COOKIE_SECRET'); },
  get gittanApiUrl() { return required(process.env.GITTAN_API_URL, 'GITTAN_API_URL'); },
} as const;
