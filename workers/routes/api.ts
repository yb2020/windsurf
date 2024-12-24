import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import { ChatController } from '../controllers/chat.controller'

const api = new Hono()

// Public routes
api.get('/health', (c) => {
  const response = { status: 200, message: 'ok' }
  return c.json(response)
})

// Hello World endpoint
api.get('/hello', (c) => {
  const response = {
    status: 200,
    data: {
      message: 'Hello from Cloudflare Worker!',
    },
  }
  return c.json(response)
})

// Protected routes
api.use('/protected/*', authMiddleware)

api.get('/protected/profile', (c) => {
  const user = c.get('user')
  const response = { data: user }
  return c.json(response)
})

// Example of a POST endpoint
api.post('/protected/data', async (c) => {
  const body = await c.req.json()
  const response = {
    message: 'Data received',
    data: body,
  }
  return c.json(response)
})

// Example of handling query parameters
api.get('/search', (c) => {
  const query = c.req.query('q')
  const response = {
    data: { results: `Search results for: ${query}` },
  }
  return c.json(response)
})

// 内容过滤函数
function sanitizeInput(input: string): string {
  // 移除可能触发内容过滤的内容
  return input
    .replace(/[^\w\s,.?!，。？！]/g, '') // 只保留基本标点和文字
    .trim()
}

// Chat routes
api.post('/chat/stream', async (c) => {
  const controller = new ChatController(c.env)
  return controller.streamChat(c)
})

export default api
