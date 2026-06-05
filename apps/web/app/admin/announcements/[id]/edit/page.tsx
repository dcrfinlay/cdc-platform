'use client'

import { useActionState, useEffect, useState } from 'react'
import Link from 'next/link'
import { saveAnnouncement, type AnnouncementState } from '@/features/admin/actions/save-announcement'
import { NavLogo } from '@/components/nav-logo'
import { createClient } from '@/lib/supabase/client'

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
        .eq('id', p.id)
        .single()
        .then(({ data }) => setAnn(data))
    })
  }, [params])

  if (!ann) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--surface)' }}>
        <p className="text-[13px] text-[#888]">Loading…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface)' }}>
      <nav className="bg-white border-b border-[#e5e4df] px-7 py-3 flex items-center justify-between">
        <NavLogo />
        <Link href="/admin/announcements" className="text-[12.5px] text-[#185FA5] hover:underline">← Back</Link>
      </nav>
      <div className="max-w-xl mx-auto px-6 py-10">
        <h1 className="text-[22px] font-bold mb-6">Edit announcement</h1>
        <div className="bg-white border border-[#e5e4df] rounded-xl p-7">
          {state.error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 text-[12.5px] text-red-700">{state.error}</div>
          )}
          <form action={action} className="space-y-4">
            <input type="hidden" name="id" value={id} />
            <F label="Title *">
              <input type="text" name="title" required defaultValue={ann.title} className={ic} />
            </F>
            <F label="Body *">
              <textarea name="body" required rows={4} defaultValue={ann.body}
                className={ic + ' resize-none'} />
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
            <div className="flex gap-3 pt-4 border-t border-[#e5e4df]">
              <button type="submit" name="is_published" value="true" disabled={pending}
                className="flex-1 py-3 rounded-lg text-[13.5px] font-bold text-white bg-[#185FA5] hover:opacity-90 disabled:opacity-60">
                {pending ? 'Saving…' : 'Save & publish'}
              </button>
              <button type="submit" name="is_published" value="false" disabled={pending}
                className="px-5 py-3 rounded-lg text-[13px] font-semibold border border-[#ccc] text-[#666] hover:border-[#aaa] disabled:opacity-60">
                Save as draft
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[12px] font-bold text-[#444] mb-1.5">{label}</label>
      {children}
    </div>
  )
}
const ic = 'w-full px-3 py-2 text-[13px] border border-[#ccc] rounded-lg bg-white focus:outline-none focus:border-[#185FA5] transition-colors'
