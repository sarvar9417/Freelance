import type { Metadata } from 'next'
import Link from 'next/link'
import { GraduationCap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Kirish | Freelancer School',
  description: "13-25 yoshli yoshlar uchun bepul freelancerlik o'quv platformasi",
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-layout">
      {/* Header */}
      <header className="py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <div className="auth-logo">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="auth-title">Freelancer School</span>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="auth-footer">
        <p>© 2024 Freelancer School — Bepul, hamma uchun</p>
      </footer>
    </div>
  )
}
