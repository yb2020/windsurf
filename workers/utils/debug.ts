export const debug = {
  log: (...args: any[]) => {
    console.log('[Worker Debug]', ...args)
  },
  error: (message: string, error: any) => {
    const errorObject = error instanceof Error ? error : new Error(String(error))
    
    console.error('[Worker Error]', {
      message,
      error: {
        name: errorObject.name,
        message: errorObject.message,
        stack: errorObject.stack?.split('\n').map(line => line.trim()),
        cause: errorObject.cause
      }
    })
  },
  info: (...args: any[]) => {
    console.info('[Worker Info]', ...args)
  },
  warn: (...args: any[]) => {
    console.warn('[Worker Warning]', ...args)
  }
}
