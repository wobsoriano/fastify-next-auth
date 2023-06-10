import path, { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import Fastify from 'fastify'
import fastifyEnv from '@fastify/env'
import GithubProvider from '@auth/core/providers/github'
import NextAuthPlugin from 'fastify-next-auth'
import fastifyStatic from '@fastify/static'
import type { Provider } from '@auth/core/providers'

const schema = {
  type: 'object',
  required: ['AUTH_TRUST_HOST', 'AUTH_SECRET', 'GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET'],
  properties: {
    AUTH_TRUST_HOST: {
      type: 'string',
      default: '1',
    },
    AUTH_SECRET: {
      type: 'string',
    },
    GITHUB_CLIENT_ID: {
      type: 'string',
    },
    GITHUB_CLIENT_SECRET: {
      type: 'string',
    },
  },
}

const fastify = Fastify({ logger: false })

async function initialize() {
  fastify
    .register(fastifyStatic, {
      root: path.join(dirname(fileURLToPath(import.meta.url)), 'public'),
    })
    .register(fastifyEnv, {
      schema,
      dotenv: true,
    })
  await fastify.after()
  await fastify.register(NextAuthPlugin, {
    secret: process.env.AUTH_SECRET,
    trustHost: Boolean(process.env.AUTH_TRUST_HOST),
    providers: [
      GithubProvider({
        clientId: process.env.GITHUB_CLIENT_ID as string,
        clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      }) as Provider,
    ],
  })
}

fastify.get('/', (req, reply) => {
  return reply.sendFile('index.html')
})

fastify.get('/api/user', async (req) => {
  const session = await fastify.getSession(req)
  return session
})

initialize()

async function startServer() {
  try {
    await fastify.ready()
    await fastify.listen({
      port: 3000,
    })
    // eslint-disable-next-line no-console
    console.log('listening on port 3000')
  }
  catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

startServer()
