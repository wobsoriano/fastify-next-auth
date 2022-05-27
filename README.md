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

> The session data returned to the client does not contain sensitive information such as the Session Token or OAuth tokens. It contains a minimal payload that includes enough data needed to display information on a page about the user who is signed in for presentation purposes (e.g name, email, image). <br />You can use the [session callback](https://next-auth.js.org/configuration/callbacks#session-callback) to customize the session object returned to the client if you need to return additional data in the session object.

