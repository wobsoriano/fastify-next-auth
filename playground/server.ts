import path from 'path'
import Fastify from 'fastify'
import fastifyEnv from '@fastify/env'
import GithubProvider from 'next-auth/providers/github'
import NextAuthPlugin from 'fastify-next-auth'
import type { NextAuthOptions } from 'fastify-next-auth'
import fastifyStatic from '@fastify/static'
import { getSession } from 'fastify-next-auth/client'

const schema = {
  type: 'object',
  required: ['NEXTAUTH_URL', 'NEXTAUTH_SECRET', 'GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET'],
  properties: {
    NEXTAUTH_URL: {
      type: 'string',
      default: 'http://localhost:3000',
    },
    NEXTAUTH_SECRET: {
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

const fastify = Fastify({ logger: true })

async function initialize() {
  fastify.register(fastifyStatic, {
    root: path.join(__dirname, 'public'),
  })
  fastify.register(fastifyEnv, {
    schema,
    dotenv: true,
  })
  await fastify.after()
  fastify.register(NextAuthPlugin, {
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
      GithubProvider({
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
      }),
    ],
  } as NextAuthOptions)
}

fastify.get('/', (req, reply) => {
  return reply.sendFile('index.html')
})

fastify.get('/api/user', async (req) => {
  const session = await getSession({ req })
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
