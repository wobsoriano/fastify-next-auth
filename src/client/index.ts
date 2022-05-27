import type { FastifyRequest } from 'fastify'
import type { NextAuthOptions, Session } from 'next-auth'
import { NextAuthHandler } from 'next-auth/core'
import type { NextAuthAction } from 'next-auth/lib/types'

export async function getActionResult<T = any>(action: NextAuthAction, req: FastifyRequest, options: NextAuthOptions) {
  const result = await NextAuthHandler<T>({
    req: {
      host: process.env.NEXTAUTH_URL,
      action,
      method: 'GET',
      cookies: (req as any).cookies,
      headers: req.headers,
    },
    options,
  })

  const { body } = result

  if (body && Object.keys(body).length)
    return body as T

  return null
}

export async function getServerSession(req: FastifyRequest, options: NextAuthOptions) {
  return getActionResult<Session>('session', req, options)
}

export async function getProviders(req: FastifyRequest, options: NextAuthOptions) {
  return getActionResult('providers', req, options)
}

export async function getCsrfToken(req: FastifyRequest, options: NextAuthOptions) {
  return getActionResult('csrf', req, options)
}
