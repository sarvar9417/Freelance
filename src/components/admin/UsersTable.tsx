'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Filter, ChevronDown, Trash2, Shield,
  GraduationCap, BookOpen, AlertTriangle, X, Check, Loader2,
} from 'lucide-react'
import { changeUserRole, deleteUser } from '@/app/(dashboard)/admin/actions'
import type { UserProfile } from '@/types'

type RoleFilter = 'all' | 'student' | 'teacher' | 'admin'

const ROLE_LABELS: Record<string, string> = {
  student: "O'quvchi",
  teacher: "O'qituvchi",
  admin: 'Admin',
}

const ROLE_COLORS: Record<string, string> = {
  student: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  teacher: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  admin: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
}

const ROLE_ICONS: Record<string, React.ElementType> = {
  student: GraduationCap,
  teacher: BookOpen,
  admin: Shield,
}

interface RoleModalProps {
  user: UserProfile
  onClose: () => void
  onConfirm: (role: 'student' | 'teacher' | 'admin') => void
  loading: boolean
}

function RoleModal({ user, onClose, onConfirm, loading }: RoleModalProps) {
  const roles: Array<'student' | 'teacher' | 'admin'> = ['student', 'teacher', 'admin']

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="rounded-2xl p-6 w-full max-w-sm"
        style={{ background: '#10141f', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-semibold">Rolni o&apos;zgartirish</h3>
          <button onClick={onClose} className="text-white/30 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-white/50 text-sm mb-5">
          <span className="text-white font-medium">{user.full_name}</span> foydalanuvchisi uchun yangi rolni tanlang
        </p>
        <div className="space-y-2">
          {roles.map(role => {
            const Icon = ROLE_ICONS[role]
            const isActive = user.role === role
            return (
              <button
                key={role}
                onClick={() => !isActive && onConfirm(role)}
                disabled={isActive || loading}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 border ${
                  isActive
                    ? ROLE_COLORS[role] + ' cursor-default'
                    : 'text-white/50 border-white/5 hover:bg-white/5 hover:text-white disabled:opacity-50'
                }`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1 text-left">{ROLE_LABELS[role]}</span>
                {isActive && <Check className="h-4 w-4" />}
                {loading && !isActive && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              </button>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}

interface DeleteModalProps {
  user: UserProfile
  onClose: () => void
  onConfirm: () => void
  loading: boolean
}

function DeleteModal({ user, onClose, onConfirm, loading }: DeleteModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="rounded-2xl p-6 w-full max-w-sm"
        style={{ background: '#10141f', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-red-500/10">
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <h3 className="text-white font-semibold">Foydalanuvchini o&apos;chirish</h3>
        </div>
        <p className="text-white/50 text-sm mb-6">
          <span className="text-white font-medium">{user.full_name}</span> foydalanuvchisini o&apos;chirishni tasdiqlaysizmi?
          Bu amal qaytarib bo&apos;lmaydi.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all border border-white/5"
          >
            Bekor qilish
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-red-500/80 hover:bg-red-500 text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            O&apos;chirish
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

interface Props {
  users: UserProfile[]
}

export default function UsersTable({ users: initialUsers }: Props) {
  const [users, setUsers] = useState(initialUsers)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [roleModal, setRoleModal] = useState<UserProfile | null>(null)
  const [deleteModal, setDeleteModal] = useState<UserProfile | null>(null)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const filtered = users.filter(u => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === 'all' || u.role === roleFilter
    return matchesSearch && matchesRole
  })

  const handleRoleChange = (role: 'student' | 'teacher' | 'admin') => {
    if (!roleModal) return
    const userId = roleModal.id
    setError('')

    startTransition(async () => {
      const result = await changeUserRole(userId, role)
      if (result.error) {
        setError(result.error)
      } else {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u))
        setRoleModal(null)
      }
    })
  }

  const handleDelete = () => {
    if (!deleteModal) return
    const userId = deleteModal.id
    setError('')

    startTransition(async () => {
      const result = await deleteUser(userId)
      if (result.error) {
        setError(result.error)
      } else {
        setUsers(prev => prev.filter(u => u.id !== userId))
        setDeleteModal(null)
      }
    })
  }

  return (
    <>
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <input
            type="text"
            placeholder="Ism yoki email bo'yicha qidirish..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/30 outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value as RoleFilter)}
            className="pl-9 pr-8 py-2.5 rounded-xl text-sm text-white outline-none appearance-none cursor-pointer focus:ring-1 focus:ring-purple-500/50 transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <option value="all" className="bg-[#10141f]">Barcha rollar</option>
            <option value="student" className="bg-[#10141f]">O&apos;quvchi</option>
            <option value="teacher" className="bg-[#10141f]">O&apos;qituvchi</option>
            <option value="admin" className="bg-[#10141f]">Admin</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Jadval */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <th className="text-left text-xs font-medium text-white/40 px-4 py-3">Foydalanuvchi</th>
                <th className="text-left text-xs font-medium text-white/40 px-4 py-3 hidden sm:table-cell">Email</th>
                <th className="text-left text-xs font-medium text-white/40 px-4 py-3">Rol</th>
                <th className="text-left text-xs font-medium text-white/40 px-4 py-3 hidden md:table-cell">Sana</th>
                <th className="text-right text-xs font-medium text-white/40 px-4 py-3">Amallar</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-white/30 text-sm">
                      Foydalanuvchilar topilmadi
                    </td>
                  </tr>
                ) : (
                  filtered.map((user, i) => {
                    const initials = user.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
                    const RoleIcon = ROLE_ICONS[user.role] || GraduationCap
                    return (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: i * 0.03 }}
                        className="transition-colors hover:bg-white/[0.02]"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      >
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-br from-purple-500/40 to-blue-600/40 h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                              {initials}
                            </div>
                            <span className="text-white text-sm font-medium truncate max-w-[120px]">
                              {user.full_name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 hidden sm:table-cell">
                          <span className="text-white/50 text-sm truncate">{user.email}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${ROLE_COLORS[user.role] || ''}`}>
                            <RoleIcon className="h-3 w-3" />
                            {ROLE_LABELS[user.role] || user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 hidden md:table-cell">
                          <span className="text-white/30 text-sm">
                            {new Date(user.created_at).toLocaleDateString('uz-UZ', {
                              year: 'numeric', month: 'short', day: 'numeric',
                            })}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setRoleModal(user)}
                              title="Rolni o'zgartirish"
                              className="p-1.5 rounded-lg text-white/30 hover:text-purple-400 hover:bg-purple-500/10 transition-all"
                            >
                              <Shield className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteModal(user)}
                              title="O'chirish"
                              className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <span className="text-white/30 text-xs">
            Jami: <span className="text-white/50 font-medium">{filtered.length}</span> foydalanuvchi
          </span>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {roleModal && (
          <RoleModal
            user={roleModal}
            onClose={() => setRoleModal(null)}
            onConfirm={handleRoleChange}
            loading={isPending}
          />
        )}
        {deleteModal && (
          <DeleteModal
            user={deleteModal}
            onClose={() => setDeleteModal(null)}
            onConfirm={handleDelete}
            loading={isPending}
          />
        )}
      </AnimatePresence>
    </>
  )
}
