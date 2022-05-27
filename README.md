# fastify-next-auth

Use the REST API exposed by NextAuth.js with Fastify.

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

