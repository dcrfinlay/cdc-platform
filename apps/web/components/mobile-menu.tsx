'use client'

import { useState } from 'react'
import Link from 'next/link'

interface NavItem {
  href: string
  label: string
}

interface MobileMenuProps {
  items: NavItem[]
  userName?: string
}

export function MobileMenu({ items, userName }: MobileMenuProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Hamburger button — only visible on small screens */}
      <button
        onClick={() => setOpen(o => !o)}
        className="sm:hidden flex flex-col justify-center gap-1.5 w-8 h-8 p-1"
        aria-label="Menu"
      >
        <span className={`block h-0.5 bg-[#1a1a18] transition-transform origin-center ${open ? 'rotate-45 translate-y-2' : ''}`} />
        <span className={`block h-0.5 bg-[#1a1a18] transition-opacity ${open ? 'opacity-0' : ''}`} />
        <span className={`block h-0.5 bg-[#1a1a18] transition-transform origin-center ${open ? '-rotate-45 -translate-y-2' : ''}`} />
      </button>

      {/* Drawer overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 sm:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-in drawer */}
      <div className={`fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-xl
        transition-transform duration-200 ease-in-out sm:hidden
        ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e4df]">
          {userName && <span className="text-[13px] font-semibold text-[#1a1a18] truncate">{userName}</span>}
          <button onClick={() => setOpen(false)} className="ml-auto text-[#888] hover:text-[#1a1a18] text-xl leading-none">✕</button>
        </div>
        <nav className="p-4 flex flex-col gap-1">
          {items.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="px-4 py-3 rounded-lg text-[13px] font-semibold text-[#444]
                hover:bg-[#f0efe9] hover:text-[#1a1a18] transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  )
}
