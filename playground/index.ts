import Fastify from 'fastify'
import fastifyEnv from '@fastify/env'
import GithubProvider from 'next-auth/providers/github'
import NextAuthPlugin from 'fastify-next-auth'
import { getSession } from 'fastify-next-auth/client'
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

const fastify = Fastify({ logger: true })

const initialize = async () => {
  fastify.register(fastifyEnv, {
    schema,
    dotenv: true,
  })
  await fastify.after()
  console.log(process.env.NEXTAUTH_URL)
  console.log(process.env.GITHUB_CLIENT_ID)
  console.log(process.env.GITHUB_CLIENT_SECRET)

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

fastify
  .route({
    method: 'GET',
    url: '/',
    handler: async (request, reply) => {
      const user = await getSession({ req: request })
      return user
    },
  })
// .route({
//   method: 'GET',
//   url: '/user',
//   schema: {
//     // request needs to have a querystring with a `name` parameter
//     querystring: {
//       name: { type: 'string' }
//     },
//     // the response needs to be an object with an `hello` property of type 'string'
//     response: {
//       200: {
//         type: 'object',
//         properties: {
//           hello: { type: 'string' }
//         }
//       }
//     }
//   },
//   handler: async (request, reply) => {
//     const session = await getServerSession(request, opts)
//     return session
//   }
// })

initialize()

const start = async () => {
  try {
    await fastify.ready()
    await fastify.listen({
      port: 3000,
    })
    console.log('listening')
  }
  catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()
