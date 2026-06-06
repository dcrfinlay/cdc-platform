import Link from 'next/link'
import type { JobType, ApplicationStatus } from '@/lib/types/database.types'
import { MapPin, Globe, Banknote, CalendarDays, Bookmark } from 'lucide-react'

const TYPE_STYLE: Record<JobType, { bg: string; color: string; label: string }> = {
  job:        { bg: 'var(--brand-light)',  color: 'var(--brand)',  label: 'Job'        },
  internship: { bg: 'var(--green-light)',  color: 'var(--green)',  label: 'Internship' },
}

const APP_STATUS: Record<ApplicationStatus, { label: string; bg: string; color: string }> = {
  submitted:   { label: 'Applied',       bg: 'var(--brand-light)',  color: 'var(--brand)'  },
  reviewed:    { label: 'Under review',  bg: 'var(--amber-light)',  color: 'var(--amber)'  },
  shortlisted: { label: 'Shortlisted',   bg: 'var(--green-light)',  color: 'var(--green)'  },
  rejected:    { label: 'Not selected',  bg: 'var(--coral-light)',  color: 'var(--coral)'  },
  hired:       { label: 'Offer made 🎉', bg: 'var(--green-light)',  color: 'var(--green)'  },
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
    <Link href={href}
      className="flex flex-col bg-white rounded-2xl border border-[var(--border)] p-5
        hover:border-[var(--border-strong)] hover:shadow-[var(--shadow)] transition-all group">

      {/* Top row: type badge + saved */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: bg, color }}>
          {label}
        </span>
        {isSaved && (
          <Bookmark size={13} className="text-[var(--muted)]" fill="currentColor" />
        )}
      </div>

      {/* Title + company */}
      <div className="flex-1">
        <div className="text-[14px] font-bold mb-1 group-hover:text-[var(--brand)] transition-colors leading-snug">
          {title}
        </div>
        <div className="text-[12px] text-[var(--muted)] mb-3">{companyName}</div>

        {/* Meta */}
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {(location || is_remote) && (
            <div className="flex items-center gap-1 text-[11px] text-[var(--muted)]">
              {is_remote ? <Globe size={11} /> : <MapPin size={11} />}
              {is_remote ? 'Remote' : location}
            </div>
          )}
          {salary_range && (
            <div className="flex items-center gap-1 text-[11px] text-[var(--muted)]">
              <Banknote size={11} /> {salary_range}
            </div>
          )}
          {deadline && (
            <div className={`flex items-center gap-1 text-[11px] ${isExpired ? 'text-[var(--coral)]' : 'text-[var(--muted)]'}`}>
              <CalendarDays size={11} />
              {isExpired ? 'Expired' : `Closes ${fmtDate(deadline)}`}
            </div>
          )}
        </div>
      </div>

      {/* Application status */}
      {applicationStatus && (
        <div className="mt-3 pt-3 border-t border-[var(--border)]">
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full"
            style={{ background: APP_STATUS[applicationStatus].bg, color: APP_STATUS[applicationStatus].color }}>
            {APP_STATUS[applicationStatus].label}
          </span>
        </div>
      )}
    </Link>
  )
}

function fmtDate(date: string) {
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
