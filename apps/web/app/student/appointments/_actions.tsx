'use client'

import { useActionState, useTransition } from 'react'
import { bookSlot, cancelBooking, type BookSlotState } from '@/features/appointments/actions/book-slot'

export function BookSlotForm({ slotId }: { slotId: string }) {
  const [state, action, pending] = useActionState<BookSlotState, FormData>(bookSlot, {})
  return (
    <form action={action} className="flex flex-col items-end gap-2 flex-shrink-0">
      <input type="hidden" name="slot_id" value={slotId} />
      {state.error && <p className="text-[11px] text-red-600">{state.error}</p>}
      <button type="submit" disabled={pending}
        className="px-4 py-2 rounded-lg text-[12px] font-bold text-white bg-[#185FA5]
          hover:opacity-90 disabled:opacity-50 transition-opacity whitespace-nowrap">
        {pending ? 'Booking…' : 'Book slot'}
      </button>
    </form>
  )
}

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const [isPending, startTransition] = useTransition()
  return (
    <button onClick={() => startTransition(() => cancelBooking(bookingId))}
      disabled={isPending}
      className="text-[11px] text-[#888] hover:text-red-600 disabled:opacity-50 transition-colors">
      {isPending ? 'Cancelling…' : 'Cancel'}
    </button>
  )
}
