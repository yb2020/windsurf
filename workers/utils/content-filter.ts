/**
 * 过滤输入内容，移除可能触发内容过滤的内容
 * @param input 用户输入的内容
 * @returns 过滤结果对象
 */
export interface FilterResult {
  content: string
  isFiltered: boolean
  originalContent: string
}

export function sanitizeInput(input: string): FilterResult {
  const originalContent = input
  const filtered = input.replace(/[^\w\s,.?!，。？！]/g, '').trim()
  
  // 检查内容是否被过滤
  const isFiltered = filtered !== originalContent.trim()
  
  return {
    content: filtered,
    isFiltered,
    originalContent
  }
}

/**
 * 创建 SSE 格式的消息
 * @param data 消息内容
 * @returns SSE 格式的消息
 */
export function createSSEMessage(data: unknown): string {
  return `data: ${typeof data === 'string' ? data : JSON.stringify(data)}\n\n`
}

/**
 * 创建 SSE 响应头
 * @returns SSE 响应头对象
 */
export function getSSEHeaders(): HeadersInit {
  return {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  }
}
