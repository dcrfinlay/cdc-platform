'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type UploadResumeState = { error?: string; success?: boolean }

export async function uploadResume(
  _prev: UploadResumeState,
  formData: FormData
): Promise<UploadResumeState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const file = formData.get('cv') as File | null
  if (!file || file.size === 0) return { error: 'Please select a PDF file.' }
  if (file.type !== 'application/pdf') return { error: 'Only PDF files are accepted.' }
  if (file.size > 5 * 1024 * 1024) return { error: 'File must be under 5 MB.' }

  const filePath = `${user.id}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`
  const bytes    = await file.arrayBuffer()

  // Remove existing file if present
  const { data: existing } = await supabase
    .from('resumes')
    .select('file_path')
    .eq('student_id', user.id)
    .maybeSingle()

  if (existing?.file_path) {
    await supabase.storage.from('resumes').remove([existing.file_path])
  }

  // Upload to Storage
  const { error: uploadError } = await supabase.storage
    .from('resumes')
    .upload(filePath, bytes, { contentType: 'application/pdf', upsert: false })

  if (uploadError) {
    return { error: 'Upload failed. Please try again.' }
  }

  // Upsert metadata
  const { error: dbError } = await supabase.from('resumes').upsert({
    student_id: user.id,
    file_path:  filePath,
    file_name:  file.name,
    file_size:  file.size,
  }, { onConflict: 'student_id' })

  if (dbError) {
    await supabase.storage.from('resumes').remove([filePath])
    return { error: 'Failed to save CV record. Please try again.' }
  }

  revalidatePath('/student/resume')
  return { success: true }
}

export async function toggleCvVisibility(visible: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  await supabase.from('resumes')
    .update({ cv_visible: visible })
    .eq('student_id', user.id)

  revalidatePath('/student/resume')
  return { success: true }
}
