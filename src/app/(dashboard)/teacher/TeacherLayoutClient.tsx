'use client'

import { useMountedTheme } from '@/hooks/useTheme'
import TeacherSidebar from '@/components/teacher/TeacherSidebar'
import { Toaster } from 'sonner'

interface Props {
  userId: string
  fullName: string
  pendingCount: number
  unreadNotifications: number
  children: React.ReactNode
}

export default function TeacherLayoutClient({
  userId, fullName, pendingCount, unreadNotifications, children
}: Props) {
  const { isDark } = useMountedTheme()

  return (
    <div
      className={`flex h-screen overflow-hidden ${isDark ? 'text-white' : 'text-gray-900'}`}
      style={isDark 
        ? { background: 'linear-gradient(160deg, #060c10 0%, #0a1018 50%, #071020 100%)' }
        : { background: 'linear-gradient(180deg, #f9fafb 0%, #ffffff 50%, #f3f4f6 100%)' }
      }
    >
      {isDark && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-0 left-1/3 w-96 h-96 bg-emerald-900/8 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-900/6 rounded-full blur-3xl" />
        </div>
      )}

      <TeacherSidebar
        userId={userId}
        fullName={fullName}
        pendingCount={pendingCount}
        unreadNotifications={unreadNotifications}
      />

      <main className="relative z-10 flex-1 overflow-y-auto lg:ml-0">
        <div className="min-h-full p-4 sm:p-6 lg:p-8 pt-16 lg:pt-6">
          {children}
        </div>
      </main>

      <Toaster
        position="top-right"
        toastOptions={{
          style: isDark 
            ? {
                background: 'rgba(7,12,16,0.96)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                backdropFilter: 'blur(20px)',
              }
            : {
                background: '#fff',
                border: '1px solid #e5e7eb',
                color: '#111827',
              },
        }}
      />
    </div>
  )
}