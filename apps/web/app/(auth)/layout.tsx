import { Briefcase } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: 'var(--surface)' }}>
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: '#185FA5' }}>
          <Briefcase size={20} color="#E6F1FB" />
        </div>
        <div className="text-center">
          <div className="text-sm font-bold text-[#1a1a18]">Career Centre</div>
          <div className="text-xs text-[#888]">University Portal</div>
        </div>
      </div>
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
}
