'use client'

import { useMountedTheme } from '@/hooks/useTheme'
import { Toaster } from 'sonner'
import AdminSidebar from '@/components/admin/AdminSidebar'

interface Props {
  children: React.ReactNode
  fullName: string
  email: string
}

export default function AdminLayoutClient({ children, fullName, email }: Props) {
  const { isDark } = useMountedTheme()

  return (
    <div
      suppressHydrationWarning
      className={`flex h-screen overflow-hidden ${isDark ? 'text-white' : 'text-gray-900'}`}
      style={{
        background: isDark
          ? 'linear-gradient(160deg, #080c17 0%, #0d1220 50%, #120826 100%)'
          : 'linear-gradient(160deg, #f9fafb 0%, #f3f4f6 100%)',
      }}
    >
      {isDark && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-800/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-blue-800/4 rounded-full blur-3xl" />
        </div>
      )}

      <AdminSidebar fullName={fullName} email={email} />

      <main className="relative z-10 flex-1 overflow-y-auto lg:ml-0">
        <div className="min-h-full p-4 sm:p-6 lg:p-8 pt-16 lg:pt-6">
          {children}
        </div>
      </main>

      <Toaster
        position="top-right"
        toastOptions={{
          style: isDark ? {
            background: 'rgba(10,14,28,0.96)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
            backdropFilter: 'blur(20px)',
          } : {
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            color: '#111827',
          },
        }}
      />
    </div>
  )
}
