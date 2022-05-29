// Source: https://github.com/nextauthjs/next-auth/blob/main/packages/next-auth/src/react/index.tsx
import type { NextAuthClientConfig as NextAuthClientConfigImpl } from 'next-auth/client/_utils'
import { BroadcastChannel, apiBaseUrl, fetchData } from 'next-auth/client/_utils'
import type { Session } from 'next-auth'
import type {
  BuiltInProviderType,
  RedirectableProviderType,
} from 'next-auth/providers'
import type { FastifyRequest } from 'fastify'
import parseUrl from '../lib/parse-url'
import _logger, { proxyLogger } from '../lib/logger'
import type {
  ClientSafeProvider,
  LiteralUnion,
  SignInAuthorizationParams,
  SignInOptions,
  SignInResponse,
  SignOutParams,
  SignOutResponse,
} from '../types'

// This behaviour mirrors the default behaviour for getting the site name that
// happens server side in server/index.js
// 1. An empty value is legitimate when the code is being invoked client side as
//    relative URLs are valid in that context and so defaults to empty.
// 2. When invoked server side the value is picked up from an environment
//    variable and defaults to 'http://localhost:3000'.
const __NEXTAUTH: NextAuthClientConfigImpl = {
  baseUrl: parseUrl(process.env.NEXTAUTH_URL ?? process.env.VERCEL_URL).origin,
  basePath: parseUrl(process.env.NEXTAUTH_URL).path,
  baseUrlServer: parseUrl(
    process.env.NEXTAUTH_URL_INTERNAL
      ?? process.env.NEXTAUTH_URL
      ?? process.env.VERCEL_URL,
  ).origin,
  basePathServer: parseUrl(
    process.env.NEXTAUTH_URL_INTERNAL ?? process.env.NEXTAUTH_URL,
  ).path,
  _lastSync: 0,
  _session: undefined,
  _getSession: () => {},
}

export interface CtxOrReq {
  req?: FastifyRequest
}

export type GetSessionParams = CtxOrReq & {
  event?: 'storage' | 'timer' | 'hidden' | string
  triggerEvent?: boolean
  broadcast?: boolean
}

const logger = proxyLogger(_logger, __NEXTAUTH.basePath)

const broadcast = BroadcastChannel()

export async function getSession(params?: GetSessionParams) {
  const session = await fetchData<Session>(
    'session',
    __NEXTAUTH,
    logger,
    // @ts-expect-error: Fix later
    params,
  )
  if (params?.broadcast ?? true)
    broadcast.post({ event: 'session', data: { trigger: 'getSession' } })

  return session
}

/**
 * Returns the current Cross Site Request Forgery Token (CSRF Token)
 * required to make POST requests (e.g. for signing in and signing out).
 * You likely only need to use this if you are not using the built-in
 * `signIn()` and `signOut()` methods.
 *
 * [Documentation](https://next-auth.js.org/getting-started/client#getcsrftoken)
 */
export async function getCsrfToken(params?: CtxOrReq) {
  const response = await fetchData<{ csrfToken: string }>(
    'csrf',
    __NEXTAUTH,
    logger,
    // @ts-expect-error: Fix later
    params,
  )
  return response?.csrfToken
}

/**
 * It calls `/api/auth/providers` and returns
 * a list of the currently configured authentication providers.
 * It can be useful if you are creating a dynamic custom sign in page.
 *
 * [Documentation](https://next-auth.js.org/getting-started/client#getproviders)
 */
export async function getProviders() {
  return await fetchData<
    Record<LiteralUnion<BuiltInProviderType>, ClientSafeProvider>
  >('providers', __NEXTAUTH, logger)
}

/**
 * Client-side method to initiate a signin flow
 * or send the user to the signin page listing all possible providers.
 * Automatically adds the CSRF token to the request.
 *
 * [Documentation](https://next-auth.js.org/getting-started/client#signin)
 */
export async function signIn<
 P extends RedirectableProviderType | undefined = undefined,
>(
  provider?: LiteralUnion<BuiltInProviderType>,
  options?: SignInOptions,
  authorizationParams?: SignInAuthorizationParams,
): Promise<
 P extends RedirectableProviderType ? SignInResponse | undefined : undefined
> {
  const { callbackUrl = window.location.href, redirect = true } = options ?? {}

  const baseUrl = apiBaseUrl(__NEXTAUTH)
  const providers = await getProviders()

  if (!providers) {
    window.location.href = `${baseUrl}/error`
    return
  }

  if (!provider || !(provider in providers)) {
    window.location.href = `${baseUrl}/signin?${new URLSearchParams({
     callbackUrl,
   })}`
    return
  }

  const isCredentials = providers[provider].type === 'credentials'
  const isEmail = providers[provider].type === 'email'
  const isSupportingReturn = isCredentials || isEmail

  const signInUrl = `${baseUrl}/${
   isCredentials ? 'callback' : 'signin'
 }/${provider}`

  const _signInUrl = `${signInUrl}?${new URLSearchParams(authorizationParams)}`

  const res = await fetch(_signInUrl, {
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    // @ts-expect-error: Internal
    body: new URLSearchParams({
      ...options,
      csrfToken: await getCsrfToken(),
      callbackUrl,
      json: true,
    }),
  })

  const data = await res.json()

  if (redirect || !isSupportingReturn) {
    const url = data.url ?? callbackUrl
    window.location.href = url
    // If url contains a hash, the browser does not reload the page. We reload manually
    if (url.includes('#'))
      window.location.reload()
    return
  }

  const error = new URL(data.url).searchParams.get('error')

  if (res.ok)
    await __NEXTAUTH._getSession({ event: 'storage' })

  return {
    error,
    status: res.status,
    ok: res.ok,
    url: error ? null : data.url,
  } as any
}

/**
 * Signs the user out, by removing the session cookie.
 * Automatically adds the CSRF token to the request.
 *
 * [Documentation](https://next-auth.js.org/getting-started/client#signout)
 */
export async function signOut<R extends boolean = true>(
  options?: SignOutParams<R>,
): Promise<R extends true ? undefined : SignOutResponse> {
  const { callbackUrl = window.location.href } = options ?? {}
  const baseUrl = apiBaseUrl(__NEXTAUTH)
  const fetchOptions = {
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    // @ts-expect-error: Internal
    body: new URLSearchParams({
      csrfToken: await getCsrfToken(),
      callbackUrl,
      json: true,
    }),
  }
  const res = await fetch(`${baseUrl}/signout`, fetchOptions)
  const data = await res.json()

  broadcast.post({ event: 'session', data: { trigger: 'signout' } })

  if (options?.redirect ?? true) {
    const url = data.url ?? callbackUrl
    window.location.href = url
    // If url contains a hash, the browser does not reload the page. We reload manually
    if (url.includes('#'))
      window.location.reload()
    // @ts-expect-error: Internal
    return
  }

  await __NEXTAUTH._getSession({ event: 'storage' })

  return data
}
