import Fastify from 'fastify'
import fastifyEnv from '@fastify/env'
import GithubProvider from 'next-auth/providers/github'
import NextAuthPlugin from 'fastify-next-auth'
import type { NextAuthOptions } from 'fastify-next-auth'

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

export async function buildServer() {
  const server = Fastify()

  async function initialize() {
    server.register(fastifyEnv, {
      schema,
      dotenv: true,
    })
    await server.after()
    server.register(NextAuthPlugin, {
      secret: process.env.NEXTAUTH_SECRET,
      providers: [
        GithubProvider({
          clientId: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
        }),
      ],
    } as NextAuthOptions)
  }

  initialize()

  async function startServer() {
    try {
      await server.ready()
      await server.listen({
        port: 3000,
      })
    }
    catch (err) {
      server.log.error(err)
      process.exit(1)
    }
  }

  startServer()

  return server
}
