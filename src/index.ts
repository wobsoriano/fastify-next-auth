import type { IncomingMessage, ServerResponse } from 'http'
import type { AuthOptions } from '@auth/core'
import type { FastifyPluginCallback } from 'fastify'
import fastifyPlugin from 'fastify-plugin'
import Middie from '@fastify/middie/engine'
import { createAuthMiddleware } from 'authey'

const plugin: FastifyPluginCallback<AuthOptions> = async (
  fastify,
  options,
  next,
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
    middie.run(req.raw, reply.raw, next)
  }

  fastify.addHook('onRequest', runMiddie)

  next()
}

const fastifyNextAuth = fastifyPlugin(plugin, {
  fastify: '4.x',
  name: 'fastify-next-auth',
})

export {
  fastifyNextAuth,
  AuthOptions,
}

export default fastifyNextAuth
