import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import type { IncomingMessage } from 'http'
import Fastify from 'fastify'
import fastifyEnv from '@fastify/env'
import GithubProvider from '@auth/core/providers/github'
import NextAuthPlugin from 'fastify-next-auth'
import type { AuthOptions } from 'fastify-next-auth'
import fastifyStatic from '@fastify/static'
import { getSession } from 'authey'

const schema = {
  type: 'object',
  required: ['NEXTAUTH_URL', 'AUTH_SECRET', 'GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET'],
  properties: {
    NEXTAUTH_URL: {
      type: 'string',
      default: 'http://localhost:3000',
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

const __dirname = dirname(fileURLToPath(import.meta.url))

async function initialize() {
  fastify
    .register(fastifyStatic, {
      root: path.join(__dirname, 'public'),
    })
    .register(fastifyEnv, {
      schema,
      dotenv: true,
    })
  await fastify.after()
  await fastify.register(NextAuthPlugin, {
    secret: process.env.AUTH_SECRET,
    trustHost: true,
    providers: [
      GithubProvider({
        clientId: process.env.GITHUB_CLIENT_ID as string,
        clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      }),
    ],
  } as AuthOptions)
}

fastify.get('/', (req, reply) => {
  return reply.sendFile('index.html')
})

fastify.get('/api/user', async (req) => {
  const session = await getSession(req as unknown as IncomingMessage, {
    providers: [
      GithubProvider({
        clientId: process.env.GITHUB_CLIENT_ID as string,
        clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      }),
    ],
  })
  return session
})

initialize()

async function startServer() {
  try {
    await fastify.ready()
    await fastify.listen({
      port: 3000,
    })
    console.log('listening on port 3000')
  }
  catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

startServer()
