'use client'

import { useActionState } from 'react'
import { registerForEvent, type RegisterEventState } from '@/features/events/actions/register-event'
import { cancelRegistration } from '@/features/events/actions/cancel-registration'

export function RegisterButton({ eventId, isFull }: { eventId: string; isFull: boolean }) {
  const [state, action, pending] = useActionState<RegisterEventState, FormData>(
    registerForEvent,
    {}
  )
  return (
    <form action={action}>
      <input type="hidden" name="event_id" value={eventId} />
      {state.error && (
        <p className="text-[12.5px] text-red-600 mb-3">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending || isFull}
        className="w-full py-3 rounded-lg text-[13.5px] font-bold text-white
          bg-[#185FA5] hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {isFull ? 'Event is full' : pending ? 'Registering…' : 'Register my spot'}
      </button>
    </form>
  )
}

export function CancelButton({ eventId }: { eventId: string }) {
  const [, action, pending] = useActionState(cancelRegistration, null)
  return (
    <form action={action}>
      <input type="hidden" name="event_id" value={eventId} />
      <button
        type="submit"
        disabled={pending}
        className="w-full py-2.5 rounded-lg text-[13px] font-semibold border border-[#ccc]
          text-[#666] hover:border-red-300 hover:text-red-600 transition-colors disabled:opacity-50"
      >
        {pending ? 'Cancelling…' : 'Cancel registration'}
      </button>
    </form>
  )
}
