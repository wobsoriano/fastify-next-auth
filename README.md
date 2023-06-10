# fastify-next-auth

Authentication plugin for Fastify, powered by [Auth.js](https://authjs.dev/).

## Installation

```bash
npm install @auth/core fastify-next-auth
```

## Usage

```ts
import fastify from 'fastify'
import AppleProvider from '@auth/core/providers/apple'
import GoogleProvider from '@auth/core/providers/google'
import EmailProvider from '@auth/core/providers/email'
import AuthPlugin from 'fastify-next-auth'

const app = fastify()

app
  .register(AuthPlugin, {
    secret: process.env.AUTH_SECRET,
    trustHost: process.env.AUTH_TRUST_HOST,
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
  })
```

<b>Client Side Functions</b>

```ts
import { signIn, signOut } from 'fastify-next-auth/client'

// Redirects to sign in page
signIn()

// Starts OAuth sign-in flow
signIn('google')

// Starts Email sign-in flow
signIn('email', { email: 'hello@mail.com' })

signOut()
```

<b>Decorators</b>

```ts
fastify.get('/api/user', async function (req) {
  const { user } = await this.getSession(req)
  return user
})
```

For more info, proceed to the [Auth.js](https://authjs.dev/) docs.

## License

MIT
