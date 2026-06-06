'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { createEvent, type CreateEventState } from '@/features/events/actions/create-event'
import { ChevronLeft } from 'lucide-react'

const EVENT_TYPES = [
  { value: 'workshop',    label: 'Workshop'      },
  { value: 'speaker',     label: 'Guest speaker' },
  { value: 'career_fair', label: 'Career fair'   },
  { value: 'webinar',     label: 'Webinar'       },
  { value: 'other',       label: 'Other'         },
]

export default function NewEventPage() {
  const [state, action, pending] = useActionState<CreateEventState, FormData>(createEvent, {})

  return (
    <div className="p-6 lg:p-10 max-w-2xl mx-auto">
      <Link href="/staff/events"
        className="inline-flex items-center gap-1.5 text-[12.5px] text-[var(--muted)] hover:text-[var(--brand)] mb-6 transition-colors">
        <ChevronLeft size={14} /> Back to events
      </Link>

      <h1 className="text-[24px] font-bold tracking-tight mb-6">Create new event</h1>

      <div className="bg-white rounded-2xl border border-[var(--border)] p-7 shadow-[var(--shadow-sm)]">
        {state.error && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-[12.5px] text-red-700">
            {state.error}
          </div>
        )}

        <form action={action} className="space-y-4">
          <Field label="Event title *">
            <input type="text" name="title" required placeholder="e.g. CV & Cover Letter Workshop" className={ic} />
          </Field>

          <Field label="Type *">
            <select name="type" required className={ic}>
              {EVENT_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Description">
            <textarea name="description" rows={3} placeholder="What can students expect?"
              className={ic + ' resize-none'} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Start date & time *">
              <input type="datetime-local" name="event_date" required className={ic} />
            </Field>
            <Field label="End date & time">
              <input type="datetime-local" name="end_date" className={ic} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Location">
              <input type="text" name="location" placeholder="Room / building" className={ic} />
            </Field>
            <Field label="Capacity (blank = unlimited)">
              <input type="number" name="capacity" min={1} placeholder="e.g. 30" className={ic} />
            </Field>
          </div>

          <label className="flex items-center gap-2 text-[13px] cursor-pointer">
            <input type="checkbox" name="is_online" value="true" className="w-4 h-4 accent-[var(--brand)]" />
            Online event
          </label>

          <div className="pt-4 border-t border-[var(--border)] flex gap-3">
            <button type="submit" name="publish" value="true" disabled={pending}
              className="flex-1 py-3 rounded-xl text-[13.5px] font-bold text-white
                bg-[var(--brand)] hover:opacity-90 transition-opacity disabled:opacity-60">
              {pending ? 'Saving…' : 'Publish event'}
            </button>
            <button type="submit" name="publish" value="false" disabled={pending}
              className="px-5 py-3 rounded-xl text-[13px] font-semibold border border-[var(--border)]
                text-[var(--muted)] hover:border-[var(--border-strong)] transition-colors disabled:opacity-60">
              Save draft
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[12px] font-bold text-[var(--text-2)] mb-1.5">{label}</label>
      {children}
    </div>
  )
}

const ic = 'w-full px-3 py-2.5 text-[13px] border border-[var(--border)] rounded-xl bg-white ' +
  'focus:outline-none focus:border-[var(--brand)] focus:ring-4 focus:ring-blue-50 transition-all'
