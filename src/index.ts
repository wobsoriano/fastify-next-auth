import type { NextAuthAction, NextAuthOptions } from 'next-auth'
import { NextAuthHandler } from 'next-auth/core'
import type { FastifyPluginCallback } from 'fastify'
import fastifyPlugin from 'fastify-plugin'
import { fetch } from 'node-fetch-native'

globalThis.fetch = fetch

const plugin: FastifyPluginCallback<NextAuthOptions> = (
  fastify,
  options,
  next,
) => {
  fastify.all('/api/auth/*', async (request, reply) => {
    const nextauth = request.url.split('/')

    const req = {
      host: process.env.NEXTAUTH_URL,
      body: request.body as Record<string, any> || {},
      query: request.query as Record<string, any>,
      headers: request.headers,
      method: request.method,
      cookies: (request as any).cookies,
      action: nextauth[3] as NextAuthAction,
      providerId: nextauth[4]?.split('?')[0],
      error: nextauth[4]?.split('?')[0],
    }

    const response = await NextAuthHandler({
      req,
      options,
    })

    const { headers, cookies, body, redirect, status = 200 } = response

    reply.statusCode = status

    headers?.forEach((header) => {
      reply.header(header.key, header.value)
    })

    cookies?.forEach((cookie) => {
      (reply as any).setCookie(cookie.name, cookie.value, cookie.options)
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

  next()
}

const fastifyNextAuth = fastifyPlugin(plugin, {
  fastify: '4.x',
  name: 'fastify-next-auth',
  dependencies: ['@fastify/cookie', '@fastify/formbody'],
})

export {
  fastifyNextAuth,
  NextAuthOptions,
}

export default fastifyNextAuth
