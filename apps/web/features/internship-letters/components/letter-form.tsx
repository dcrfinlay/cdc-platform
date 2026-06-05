'use client'

import { useActionState } from 'react'
import { submitLetter, type SubmitLetterState } from '@/features/internship-letters/actions/submit-letter'

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
  const [state, action, pending] = useActionState<SubmitLetterState, FormData>(
    submitLetter,
    {}
  )

  return (
    <form action={action} className="space-y-5">
      {state.error && (
        <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-[12.5px] text-red-700">
          {state.error}
        </div>
      )}

      {/* ── Student details ── */}
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-[#aaa] mb-3 pb-2 border-b border-[#e5e4df]">
          Student details
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full name *" name="full_name"
            input={<input type="text" name="full_name" required placeholder="As on your student ID"
              defaultValue={defaultValues.full_name ?? ''} className={inputCls} />}
          />
          <Field label="Student ID *" name="student_id_no"
            input={<input type="text" name="student_id_no" required placeholder="e.g. STU-2024-0012"
              className={inputCls} />}
          />
          <Field label="Faculty *" name="faculty"
            input={
              <select name="faculty" required defaultValue={defaultValues.faculty ?? ''} className={inputCls}>
                <option value="">Select faculty</option>
                {FACULTIES.map(f => <option key={f}>{f}</option>)}
              </select>
            }
          />
          <Field label="Year of study *" name="year_of_study"
            input={
              <select name="year_of_study" required defaultValue={defaultValues.year_of_study ?? ''} className={inputCls}>
                <option value="">Select year</option>
                {YEARS.map(y => <option key={y}>{y}</option>)}
              </select>
            }
          />
          <Field label="Email address *" name="email"
            input={<input type="email" name="email" required placeholder="your@university.uz"
              defaultValue={defaultValues.email ?? ''} className={inputCls} />}
          />
          <Field label="Phone number *" name="phone"
            input={<input type="tel" name="phone" required placeholder="+998 90 123 45 67"
              defaultValue={defaultValues.phone ?? ''} className={inputCls} />}
          />
        </div>
      </div>

      {/* ── Internship details ── */}
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-[#aaa] mb-3 pb-2 border-b border-[#e5e4df]">
          Internship details
        </div>
        <div className="space-y-4">
          <Field label="Company / organisation name *" name="company_name"
            input={<input type="text" name="company_name" required placeholder="Where will you intern?"
              className={inputCls} />}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Start date *" name="start_date"
              input={<input type="date" name="start_date" required className={inputCls} />}
            />
            <Field label="End date *" name="end_date"
              input={<input type="date" name="end_date" required className={inputCls} />}
            />
          </div>
          <Field label="How would you like to receive the letter? *" name="delivery_method"
            input={
              <select name="delivery_method" required defaultValue="pickup" className={inputCls}>
                <option value="pickup">I will pick it up in person</option>
                <option value="post">Send by post</option>
              </select>
            }
          />
          <Field label="Additional notes (optional)" name="notes"
            input={<textarea name="notes" rows={3} placeholder="Any special instructions..."
              className={inputCls + ' resize-none'} />}
          />
        </div>
      </div>

      <div className="px-4 py-3 rounded-lg bg-[#E6F1FB] text-[#185FA5] text-[12px] flex gap-2">
        <span className="mt-0.5 flex-shrink-0">ℹ</span>
        <span>Letters require an original signature and stamp. You will be notified when your letter is ready.</span>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full py-3 rounded-lg text-[13.5px] font-bold text-white
          bg-[#185FA5] hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {pending ? 'Submitting…' : 'Submit request'}
      </button>
    </form>
  )
}

function Field({ label, name, input }: { label: string; name: string; input: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={name} className="block text-[12px] font-bold text-[#444] mb-1.5">
        {label}
      </label>
      {input}
    </div>
  )
}

const inputCls =
  'w-full px-3 py-2 text-[13px] border border-[#ccc] rounded-lg bg-white ' +
  'focus:outline-none focus:border-[#185FA5] transition-colors'
