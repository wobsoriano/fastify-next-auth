import type { FastifyPlugin } from 'fastify'
import type { NextAuthHeader } from 'next-auth/core'

declare const nextAuthPlugin: FastifyPlugin<NextAuthHeader>

export default nextAuthPlugin
