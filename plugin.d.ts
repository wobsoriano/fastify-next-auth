import type { FastifyPluginCallback } from 'fastify'
import type { NextAuthOptions } from 'next-auth/core'

declare const fastifyNextAuth: FastifyPluginCallback<NextAuthOptions>

export {
  fastifyNextAuth as default,
  fastifyNextAuth,
}
