import type { Context } from 'hono'

export interface ApiResponse<T = unknown> {
  status?: number
  message?: string
  data?: T
}

export interface User {
  id: string
  name: string
  email: string
}

declare module 'hono' {
  interface ContextVariables {
    user?: User
  }

  interface Env {
    AZURE_OPENAI_API_KEY: string
    AZURE_OPENAI_ENDPOINT: string
  }
}
