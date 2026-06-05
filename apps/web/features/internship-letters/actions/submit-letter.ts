'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type SubmitLetterState = {
  error?: string
}

export async function submitLetter(
  _prev: SubmitLetterState,
  formData: FormData
): Promise<SubmitLetterState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const fields = {
    full_name:       formData.get('full_name') as string,
    student_id_no:   formData.get('student_id_no') as string,
    faculty:         formData.get('faculty') as string,
    year_of_study:   formData.get('year_of_study') as string,
    phone:           formData.get('phone') as string,
    email:           formData.get('email') as string,
    company_name:    formData.get('company_name') as string,
    start_date:      formData.get('start_date') as string,
    end_date:        formData.get('end_date') as string,
    delivery_method: formData.get('delivery_method') as string,
    notes:           (formData.get('notes') as string) || null,
  }

  // Basic validation
  const required = [
    'full_name', 'student_id_no', 'faculty', 'year_of_study',
    'phone', 'email', 'company_name', 'start_date', 'end_date',
  ] as const

  for (const field of required) {
    if (!fields[field]) {
      return { error: 'Please fill in all required fields.' }
    }
  }

  if (new Date(fields.end_date) <= new Date(fields.start_date)) {
    return { error: 'End date must be after start date.' }
  }

  const { error } = await supabase.from('internship_letters').insert({
    student_id: user.id,
    ...fields,
    status: 'submitted',
  })

  if (error) {
    return { error: 'Failed to submit request. Please try again.' }
  }

  redirect('/student/letters?submitted=1')
}
