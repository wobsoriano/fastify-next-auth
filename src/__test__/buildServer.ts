import path from 'node:path'
import Fastify from 'fastify'
import fastifyEnv from '@fastify/env'
import GithubProvider from '@auth/core/providers/github'
import NextAuthPlugin from '../index'

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

export async function buildServer() {
  const server = Fastify()

  server.register(fastifyEnv, {
    schema,
    dotenv: {
      path: path.join(__dirname, '../../playground/.env'),
    },
  })
  await server.after()
  server.register(NextAuthPlugin, {
    trustHost: true,
    secret: process.env.AUTH_SECRET,
    providers: [
      GithubProvider({
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      }),
    ],
  })

  return server
}
