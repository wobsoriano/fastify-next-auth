import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { buildServer } from './buildServer'

let fastify: Awaited<ReturnType<typeof buildServer>>

beforeEach(async () => {
  fastify = await buildServer()
})

afterEach(() => {
  fastify.close()
})

describe('REST API', () => {
  test('GET /api/auth/signin', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/auth/signin',
    })

    expect(response.statusCode).toBe(200)
    expect(response.body).toContain('Sign in with GitHub')
  })

  test('POST /api/auth/signin/:provider', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/api/auth/signin/github',
    })

    expect(response.statusCode).toBe(302)
  })

  test('GET /api/auth/signout', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/auth/signout',
    })

    expect(response.statusCode).toBe(200)
    expect(response.body).toContain('Are you sure you want to sign out?')
    expect(response.body).toContain('Sign out')
  })

  test('POST /api/auth/signout', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/api/auth/signout',
    })

    expect(response.statusCode).toBe(302)
  })

  test('GET /api/auth/providers', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/auth/providers',
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toMatchSnapshot()
  })

  test('GET /api/auth/session', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/auth/session',
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toMatchSnapshot()
  })

  test('GET /api/auth/csrf', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/auth/csrf',
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toHaveProperty('csrfToken')
  })
})
