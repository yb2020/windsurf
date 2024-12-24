import { Context, Next } from 'hono'

interface CustomError extends Error {
  status?: number
}

export const errorHandler = async (c: Context, next: Next): Promise<Response | void> => {
  try {
    await next()
  } catch (err) {
    console.error('[Worker] Middleware Error:', {
      error: err instanceof Error ? {
        message: err.message,
        stack: err.stack,
        name: err.name,
        status: (err as CustomError).status
      } : String(err)
    })
    const error = err as CustomError
    return c.json(
      {
        error: error.message || 'Internal Server Error',
        status: error.status || 500,
      },
      error.status || 500
    )
  }
}
