'use client'

import { useActionState, useEffect, useState } from 'react'
import Link from 'next/link'
import { saveAnnouncement, type AnnouncementState } from '@/features/admin/actions/save-announcement'
import { createClient } from '@/lib/supabase/client'
import { ChevronLeft } from 'lucide-react'

const COLORS = ['blue', 'green', 'amber', 'purple']
const ICONS  = ['info', 'briefcase', 'clock', 'star', 'bell', 'users']

export default function EditAnnouncementPage({ params }: { params: Promise<{ id: string }> }) {
  const [state, action, pending] = useActionState<AnnouncementState, FormData>(saveAnnouncement, {})
  const [ann, setAnn] = useState<any>(null)
  const [id, setId]   = useState<string>('')

  useEffect(() => {
    params.then(p => {
      setId(p.id)
      const supabase = createClient()
      supabase.from('announcements')
        .select('title, body, icon, color, is_published')
        .eq('id', p.id).single()
        .then(({ data }) => setAnn(data))
    })
  }, [params])

  if (!ann) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <p className="text-[13px] text-[var(--muted)]">Loading…</p>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-10 max-w-xl mx-auto">
      <Link href="/admin/announcements"
        className="inline-flex items-center gap-1.5 text-[12.5px] text-[var(--muted)] hover:text-[var(--brand)] mb-6 transition-colors">
        <ChevronLeft size={14} /> Back to announcements
      </Link>

      <h1 className="text-[24px] font-bold tracking-tight mb-6">Edit announcement</h1>

      <div className="bg-white rounded-2xl border border-[var(--border)] p-7 shadow-[var(--shadow-sm)]">
        {state.error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-[12.5px] text-red-700">{state.error}</div>
        )}
        <form action={action} className="space-y-4">
          <input type="hidden" name="id" value={id} />
          <F label="Title *">
            <input type="text" name="title" required defaultValue={ann.title} className={ic} />
          </F>
          <F label="Body *">
            <textarea name="body" required rows={4} defaultValue={ann.body} className={ic + ' resize-none'} />
          </F>
          <div className="grid grid-cols-2 gap-4">
            <F label="Colour">
              <select name="color" className={ic} defaultValue={ann.color}>
                {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </F>
            <F label="Icon">
              <select name="icon" className={ic} defaultValue={ann.icon}>
                {ICONS.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </F>
          </div>
          <div className="flex gap-3 pt-4 border-t border-[var(--border)]">
            <button type="submit" name="is_published" value="true" disabled={pending}
              className="flex-1 py-3 rounded-xl text-[13.5px] font-bold text-white bg-[var(--brand)] hover:opacity-90 disabled:opacity-60">
              {pending ? 'Saving…' : 'Save & publish'}
            </button>
            <button type="submit" name="is_published" value="false" disabled={pending}
              className="px-5 py-3 rounded-xl text-[13px] font-semibold border border-[var(--border)] text-[var(--muted)] hover:border-[var(--border-strong)] disabled:opacity-60">
              Save as draft
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[12px] font-bold text-[var(--text-2)] mb-1.5">{label}</label>
      {children}
    </div>
  )
}
const ic = 'w-full px-3 py-2.5 text-[13px] border border-[var(--border)] rounded-xl bg-white focus:outline-none focus:border-[var(--brand)] focus:ring-4 focus:ring-blue-50 transition-all'
