'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, BellRing, CheckCheck, X } from 'lucide-react'
import { toast } from 'sonner'
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  subscribeToNotifications,
  formatNotificationTime,
  type Notification,
} from '@/lib/supabase/notifications'

const TYPE_ICONS: Record<string, string> = {
  new_enrollment:       '🎓',
  new_submission:       '📥',
  submission_graded:    '✅',
  submission_revision:  '🔄',
  course_completed:     '🏆',
  new_course:           '📚',
  level_up:             '⚡',
  streak:               '🔥',
}

interface Props {
  userId: string
  initialUnread?: number
  variant?: 'student' | 'teacher'
}

export default function NotificationBell({ userId, initialUnread = 0, variant = 'student' }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unread, setUnread] = useState(initialUnread)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const accentColor = variant === 'teacher' ? 'emerald' : 'blue'

  const loadNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchNotifications(userId, 25)
      setNotifications(data)
      setUnread(data.filter(n => !n.is_read).length)
    } finally {
      setLoading(false)
    }
  }, [userId])

  // Ochilganda yuklash
  useEffect(() => {
    if (open) loadNotifications()
  }, [open, loadNotifications])

  // Realtime subscription
  useEffect(() => {
    const channel = subscribeToNotifications(userId, (newNotif) => { // eslint-disable-line react-hooks/exhaustive-deps
      setUnread(prev => prev + 1)
      setNotifications(prev => [newNotif, ...prev])

      // Toast bildirish
      toast(newNotif.title, {
        description: newNotif.message,
        duration: 5000,
        style: {
          background: 'rgba(15,20,40,0.95)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#fff',
          backdropFilter: 'blur(20px)',
        },
        action: newNotif.link
          ? {
              label: 'Ko\'rish',
              onClick: () => {
                router.push(newNotif.link!)
                handleMarkRead(newNotif.id)
              },
            }
          : undefined,
      })
    })

    return () => { channel.unsubscribe() }
  }, [userId])

  // Tashqariga bosilganda yopish
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handleMarkRead = async (id: string) => {
    await markAsRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    setUnread(prev => Math.max(0, prev - 1))
  }

  const handleMarkAll = async () => {
    await markAllAsRead(userId)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnread(0)
  }

  const handleClick = (notif: Notification) => {
    if (!notif.is_read) handleMarkRead(notif.id)
    if (notif.link) {
      router.push(notif.link)
      setOpen(false)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell tugma */}
      <button
        onClick={() => setOpen(v => !v)}
        className="relative flex items-center justify-center h-8 w-8 rounded-xl transition-all hover:bg-white/10"
        aria-label="Bildirishnomalar"
      >
        {unread > 0
          ? <BellRing className="h-4 w-4 text-amber-400 animate-pulse" />
          : <Bell className="h-4 w-4 text-white/40" />
        }
        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-4 min-w-4 px-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none"
          >
            {unread > 99 ? '99+' : unread}
          </motion.span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-2 w-80 z-50 rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background: 'rgba(10,14,28,0.96)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Bell className="h-3.5 w-3.5 text-white/50" />
                <span className="text-white text-sm font-semibold">Bildirishnomalar</span>
                {unread > 0 && (
                  <span className="bg-red-500/80 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {unread}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unread > 0 && (
                  <button
                    onClick={handleMarkAll}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-white/40 hover:text-white hover:bg-white/5 transition-all"
                    title="Barchasini o'qildi deb belgilash"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Barchasi
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-all"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <Bell className="h-8 w-8 text-white/10" />
                  <p className="text-white/30 text-xs">Hozircha bildirishnoma yo&apos;q</p>
                </div>
              ) : (
                <div>
                  {notifications.map((notif) => (
                    <motion.button
                      key={notif.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => handleClick(notif)}
                      className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-all hover:bg-white/5 group ${
                        !notif.is_read ? 'bg-white/[0.03]' : ''
                      }`}
                    >
                      {/* Icon */}
                      <div
                        className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-base"
                        style={{
                          background: notif.is_read
                            ? 'rgba(255,255,255,0.05)'
                            : accentColor === 'emerald'
                              ? 'rgba(16,185,129,0.15)'
                              : 'rgba(59,130,246,0.15)',
                          border: notif.is_read
                            ? '1px solid rgba(255,255,255,0.08)'
                            : accentColor === 'emerald'
                              ? '1px solid rgba(16,185,129,0.2)'
                              : '1px solid rgba(59,130,246,0.2)',
                        }}
                      >
                        {TYPE_ICONS[notif.type] ?? '🔔'}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold leading-tight truncate ${notif.is_read ? 'text-white/50' : 'text-white'}`}>
                          {notif.title}
                        </p>
                        <p className="text-white/40 text-xs mt-0.5 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                        <p className="text-white/20 text-[10px] mt-1">
                          {formatNotificationTime(notif.created_at)}
                        </p>
                      </div>

                      {/* Unread dot */}
                      {!notif.is_read && (
                        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-400 mt-1.5" />
                      )}
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-white/5">
              <button
                onClick={() => {
                  router.push(variant === 'teacher' ? '/teacher' : '/student')
                  setOpen(false)
                }}
                className="text-xs text-white/30 hover:text-white/60 transition-colors w-full text-center"
              >
                Barcha bildirishnomalar →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
