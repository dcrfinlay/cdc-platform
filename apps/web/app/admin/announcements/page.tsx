import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { NavLogo } from '@/components/nav-logo'
import { signOut } from '@/features/auth/actions/sign-out'
import { deleteAnnouncement } from '@/features/admin/actions/save-announcement'
import { DeleteButton } from './_actions'

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
    <div className="min-h-screen" style={{ background: 'var(--surface)' }}>
      <nav className="bg-white border-b border-[#e5e4df] px-7 py-3 flex items-center justify-between">
        <NavLogo />
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="text-[12.5px] text-[#666] hover:text-[#185FA5]">Dashboard</Link>
          <form action={signOut}><button type="submit" className="text-[12px] text-[#185FA5] hover:underline">Sign out</button></form>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-[22px] font-bold">Announcements</h1>
          <Link href="/admin/announcements/new"
            className="px-4 py-2.5 rounded-lg text-[13px] font-bold text-white bg-[#185FA5] hover:opacity-90">
            + New announcement
          </Link>
        </div>

        {!announcements || announcements.length === 0 ? (
          <div className="bg-white border border-[#e5e4df] rounded-xl p-10 text-center">
            <p className="text-[13px] text-[#888]">No announcements yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map(ann => (
              <div key={ann.id} className="bg-white border border-[#e5e4df] rounded-xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[14px] font-bold">{ann.title}</span>
                      {ann.is_published ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E1F5EE] text-[#0F6E56]">Published</span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f0efe9] text-[#888]">Draft</span>
                      )}
                    </div>
                    <p className="text-[12px] text-[#666] line-clamp-2">{ann.body}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Link href={`/admin/announcements/${ann.id}/edit`}
                      className="px-3 py-1.5 rounded-lg text-[12px] font-semibold border border-[#e5e4df] text-[#666] hover:border-[#aaa]">
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
    </div>
  )
}
