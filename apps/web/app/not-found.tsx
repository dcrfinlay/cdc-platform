import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: 'var(--bg)' }}>

      <div className="mb-12">
        <Image
          src="/cdc-logo.png"
          alt="Career Development Centre — British Management University"
          width={220}
          height={68}
          className="h-12 w-auto opacity-80"
        />
      </div>

      <div className="text-[96px] font-bold leading-none tracking-tight mb-2"
        style={{ color: 'var(--border-strong)' }}>
        404
      </div>
      <h1 className="text-[22px] font-bold mb-3">Page not found</h1>
      <p className="text-[14px] text-[var(--muted)] mb-10 text-center max-w-sm leading-relaxed">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      <Link href="/"
        className="flex items-center gap-2 px-6 py-3 rounded-xl text-[13.5px] font-bold text-white
          bg-[var(--brand)] hover:opacity-90 transition-opacity shadow-sm">
        <ArrowLeft size={15} /> Go to homepage
      </Link>
    </div>
  )
}
