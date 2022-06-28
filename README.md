# fastify-next-auth

Authentication plugin for Fastify, powered by [NextAuth.js](https://next-auth.js.org/).

**Requirements:**

+ [fastify-cookie](https://github.com/fastify/fastify-cookie): used to set cookie for tracking sessions.
+ [fastify-formbody](https://github.com/fastify/fastify-formbody): used to parse content-type `application/x-www-form-urlencoded`.

## Installation

```bash
npm install fastify-next-auth
```

## Usage

```ts
import fastify from 'fastify'
import cookie from '@fastify/cookie'
import formBody from '@fastify/formbody'
import AppleProvider from 'next-auth/providers/apple'
import GoogleProvider from 'next-auth/providers/google'
import EmailProvider from 'next-auth/providers/email'
import type { NextAuthOptions } from 'fastify-next-auth'
import NextAuth from 'fastify-next-auth'

const app = fastify()

app
  .register(cookie)
  .register(formBody)
  .register(NextAuth, {
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
    // OAuth authentication providers
      AppleProvider({
        clientId: process.env.APPLE_ID,
        clientSecret: process.env.APPLE_SECRET,
      }),
      GoogleProvider({
        clientId: process.env.GOOGLE_ID,
        clientSecret: process.env.GOOGLE_SECRET,
      }),
      // Sign in with passwordless email link
      EmailProvider({
        server: process.env.MAIL_SERVER,
        from: '<no-reply@example.com>',
      }),
    ],
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

fastify.get('/api/info', async (req, reply) => {
  const session = await getSession({ req })
  const token = await getCsrfToken({ req })
  // Unlike getSession() and getCsrfToken(), when calling getProviders() server side,
  // you don't need to pass anything, just as calling it client side.
  const providers = await getProviders()
  return {
    session,
    providers,
    token
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

  // Redirects to sign in page
  signIn()

  // Starts OAuth sign-in flow
  signIn('google')

  // Starts Email sign-in flow
  signIn('email', { email: 'hello@mail.com' })

  signOut()
}
```

For more info on client side usage, proceed to the [NextAuth.js Client API](https://next-auth.js.org/getting-started/client) docs page.

## License

MIT
