import Link from 'next/link'
import Image from 'next/image'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: 'var(--surface)' }}>
      <Image src="/cdc-logo.png" alt="CDC BMU" width={200} height={60} className="h-10 w-auto mb-10 opacity-80" />
      <div className="text-[72px] font-bold text-[#e5e4df] leading-none mb-4">404</div>
      <h1 className="text-[20px] font-bold mb-2">Page not found</h1>
      <p className="text-[13px] text-[#888] mb-8 text-center max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/"
        className="px-6 py-3 rounded-lg text-[13px] font-bold text-white bg-[#185FA5] hover:opacity-90 transition-opacity">
        Go to homepage
      </Link>
    </div>
  )
}
