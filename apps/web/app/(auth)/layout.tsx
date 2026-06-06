import Image from 'next/image'
import { CheckCircle2 } from 'lucide-react'

const FEATURES = [
  'Browse hundreds of jobs & internships',
  'Book 1:1 career guidance sessions',
  'Get your internship letter issued fast',
  'Attend career fairs & workshops',
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] flex-shrink-0 relative overflow-hidden p-12"
        style={{
          background: 'linear-gradient(135deg, #0F1C2E 0%, #1a3a5c 50%, #185FA5 100%)',
        }}>
        {/* Dot grid pattern */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }} />

        {/* Logo — white bg preserves navy colors on dark gradient */}
        <div className="bg-white/95 rounded-2xl px-4 py-3 inline-block">
          <Image
            src="/cdc-logo.png"
            alt="Career Development Centre — British Management University"
            width={200}
            height={62}
            className="h-11 w-auto"
            priority
          />
        </div>

        {/* Main copy */}
        <div className="relative">
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Your career<br />starts here.
          </h1>
          <p className="text-blue-200 text-[15px] leading-relaxed mb-10">
            Connect with top employers, develop your skills, and launch your career — all in one place.
          </p>
          <div className="space-y-3">
            {FEATURES.map(f => (
              <div key={f} className="flex items-center gap-3">
                <CheckCircle2 size={16} className="text-blue-300 flex-shrink-0" />
                <span className="text-blue-100 text-[13px]">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative text-blue-300/40 text-[11px]">
          © {new Date().getFullYear()} British Management University
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white min-h-screen">
        <div className="w-full max-w-[400px] animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <Image
              src="/cdc-logo.png"
              alt="Career Development Centre — British Management University"
              width={200}
              height={62}
              className="h-10 w-auto"
              priority
            />
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
