import type { FastifyRequest } from 'fastify'
import type { NextAuthAction, NextAuthOptions, Session } from 'next-auth'

declare function getActionResult<T = any>(action: NextAuthAction, req: FastifyRequest, options: NextAuthOptions): Promise<T | null>
declare function getServerSession(req: FastifyRequest, options: NextAuthOptions): Promise<Session | null>
declare function getProviders(req: FastifyRequest, options: NextAuthOptions): Promise<any>
declare function getCsrfToken(req: FastifyRequest, options: NextAuthOptions): Promise<any>

export { getActionResult, getCsrfToken, getProviders, getServerSession }
