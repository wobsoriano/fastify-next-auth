import type { IncomingRequest, NextAuthOptions } from 'next-auth'
import type { NextAuthAction } from 'next-auth/lib/types'
import { NextAuthHandler as NextAuthHandlerImpl } from 'next-auth/core'
import type { FastifyPluginCallback } from 'fastify'
import cookie from '@fastify/cookie'
import formBody from '@fastify/formbody'
import fastifyPlugin from 'fastify-plugin'

const plugin: FastifyPluginCallback<NextAuthOptions> = (
  fastify,
  options,
  done,
) => {
  fastify
    .register(cookie)
    .register(formBody)

  fastify.all('/api/auth/*', async (request, reply) => {
    const nextauth = request.url.split('/')

    const req: IncomingRequest = {
      host: process.env.NEXTAUTH_URL,
      body: request.body as Record<string, any> || {},
      query: request.query as Record<string, any>,
      headers: request.headers,
      method: request.method,
      cookies: request.cookies,
      action: nextauth[3] as NextAuthAction,
      providerId: nextauth[4]?.split('?')[0],
      error: nextauth[4]?.split('?')[0],
    }

    const response = await NextAuthHandlerImpl({
      req,
      options,
    })

    const { headers, cookies, body, redirect, status = 200 } = response

    reply.statusCode = status

    headers?.forEach((header) => {
      reply.header(header.key, header.value)
    })

    cookies?.forEach((cookie) => {
      reply.setCookie(cookie.name, cookie.value, cookie.options)
    })

    if (redirect) {
      if (request.method === 'POST') {
        const body = request.body as Record<string, any>
        if (body?.json !== 'true')
          await reply.redirect(302, redirect)

        return {
          url: redirect,
        }
      }
      else {
        await reply.redirect(302, redirect)
      }
    }

    return body
  })

  done()
}

export const fastifyNextAuth = fastifyPlugin(plugin, {
  fastify: '4.x',
  name: 'fastify-next-auth',
})

export default fastifyNextAuth
