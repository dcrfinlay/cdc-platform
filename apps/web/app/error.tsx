'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error, reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ background: '#F4F6F9', margin: 0, fontFamily: 'Inter, Segoe UI, Arial, sans-serif', WebkitFontSmoothing: 'antialiased' }}>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>

          {/* Icon */}
          <div style={{ width: 64, height: 64, borderRadius: 16, background: '#FDECE8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, fontSize: 28 }}>
            ⚠️
          </div>

          <div style={{ fontSize: 80, fontWeight: 700, color: '#E2E6ED', lineHeight: 1, marginBottom: 12 }}>500</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: '#111827' }}>Something went wrong</h1>
          <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 36, textAlign: 'center', maxWidth: 360, lineHeight: 1.6 }}>
            An unexpected error occurred. Please try again or contact support if the problem persists.
          </p>

          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={reset}
              style={{ padding: '10px 24px', borderRadius: 12, fontSize: 13, fontWeight: 700, color: '#fff', background: '#185FA5', border: 'none', cursor: 'pointer' }}>
              Try again
            </button>
            <a href="/"
              style={{ padding: '10px 24px', borderRadius: 12, fontSize: 13, fontWeight: 600, color: '#374151', background: '#fff', border: '1px solid #E2E6ED', textDecoration: 'none' }}>
              Go to homepage
            </a>
          </div>

          {process.env.NODE_ENV === 'development' && error.message && (
            <pre style={{ marginTop: 32, fontSize: 11, color: '#9CA3AF', maxWidth: 480, overflowX: 'auto', padding: '12px 16px', background: '#fff', borderRadius: 8, border: '1px solid #E2E6ED' }}>
              {error.message}
            </pre>
          )}
        </div>
      </body>
    </html>
  )
}
