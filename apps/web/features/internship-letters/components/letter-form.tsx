'use client'

import { useActionState } from 'react'
import { submitLetter, type SubmitLetterState } from '@/features/internship-letters/actions/submit-letter'
import { AlertCircle, Info, Loader2 } from 'lucide-react'

interface LetterFormProps {
  defaultValues?: {
    full_name?: string | null
    phone?: string | null
    faculty?: string | null
    year_of_study?: string | null
    email?: string | null
  }
}

const FACULTIES = ['Economics', 'Law', 'Engineering', 'Business', 'IT', 'Medicine', 'Other']
const YEARS     = ['1st year', '2nd year', '3rd year', '4th year', 'Masters', 'PhD']

export function LetterForm({ defaultValues = {} }: LetterFormProps) {
  const [state, action, pending] = useActionState<SubmitLetterState, FormData>(submitLetter, {})

  return (
    <form action={action} className="space-y-6">
      {state.error && (
        <div className="flex gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-[13px] text-red-700">
          <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
          {state.error}
        </div>
      )}

      {/* Student details */}
      <div>
        <div className="text-[11px] font-bold uppercase tracking-widest text-[var(--subtle)] mb-4 pb-2 border-b border-[var(--border)]">
          Student details
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <F label="Full name *">
            <input type="text" name="full_name" required placeholder="As on your student ID"
              defaultValue={defaultValues.full_name ?? ''} className={ic} />
          </F>
          <F label="Student ID *">
            <input type="text" name="student_id_no" required placeholder="e.g. STU-2024-0012" className={ic} />
          </F>
          <F label="Faculty *">
            <select name="faculty" required defaultValue={defaultValues.faculty ?? ''} className={ic}>
              <option value="">Select faculty</option>
              {FACULTIES.map(f => <option key={f}>{f}</option>)}
            </select>
          </F>
          <F label="Year of study *">
            <select name="year_of_study" required defaultValue={defaultValues.year_of_study ?? ''} className={ic}>
              <option value="">Select year</option>
              {YEARS.map(y => <option key={y}>{y}</option>)}
            </select>
          </F>
          <F label="Email address *">
            <input type="email" name="email" required placeholder="your@university.uz"
              defaultValue={defaultValues.email ?? ''} className={ic} />
          </F>
          <F label="Phone number *">
            <input type="tel" name="phone" required placeholder="+998 90 123 45 67"
              defaultValue={defaultValues.phone ?? ''} className={ic} />
          </F>
        </div>
      </div>

      {/* Internship details */}
      <div>
        <div className="text-[11px] font-bold uppercase tracking-widest text-[var(--subtle)] mb-4 pb-2 border-b border-[var(--border)]">
          Internship details
        </div>
        <div className="space-y-4">
          <F label="Company / organisation name *">
            <input type="text" name="company_name" required placeholder="Where will you intern?" className={ic} />
          </F>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <F label="Start date *">
              <input type="date" name="start_date" required className={ic} />
            </F>
            <F label="End date *">
              <input type="date" name="end_date" required className={ic} />
            </F>
          </div>
          <F label="How would you like to receive the letter? *">
            <select name="delivery_method" required defaultValue="pickup" className={ic}>
              <option value="pickup">I will pick it up in person</option>
              <option value="post">Send by post</option>
            </select>
          </F>
          <F label="Additional notes (optional)">
            <textarea name="notes" rows={3} placeholder="Any special instructions…"
              className={ic + ' resize-none'} />
          </F>
        </div>
      </div>

      <div className="flex gap-3 px-4 py-3 rounded-xl bg-[var(--brand-light)] text-[var(--brand)] text-[12.5px]">
        <Info size={15} className="flex-shrink-0 mt-0.5" />
        Letters require an original signature and stamp. You will be notified when your letter is ready within 48 hours.
      </div>

      <button type="submit" disabled={pending}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13.5px] font-bold text-white
          bg-[var(--brand)] hover:opacity-90 transition-opacity disabled:opacity-60 shadow-sm">
        {pending
          ? <><Loader2 size={16} className="animate-spin" /> Submitting…</>
          : 'Submit request'
        }
      </button>
    </form>
  )
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-[var(--text-2)] mb-1.5">{label}</label>
      {children}
    </div>
  )
}

const ic = `w-full px-3 py-2.5 text-[13px] border border-[var(--border)] rounded-xl bg-white
  focus:outline-none focus:border-[var(--brand)] focus:ring-4 focus:ring-blue-50 transition-all
  placeholder:text-[var(--placeholder)]`
