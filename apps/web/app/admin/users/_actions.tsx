'use client'

import { useTransition, useState } from 'react'
import { setUserRole } from '@/features/admin/actions/set-user-role'
import type { UserRole } from '@/lib/types/database.types'

const ROLES: UserRole[] = ['student', 'employer', 'staff', 'admin']

export function RoleSelect({
  userId,
  currentRole,
}: {
  userId: string
  currentRole: UserRole
}) {
  const [isPending, startTransition] = useTransition()
  const [role, setRole] = useState<UserRole>(currentRole)

  function onChange(newRole: UserRole) {
    setRole(newRole)
    startTransition(() => setUserRole(userId, newRole))
  }

  return (
    <select
      value={role}
      onChange={e => onChange(e.target.value as UserRole)}
      disabled={isPending}
      className="px-2 py-1 text-[12px] border border-[#ccc] rounded-lg
        focus:outline-none focus:border-[#185FA5] bg-white disabled:opacity-60 capitalize"
    >
      {ROLES.map(r => (
        <option key={r} value={r}>{r}</option>
      ))}
    </select>
  )
}
