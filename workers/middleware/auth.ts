import { Context, Next } from 'hono'
import { User } from '../types'

export const authMiddleware = async (c: Context, next: Next): Promise<Response | void> => {
  const token = c.req.header('Authorization')

  if (!token) {
    return c.json({ error: 'No token provided' }, 401)
  }

  try {
    // Here you would typically validate the token
    const user: User = { id: '1', role: 'user' }
    c.set('user', user)
    await next()
  } catch (e) {
    const error = e as Error
    return c.json({ error: error.message || 'Invalid token' }, 401)
  }
}
