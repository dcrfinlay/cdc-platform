import Link from 'next/link'
import type { JobType, ApplicationStatus } from '@/lib/types/database.types'

const TYPE_STYLE: Record<JobType, { bg: string; color: string; label: string }> = {
  job:        { bg: '#E6F1FB', color: '#185FA5', label: 'Job'        },
  internship: { bg: '#E1F5EE', color: '#0F6E56', label: 'Internship' },
}

const APP_STATUS: Record<ApplicationStatus, { label: string; color: string }> = {
  submitted:   { label: 'Applied',      color: '#185FA5' },
  reviewed:    { label: 'Under review', color: '#854F0B' },
  shortlisted: { label: 'Shortlisted',  color: '#0F6E56' },
  rejected:    { label: 'Not selected', color: '#993C1D' },
  hired:       { label: 'Offer made',   color: '#0F6E56' },
}

interface JobCardProps {
  id: string
  title: string
  type: JobType
  location: string | null
  is_remote: boolean
  salary_range: string | null
  deadline: string | null
  companyName: string
  applicationStatus?: ApplicationStatus | null
  isSaved?: boolean
  href: string
}

export function JobCard({
  id, title, type, location, is_remote, salary_range,
  deadline, companyName, applicationStatus, isSaved, href,
}: JobCardProps) {
  const { bg, color, label } = TYPE_STYLE[type]
  const isExpired = deadline ? new Date(deadline) < new Date() : false

  return (
    <Link
      href={href}
      className="block bg-white border border-[#e5e4df] rounded-xl p-5
        hover:border-[#aaa] transition-colors group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <span
          className="text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0"
          style={{ background: bg, color }}
        >
          {label}
        </span>
        {isSaved && <span className="text-[11px] text-[#888]">🔖</span>}
      </div>

      <div className="text-[14px] font-bold mb-1 group-hover:text-[#185FA5] transition-colors">
        {title}
      </div>
      <div className="text-[12px] text-[#888] mb-3">{companyName}</div>

      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-[#888]">
        {(location || is_remote) && (
          <span>{is_remote ? '🌐 Remote' : `📍 ${location}`}</span>
        )}
        {salary_range && <span>💰 {salary_range}</span>}
        {deadline && (
          <span className={isExpired ? 'text-[#993C1D]' : ''}>
            📅 {isExpired ? 'Expired' : `Closes ${fmtDate(deadline)}`}
          </span>
        )}
      </div>

      {applicationStatus && (
        <div className="mt-3 pt-3 border-t border-[#e5e4df]">
          <span
            className="text-[11px] font-semibold"
            style={{ color: APP_STATUS[applicationStatus].color }}
          >
            ● {APP_STATUS[applicationStatus].label}
          </span>
        </div>
      )}
    </Link>
  )
}

function fmtDate(date: string) {
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
