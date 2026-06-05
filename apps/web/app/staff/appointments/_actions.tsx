'use client'

import { useActionState, useTransition } from 'react'
import { createSlot, type CreateSlotState } from '@/features/appointments/actions/create-slot'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function CreateSlotForm() {
  const [state, action, pending] = useActionState<CreateSlotState, FormData>(createSlot, {})
  return (
    <form action={action} className="space-y-3">
      {state.error   && <p className="text-[12.5px] text-red-600">{state.error}</p>}
      {state.success && <p className="text-[12.5px] text-[#0F6E56]">✓ Slot added.</p>}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-[#444] mb-1">Date *</label>
          <input type="date" name="slot_date" required
            min={new Date().toISOString().split('T')[0]}
            className={ic} />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-[#444] mb-1">Start *</label>
          <input type="time" name="start_time" required className={ic} />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-[#444] mb-1">End *</label>
          <input type="time" name="end_time" required className={ic} />
        </div>
      </div>
      <div>
        <label className="block text-[11px] font-bold text-[#444] mb-1">Label (optional)</label>
        <input type="text" name="label" placeholder="e.g. CV Review, Career Guidance" className={ic} />
      </div>
      <button type="submit" disabled={pending}
        className="px-5 py-2 rounded-lg text-[12px] font-bold text-white bg-[#185FA5]
          hover:opacity-90 disabled:opacity-50">
        {pending ? 'Adding…' : 'Add slot'}
      </button>
    </form>
  )
}

export function CompleteBookingButton({ bookingId }: { bookingId: string }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  async function complete() {
    const supabase = createClient()
    await supabase.from('bookings').update({ status: 'completed' }).eq('id', bookingId)
    router.refresh()
  }

  return (
    <button onClick={() => startTransition(complete)} disabled={isPending}
      className="text-[11px] font-semibold text-[#185FA5] hover:underline disabled:opacity-50">
      {isPending ? '…' : 'Mark complete'}
    </button>
  )
}

const ic = 'w-full px-3 py-1.5 text-[12.5px] border border-[#ccc] rounded-lg bg-white focus:outline-none focus:border-[#185FA5]'
