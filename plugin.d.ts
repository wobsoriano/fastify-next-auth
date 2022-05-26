import type { FastifyPlugin } from 'fastify'
import type { NextAuthOptions } from 'next-auth/core'

declare const nextAuthPlugin: FastifyPlugin<NextAuthOptions>

export default nextAuthPlugin
