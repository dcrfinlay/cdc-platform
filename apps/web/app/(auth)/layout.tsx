import { GraduationCap, CheckCircle2 } from 'lucide-react'

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

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
            <GraduationCap size={22} className="text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-lg leading-tight">Career Centre</div>
            <div className="text-blue-200 text-xs">British Management University</div>
          </div>
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
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-lg bg-[var(--brand)] flex items-center justify-center">
              <GraduationCap size={16} className="text-white" />
            </div>
            <div>
              <div className="text-[13px] font-bold leading-tight">Career Centre</div>
              <div className="text-[10px] text-[var(--muted)]">British Management University</div>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
