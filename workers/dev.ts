import { serve } from '@hono/node-server'
import app from './routes'

const port = 8787
console.log(`[Worker Info]: Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port,
})
