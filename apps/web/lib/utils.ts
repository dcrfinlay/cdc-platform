import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getRoleDashboard(role: string): string {
  const routes: Record<string, string> = {
    student: '/student/dashboard',
    employer: '/employer/dashboard',
    staff: '/staff/dashboard',
    admin: '/admin/dashboard',
  }
  return routes[role] ?? '/student/dashboard'
}
