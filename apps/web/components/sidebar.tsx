'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { signOut } from '@/features/auth/actions/sign-out'
import {
  LayoutDashboard, Briefcase, FileText, CalendarDays, Bell,
  User, Building2, Users, Megaphone, ClipboardList, BarChart3,
  GraduationCap, BookOpen, Star, Menu, X, LogOut, ChevronRight,
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

interface SidebarProps {
  items:     NavItem[]
  userName:  string
  userEmail: string
  role:      string
}

const ROLE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  student:  { bg: '#EBF4FF', text: '#185FA5', label: 'Student'  },
  employer: { bg: '#E3F5EF', text: '#0F6E56', label: 'Employer' },
  staff:    { bg: '#FEF3E2', text: '#92500A', label: 'Staff'    },
  admin:    { bg: '#EFEDFF', text: '#5B50C8', label: 'Admin'    },
}

export function Sidebar({ items, userName, userEmail, role }: SidebarProps) {
  const pathname = usePathname()
  const [open, setOpen]   = useState(false)
  const roleStyle = ROLE_COLORS[role] ?? ROLE_COLORS.student

  const NavLinks = () => (
    <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
      {items.map(item => {
        const Icon    = getIcon(item.href)
        const active  = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href) && item.href.split('/').length > 2)
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
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

  const UserFooter = () => (
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

  const Logo = () => (
    <div className="px-4 py-5 border-b border-white/10">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-[var(--brand)] flex items-center justify-center flex-shrink-0">
          <GraduationCap size={16} className="text-white" />
        </div>
        <div>
          <div className="text-[13px] font-bold text-white leading-tight">Career Centre</div>
          <div className="text-[10px] text-[var(--sidebar-muted)]">BMU Portal</div>
        </div>
      </div>
      <div className="mt-3">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: roleStyle.bg + '33', color: roleStyle.text, border: `1px solid ${roleStyle.text}33` }}>
          {roleStyle.label}
        </span>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-[var(--sidebar-w)] z-30"
        style={{ background: 'var(--sidebar-bg)' }}>
        <Logo />
        <NavLinks />
        <UserFooter />
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 border-b border-white/10"
        style={{ background: 'var(--sidebar-bg)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[var(--brand)] flex items-center justify-center">
            <GraduationCap size={14} className="text-white" />
          </div>
          <div className="text-[13px] font-bold text-white">Career Centre</div>
        </div>
        <button onClick={() => setOpen(true)}
          className="p-2 rounded-lg text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover)] hover:text-white transition-all">
          <Menu size={18} />
        </button>
      </header>

      {/* Mobile drawer */}
      {open && (
        <>
          <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)} />
          <aside className="lg:hidden fixed left-0 top-0 h-screen w-72 z-50 flex flex-col animate-fade-in"
            style={{ background: 'var(--sidebar-bg)' }}>
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[var(--brand)] flex items-center justify-center">
                  <GraduationCap size={14} className="text-white" />
                </div>
                <div className="text-[13px] font-bold text-white">Career Centre</div>
              </div>
              <button onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover)]">
                <X size={16} />
              </button>
            </div>
            <NavLinks />
            <UserFooter />
          </aside>
        </>
      )}
    </>
  )
}
