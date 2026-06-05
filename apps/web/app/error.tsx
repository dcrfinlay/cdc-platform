'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en">
      <body style={{ background: '#f5f5f3', margin: 0, fontFamily: 'Segoe UI, Arial, sans-serif' }}>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ fontSize: 64, fontWeight: 700, color: '#e5e4df', lineHeight: 1, marginBottom: 16 }}>500</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Something went wrong</h1>
          <p style={{ fontSize: 13, color: '#888', marginBottom: 32, textAlign: 'center', maxWidth: 360 }}>
            An unexpected error occurred. Please try again or contact support if the problem persists.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={reset}
              style={{ padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700, color: '#fff', background: '#185FA5', border: 'none', cursor: 'pointer' }}
            >
              Try again
            </button>
            <a href="/"
              style={{ padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#666', background: '#fff', border: '1px solid #ccc', textDecoration: 'none' }}>
              Go to homepage
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
