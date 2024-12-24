import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { prettyJSON } from 'hono/pretty-json'
import { errorHandler } from '../middleware/error'
import api from './api'

const app = new Hono()

// Middleware
app.use(
  '*',
  cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Content-Length', 'X-Request-Id'],
    credentials: true,
    maxAge: 86400,
  })
)
app.use('*', prettyJSON())
app.use('*', errorHandler)

// Mount API routes
app.route('/api', api)

// Base route
app.get('/', (c) =>
  c.json({
    message: 'Welcome to the API',
    version: '1.0.0',
    docs: '/api/docs',
  })
)

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      message: 'Not Found',
      status: 404,
    },
    404
  )
})

export default app
