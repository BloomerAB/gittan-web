import { env } from '$env/dynamic/private'

function required(name: string): string {
  const value = env[name]
  if (!value) throw new Error(`${name} environment variable is required`)
  return value
}

export const config = {
  get appUrl() { return required('APP_URL') },
  get authPublicUrl() { return required('AUTH_PUBLIC_URL') },
  get authApiUrl() { return required('AUTH_API_URL') },
  get oauthClientId() { return required('OAUTH_CLIENT_ID') },
  get oauthClientSecret() { return required('OAUTH_CLIENT_SECRET') },
  get cookieSecret() { return required('COOKIE_SECRET') },
  get gittanApiUrl() { return required('GITTAN_API_URL') },
} as const
