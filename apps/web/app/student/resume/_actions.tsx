'use client'

import { useActionState, useTransition } from 'react'
import { uploadResume, toggleCvVisibility, type UploadResumeState } from '@/features/resume/actions/upload-resume'

export function ResumeUploadForm() {
  const [state, action, pending] = useActionState<UploadResumeState, FormData>(uploadResume, {})

  return (
    <form action={action} className="space-y-4">
      {state.error && (
        <p className="text-[12.5px] text-red-600">{state.error}</p>
      )}
      {state.success && (
        <p className="text-[12.5px] text-[#0F6E56]">✓ CV uploaded successfully.</p>
      )}
      <div>
        <input
          type="file"
          name="cv"
          accept="application/pdf"
          required
          className="w-full text-[13px] text-[#444] file:mr-4 file:py-2 file:px-4
            file:rounded-lg file:border-0 file:text-[12px] file:font-bold
            file:bg-[#E6F1FB] file:text-[#185FA5] hover:file:opacity-80 cursor-pointer"
        />
        <p className="text-[11px] text-[#888] mt-1">PDF only · max 5 MB</p>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full py-2.5 rounded-lg text-[13px] font-bold text-white
          bg-[#185FA5] hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {pending ? 'Uploading…' : 'Upload CV'}
      </button>
    </form>
  )
}

export function VisibilityToggle({ visible }: { visible: boolean }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(() => toggleCvVisibility(!visible))}
      disabled={isPending}
      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0
        disabled:opacity-50 ${visible ? 'bg-[#0F6E56]' : 'bg-[#ccc]'}`}
      title={visible ? 'Disable employer visibility' : 'Enable employer visibility'}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow
        transition-transform ${visible ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  )
}
