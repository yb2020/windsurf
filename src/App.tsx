import React, { useEffect, useRef, useState } from 'react'
import './App.less'

const App: React.FC = () => {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const outputRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return

    setIsLoading(true)
    setOutput('')
    setAutoScroll(true)

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input.trim() }),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader available')

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
              setIsLoading(false)
              break
            }
            try {
              const jsonData = JSON.parse(data)
              if (jsonData.content) {
                setOutput((prev) => prev + jsonData.content)
              }
              if (jsonData.done) {
                isStreaming = false
                setIsLoading(false)
              }
            } catch (e) {
              console.error('Failed to parse SSE message:', e)
            }
          }
        }
      }
    } catch (error) {
      console.error('[Page Error]:', error)
      setOutput((prev) => prev + '\nError: Failed to get response.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleScroll = () => {
    if (!outputRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = outputRef.current
    const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10
    setAutoScroll(isAtBottom)
  }

  useEffect(() => {
    if (autoScroll && outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [output, autoScroll])

  return (
    <div className='App'>
      <header className='App-header'>
        <h1>Chat with GPT4-mini</h1>

        <div className='App-input'>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Type your message here...'
            disabled={isLoading}
          />
          <button onClick={handleSubmit} disabled={isLoading || !input.trim()}>
            {isLoading ? 'Processing...' : 'Send'}
          </button>
        </div>

        <div className='App-output' ref={outputRef} onScroll={handleScroll}>
          <div className='App-output-content'>
            {output}
            {isLoading && <span className='App-output-cursor' />}
          </div>
        </div>
      </header>
    </div>
  )
}

export default App
