export interface ChatRequestDto {
  message: string
}

export interface ChatResponseDto {
  content: string
}

export interface ChatStreamChunk {
  content?: string
  done: boolean
  error?: string
}
