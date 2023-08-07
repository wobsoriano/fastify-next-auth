import type { IncomingMessage, ServerResponse } from 'http'
import type { AuthConfig, Session } from '@auth/core/types'
import type { FastifyPluginCallback, FastifyRequest } from 'fastify'
import fastifyPlugin from 'fastify-plugin'
import { createAuthMiddleware, getSession } from 'authey'
import Middie from './middie'

const plugin: FastifyPluginCallback<AuthConfig> = (
  fastify,
  options,
  done,
) => {
  const middleware = createAuthMiddleware(options)

  const middie = Middie((err: Error, _req: IncomingMessage, _res: ServerResponse, next: (err?: Error) => void) => {
    next(err)
  })

  middie.use(middleware)

  function runMiddie(req: any, reply: any, next: (err?: Error) => void) {
    req.raw.originalUrl = req.raw.url
    req.raw.id = req.id
    req.raw.hostname = req.hostname
    req.raw.ip = req.ip
    req.raw.ips = req.ips
    req.raw.log = req.log
    req.raw.body = req.body
    req.raw.query = req.query
    reply.raw.log = req.log
    for (const [key, val] of Object.entries(reply.getHeaders())) {
      reply.raw.setHeader(key, val)
    }
    middie.run(req.raw, reply.raw, next)
  }

  fastify.addHook('onRequest', runMiddie)
  // eslint-disable-next-line prefer-arrow-callback
  fastify.decorate('getSession', function (req: FastifyRequest) {
    return getSession(req.raw, options)
  })

  done()
}

const fastifyNextAuth = fastifyPlugin(plugin, {
  fastify: '4.x',
  name: 'fastify-next-auth',
})

export {
  fastifyNextAuth,
  AuthConfig,
}

export default fastifyNextAuth

declare module 'fastify' {
  interface FastifyInstance {
    getSession(req: FastifyRequest): Session
  }
}
