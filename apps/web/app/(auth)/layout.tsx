import Image from 'next/image'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: 'var(--surface)' }}
    >
      <div className="mb-8">
        <Image
          src="/cdc-logo.png"
          alt="Career Development Centre — British Management University"
          width={320}
          height={100}
          priority
          className="h-16 w-auto"
        />
      </div>
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
}
