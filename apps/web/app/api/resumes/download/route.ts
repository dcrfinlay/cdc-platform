import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET /api/resumes/download?studentId=xxx
// Verifies caller is an approved employer, returns a short-lived signed URL.
export async function GET(req: NextRequest) {
  const studentId = req.nextUrl.searchParams.get('studentId')
  if (!studentId) {
    return NextResponse.json({ error: 'Missing studentId' }, { status: 400 })
  }

  // Verify caller is an authenticated, approved employer
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: employer } = await supabase
    .from('employers')
    .select('approved')
    .eq('id', user.id)
    .single()

  if (!employer?.approved) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Fetch resume record — must be visible
  const admin = createAdminClient()
  const { data: resume } = await admin
    .from('resumes')
    .select('file_path, file_name')
    .eq('student_id', studentId)
    .eq('cv_visible', true)
    .single()

  if (!resume) {
    return NextResponse.json({ error: 'Resume not found or not visible' }, { status: 404 })
  }

  // Generate signed URL valid for 5 minutes
  const { data: signed, error } = await admin.storage
    .from('resumes')
    .createSignedUrl(resume.file_path, 300, {
      download: resume.file_name,
    })

  if (error || !signed?.signedUrl) {
    return NextResponse.json({ error: 'Could not generate download link' }, { status: 500 })
  }

  return NextResponse.redirect(signed.signedUrl)
}
