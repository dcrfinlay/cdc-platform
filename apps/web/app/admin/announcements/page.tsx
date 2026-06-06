import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { deleteAnnouncement } from '@/features/admin/actions/save-announcement'
import { DeleteButton } from './_actions'
import { Plus, Megaphone } from 'lucide-react'

export default async function AdminAnnouncementsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: announcements } = await supabase
    .from('announcements')
    .select('id, title, body, color, is_published, sort_order, created_at')
    .order('sort_order')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight">Announcements</h1>
          <p className="text-[13px] text-[var(--muted)] mt-1">
            {announcements?.filter(a => a.is_published).length ?? 0} published
          </p>
        </div>
        <Link href="/admin/announcements/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold
            text-white bg-[var(--brand)] hover:opacity-90 transition-opacity shadow-sm">
          <Plus size={15} /> New announcement
        </Link>
      </div>

      {!announcements || announcements.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[var(--border)] p-14 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[var(--brand-light)] flex items-center justify-center mx-auto mb-4">
            <Megaphone size={24} className="text-[var(--brand)]" />
          </div>
          <p className="text-[14px] font-semibold mb-1">No announcements yet</p>
          <p className="text-[13px] text-[var(--muted)] mb-5">Create announcements to show on the homepage and student dashboard.</p>
          <Link href="/admin/announcements/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white bg-[var(--brand)] hover:opacity-90">
            <Plus size={14} /> Create first announcement
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map(ann => (
            <div key={ann.id}
              className="bg-white rounded-2xl border border-[var(--border)] p-5 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow)] transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[14px] font-semibold">{ann.title}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      ann.is_published
                        ? 'bg-[var(--green-light)] text-[var(--green)]'
                        : 'bg-[#F3F4F6] text-[var(--muted)]'
                    }`}>
                      {ann.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-[12.5px] text-[var(--muted)] line-clamp-2 leading-relaxed">{ann.body}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Link href={`/admin/announcements/${ann.id}/edit`}
                    className="px-3 py-1.5 rounded-xl text-[12px] font-semibold border border-[var(--border)] text-[var(--muted)] hover:border-[var(--border-strong)] transition-colors">
                    Edit
                  </Link>
                  <DeleteButton announcementId={ann.id} action={deleteAnnouncement} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
