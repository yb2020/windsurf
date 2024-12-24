import { ChatRequestDto, ChatStreamChunk } from '../dto/chat.dto'
import { debug } from '../utils/debug'

interface AzureOpenAIConfig {
  apiKey: string
  endpoint: string
  deploymentId: string
  apiVersion: string
}

export class ChatService {
  private config: AzureOpenAIConfig

  constructor(config: AzureOpenAIConfig) {
    this.config = config
  }

  async *streamChat(request: ChatRequestDto): AsyncGenerator<ChatStreamChunk> {
    try {
      const response = await fetch(
        `${this.config.endpoint}/openai/deployments/${this.config.deploymentId}/chat/completions?api-version=${this.config.apiVersion}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': this.config.apiKey,
          },
          body: JSON.stringify({
            messages: [
              {
                role: 'system',
                content:
                  '你是一个友好、专业的AI助手。请用礼貌和专业的方式回答问题，避免任何可能具有冒犯性或不当的内容。如果遇到不适当的问题，请礼貌地拒绝回答。',
              },
              { role: 'user', content: request.message },
            ],
            stream: true,
            max_tokens: 1000,
            temperature: 0.7,
            presence_penalty: 0.6,
            frequency_penalty: 0.5,
          }),
        }
      )


      if (!response.ok) {
        const errorData = await response.json()
        console.error('[Worker] API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        })
        throw new Error(errorData.error?.message || 'Failed to get response from Azure OpenAI')
      }

      const reader = response.body?.getReader()
      if (!reader) {
        console.error('[Worker] No reader available for response body')
        throw new Error('No response stream available')
      }

      const decoder = new TextDecoder()
      let buffer = ''
      let isStreaming = true

      while (isStreaming) {
        const { value, done } = await reader.read()
        if (done) {
          isStreaming = false
          break
        }

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              isStreaming = false
              yield { done: true }
              break
            }
            try {
              const parsed = JSON.parse(data)
              if (parsed.choices?.[0]?.delta?.content) {
                yield {
                  content: parsed.choices[0].delta.content,
                  done: false,
                }
              }
            } catch (e) {
              console.error('[Worker] Parse Error:', {
                error: e instanceof Error ? e.message : String(e),
                data: data
              })
            }
          }
        }
      }
    } catch (error) {
      console.error('[Worker] Stream Error:', {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : String(error)
      })
      yield {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        done: true,
      }
    }
  }
}
