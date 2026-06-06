'use client'

import { useEffect, useState } from 'react'

export function TimeGreeting({ firstName }: { firstName: string }) {
  const [greeting, setGreeting] = useState('Welcome')

  useEffect(() => {
    const h = new Date().getHours()
    if (h < 12) setGreeting('Good morning')
    else if (h < 17) setGreeting('Good afternoon')
    else setGreeting('Good evening')
  }, [])

  return (
    <h1 className="text-[28px] font-bold tracking-tight">
      {greeting}, {firstName} 👋
    </h1>
  )
}
