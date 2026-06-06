'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { signOut } from '@/features/auth/actions/sign-out'
import {
  LayoutDashboard, Briefcase, FileText, CalendarDays, Bell,
  User, Building2, Users, Megaphone, ClipboardList, BarChart3,
  GraduationCap, BookOpen, Star, Menu, X, LogOut,
} from 'lucide-react'

export interface NavItem {
  href:   string
  label:  string
  icon?:  string
  badge?: number
}

const ICON_MAP: Record<string, React.ElementType> = {
  dashboard:     LayoutDashboard,
  jobs:          Briefcase,
  letters:       FileText,
  events:        CalendarDays,
  notifications: Bell,
  profile:       User,
  employers:     Building2,
  users:         Users,
  announcements: Megaphone,
  'audit-log':   ClipboardList,
  outcomes:      BarChart3,
  resumes:       GraduationCap,
  appointments:  BookOpen,
  saved:         Star,
}

function getIcon(href: string): React.ElementType {
  const segment = href.split('/').pop() ?? ''
  return ICON_MAP[segment] ?? LayoutDashboard
}

export interface SidebarProps {
  items:     NavItem[]
  userName:  string
  userEmail: string
  role:      string
}

const ROLE_COLORS: Record<string, { bg: string; text: string; label: string; dashHref: string }> = {
  student:  { bg: '#EBF4FF', text: '#185FA5', label: 'Student',  dashHref: '/student/dashboard'  },
  employer: { bg: '#E3F5EF', text: '#0F6E56', label: 'Employer', dashHref: '/employer/dashboard' },
  staff:    { bg: '#FEF3E2', text: '#92500A', label: 'Staff',    dashHref: '/staff/dashboard'    },
  admin:    { bg: '#EFEDFF', text: '#5B50C8', label: 'Admin',    dashHref: '/admin/dashboard'    },
}

// ── Sub-components extracted outside Sidebar to prevent remount on state change ──

function NavLinks({
  items, pathname, onNavigate,
}: {
  items: NavItem[]; pathname: string; onNavigate: () => void
}) {
  return (
    <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
      {items.map(item => {
        const Icon   = getIcon(item.href)
        const active = pathname === item.href ||
          (item.href !== '/' && pathname.startsWith(item.href) && item.href.split('/').length > 2)
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all group
              ${active
                ? 'bg-[var(--sidebar-active)] text-white'
                : 'text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover)] hover:text-white'
              }`}
          >
            <Icon size={16} className={active ? 'text-white' : 'text-[var(--sidebar-muted)] group-hover:text-white'} />
            <span className="flex-1">{item.label}</span>
            {item.badge != null && item.badge > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold min-w-[18px] text-center">
                {item.badge}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}

function UserFooter({ userName, userEmail, roleStyle }: {
  userName: string; userEmail: string
  roleStyle: { bg: string; text: string }
}) {
  return (
    <div className="px-3 py-4 border-t border-white/10">
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0"
          style={{ background: roleStyle.bg, color: roleStyle.text }}>
          {(userName || userEmail).charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-semibold text-white truncate">{userName || 'User'}</div>
          <div className="text-[10px] text-[var(--sidebar-muted)] truncate">{userEmail}</div>
        </div>
      </div>
      <form action={signOut} className="mt-1">
        <button type="submit"
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] text-[var(--sidebar-muted)]
            hover:bg-[var(--sidebar-hover)] hover:text-white transition-all">
          <LogOut size={14} />
          Sign out
        </button>
      </form>
    </div>
  )
}

function SidebarLogo({ dashHref }: { dashHref: string }) {
  return (
    <div className="px-4 py-4 border-b border-white/10">
      <Link href={dashHref} className="block hover:opacity-85 transition-opacity">
        <Image
          src="/cdc-logo.png"
          alt="Career Development Centre — British Management University"
          width={180}
          height={56}
          className="h-10 w-auto"
          priority
        />
      </Link>
    </div>
  )
}

// ── Main sidebar ────────────────────────────────────────────

export function Sidebar({ items, userName, userEmail, role }: SidebarProps) {
  const pathname   = usePathname()
  const [open, setOpen] = useState(false)
  const roleStyle  = ROLE_COLORS[role] ?? ROLE_COLORS.student

  const close = useCallback(() => setOpen(false), [])

  // Close mobile drawer on Escape
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, close])

  // Close drawer on route change
  useEffect(() => { close() }, [pathname, close])

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-[var(--sidebar-w)] z-30"
        style={{ background: 'var(--sidebar-bg)' }}>
        <SidebarLogo dashHref={roleStyle.dashHref} />
        <NavLinks items={items} pathname={pathname} onNavigate={close} />
        <UserFooter userName={userName} userEmail={userEmail} roleStyle={roleStyle} />
      </aside>

      {/* ── Mobile top bar ──────────────────────────────────── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-2.5 border-b border-white/10"
        style={{ background: 'var(--sidebar-bg)' }}>
        <Link href={roleStyle.dashHref} className="hover:opacity-85 transition-opacity">
          <Image src="/cdc-logo.png" alt="Career Development Centre — BMU" width={140} height={44} className="h-8 w-auto" />
        </Link>
        <button onClick={() => setOpen(true)} aria-label="Open navigation"
          className="p-2 rounded-lg text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover)] hover:text-white transition-all">
          <Menu size={18} />
        </button>
      </header>

      {/* ── Mobile drawer ───────────────────────────────────── */}
      {open && (
        <>
          {/* Backdrop */}
          <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={close} aria-hidden="true" />

          {/* Drawer — aria-modal traps screen reader focus inside */}
          <aside
            role="dialog" aria-modal="true" aria-label="Navigation"
            className="lg:hidden fixed left-0 top-0 h-screen w-72 z-50 flex flex-col animate-fade-in"
            style={{ background: 'var(--sidebar-bg)' }}>
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
              <Link href={roleStyle.dashHref} onClick={close} className="hover:opacity-85 transition-opacity">
                <Image src="/cdc-logo.png" alt="Career Development Centre — BMU" width={140} height={44} className="h-8 w-auto" />
              </Link>
              <button onClick={close} aria-label="Close navigation"
                className="p-1.5 rounded-lg text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover)]">
                <X size={16} />
              </button>
            </div>
            <NavLinks items={items} pathname={pathname} onNavigate={close} />
            <UserFooter userName={userName} userEmail={userEmail} roleStyle={roleStyle} />
          </aside>
        </>
      )}
    </>
  )
}
