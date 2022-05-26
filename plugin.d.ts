import type { FastifyPluginAsync, FastifyPluginCallback } from 'fastify'
import type { NextAuthOptions } from 'next-auth/core'

declare const nextAuthPlugin: FastifyPluginCallback<NextAuthOptions> | FastifyPluginAsync<NextAuthOptions>

export default nextAuthPlugin
