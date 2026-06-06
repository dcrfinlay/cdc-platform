import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LetterForm } from '@/features/internship-letters/components/letter-form'
import { ChevronLeft } from 'lucide-react'

export default async function NewLetterPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('full_name, phone, faculty, year_of_study').eq('id', user.id).single()

  return (
    <div className="p-6 lg:p-10 max-w-2xl mx-auto">
      <Link href="/student/letters"
        className="inline-flex items-center gap-1.5 text-[12.5px] text-[var(--muted)] hover:text-[var(--brand)] mb-6 transition-colors">
        <ChevronLeft size={14} /> Back to letters
      </Link>

      <div className="bg-white rounded-2xl border border-[var(--border)] p-7 shadow-[var(--shadow-sm)]">
        <h1 className="text-[20px] font-bold mb-1">Request an internship letter</h1>
        <p className="text-[13px] text-[var(--muted)] mb-6 leading-relaxed">
          Fill in the details below. Your letter will be ready within 48 hours.
        </p>
        <LetterForm defaultValues={{
          full_name:     profile?.full_name,
          phone:         profile?.phone,
          faculty:       profile?.faculty,
          year_of_study: profile?.year_of_study,
          email:         user.email,
        }} />
      </div>
    </div>
  )
}
