# fastify-next-auth

Authentication plugin for Fastify, powered by [NexAuth.js](https://next-auth.js.org/).

## Installation

```bash
pnpm add next-auth fastify-next-auth # or npm or yarn
```

## Usage

```ts
import fastify from 'fastify'
import GithubProvider from 'next-auth/providers/github'
import type { NextAuthOptions } from 'fastify-next-auth'
import NextAuth from 'fastify-next-auth'

const fastify = fastify()

fastify.register(NextAuth, {
  // Configure one or more authentication providers
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    // ...add more providers here
  ]
} as NextAuthOptions)
```

## Client API

The client library makes it easy to interact with sessions from your frontend.

Example Session Object

```ts
{
  user: {
    name: string
    email: string
    image: string
  },
  expires: Date // This is the expiry of the session, not any of the tokens within the session
}
```

<b>Server Side Example</b>

```ts
import {
  getCsrfToken,
  getProviders,
  getSession
} from 'fastify-next-auth/client'

fastify
  .route({
    // other route properties
    handler: async (request, reply) => {
      const session = await getSession(request)
      const token = await getCsrfToken(request)
      // Unlike getSession() and getCsrfToken(), when calling getProviders() server side, you don't need to pass anything, just as calling it client side.
      const providers = await getProviders()
      return {
        session,
        providers,
        token
      }
    }
  })
```

<b>Client Side Example</b>

```ts
import {
  getCsrfToken,
  getProviders,
  getSession,
  signIn,
  signOut
} from 'fastify-next-auth/client'

async function myFunction() {
  const session = await getSession()
  const providers = await getProviders()
  const token = await getCsrfToken()
  /* ... */
}
```
