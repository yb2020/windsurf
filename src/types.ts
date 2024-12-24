export interface ApiResponse<T = any> {
  data?: T
  error?: string
  status?: number
  message?: string
}

export interface User {
  id: string
  role: string
}
