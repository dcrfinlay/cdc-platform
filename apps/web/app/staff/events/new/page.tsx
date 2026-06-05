'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { createEvent, type CreateEventState } from '@/features/events/actions/create-event'
import { NavLogo } from '@/components/nav-logo'

const EVENT_TYPES = [
  { value: 'workshop',    label: 'Workshop'    },
  { value: 'speaker',     label: 'Guest speaker' },
  { value: 'career_fair', label: 'Career fair' },
  { value: 'webinar',     label: 'Webinar'     },
  { value: 'other',       label: 'Other'       },
]

export default function NewEventPage() {
  const [state, action, pending] = useActionState<CreateEventState, FormData>(createEvent, {})

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface)' }}>
      <nav className="bg-white border-b border-[#e5e4df] px-7 py-3 flex items-center justify-between">
        <NavLogo />
        <Link href="/staff/events" className="text-[12.5px] text-[#185FA5] hover:underline">
          ← Back to events
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-[22px] font-bold mb-6">Create new event</h1>

        <div className="bg-white border border-[#e5e4df] rounded-xl p-7">
          {state.error && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-[12.5px] text-red-700">
              {state.error}
            </div>
          )}

          <form action={action} className="space-y-4">
            <Field label="Event title *">
              <input type="text" name="title" required placeholder="e.g. CV & Cover Letter Workshop"
                className={inputCls} />
            </Field>

            <Field label="Type *">
              <select name="type" required className={inputCls}>
                {EVENT_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </Field>

            <Field label="Description">
              <textarea name="description" rows={3} placeholder="What can students expect?"
                className={inputCls + ' resize-none'} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Start date & time *">
                <input type="datetime-local" name="event_date" required className={inputCls} />
              </Field>
              <Field label="End date & time">
                <input type="datetime-local" name="end_date" className={inputCls} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Location">
                <input type="text" name="location" placeholder="Room / building" className={inputCls} />
              </Field>
              <Field label="Capacity (leave blank = unlimited)">
                <input type="number" name="capacity" min={1} placeholder="e.g. 30" className={inputCls} />
              </Field>
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-[13px] cursor-pointer">
                <input type="checkbox" name="is_online" value="true" className="w-4 h-4 accent-[#185FA5]" />
                Online event
              </label>
            </div>

            <div className="pt-4 border-t border-[#e5e4df] flex gap-3">
              <button
                type="submit"
                name="publish"
                value="true"
                disabled={pending}
                className="flex-1 py-3 rounded-lg text-[13.5px] font-bold text-white
                  bg-[#185FA5] hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {pending ? 'Saving…' : 'Publish event'}
              </button>
              <button
                type="submit"
                name="publish"
                value="false"
                disabled={pending}
                className="px-5 py-3 rounded-lg text-[13px] font-semibold border border-[#ccc]
                  text-[#666] hover:border-[#aaa] transition-colors disabled:opacity-60"
              >
                Save draft
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[12px] font-bold text-[#444] mb-1.5">{label}</label>
      {children}
    </div>
  )
}

const inputCls =
  'w-full px-3 py-2 text-[13px] border border-[#ccc] rounded-lg bg-white ' +
  'focus:outline-none focus:border-[#185FA5] transition-colors'
