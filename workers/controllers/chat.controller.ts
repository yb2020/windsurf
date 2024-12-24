import { Context } from 'hono'
import { ChatService } from '../services/chat.service'
import { ChatRequestDto } from '../dto/chat.dto'
import { createSSEMessage, getSSEHeaders } from '../utils/content-filter'

export class ChatController {
  private chatService: ChatService

  constructor(env: any) {
    this.chatService = new ChatService({
      apiKey: env.AZURE_OPENAI_API_KEY,
      endpoint: env.AZURE_OPENAI_ENDPOINT,
      deploymentId: 'gpt-4o-mini',
      apiVersion: '2024-08-01-preview',
    })
  }

  async streamChat(c: Context): Promise<Response> {
    try {
      const body = await c.req.json<ChatRequestDto>()

      // Set SSE headers
      Object.entries(getSSEHeaders()).forEach(([key, value]) => {
        c.header(key, value)
      })

      // Create a readable stream
      const stream = new ReadableStream({
        start: async (controller) => {
          try {
            for await (const chunk of this.chatService.streamChat(body)) {
              const message = createSSEMessage(chunk)
              const encoder = new TextEncoder()
              controller.enqueue(encoder.encode(message))
              if (chunk.done) {
                controller.close()
              }
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
            const message = createSSEMessage({ error: errorMessage, done: true })
            const encoder = new TextEncoder()
            controller.enqueue(encoder.encode(message))
            controller.close()
          }
        }
      })

      return new Response(stream, { headers: getSSEHeaders() })
    } catch (error) {
      console.error('Controller error:', error)
      return new Response(
        createSSEMessage({
          error: error instanceof Error ? error.message : 'Failed to process request',
          done: true,
        }),
        { headers: getSSEHeaders() }
      )
    }
  }
}
