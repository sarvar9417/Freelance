'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { GraduationCap, Heart, Tv, Share2, Send, Globe } from 'lucide-react'

const LINKS = {
  platform: [
    { label: 'Kurslar',       href: '/courses'    },
    { label: 'Forum',         href: '/forum'       },
    { label: 'Motivatsiya',   href: '/motivation'  },
    { label: 'Platformalar',  href: '/platforms'   },
  ],
  platforms: [
    { label: 'Upwork qo\'llanma',       href: '/platforms' },
    { label: 'Fiverr qo\'llanma',       href: '/platforms' },
    { label: 'Kwork qo\'llanma',        href: '/platforms' },
    { label: 'Freelancer.com qo\'llanma', href: '/platforms' },
  ],
  account: [
    { label: "Ro'yxatdan o'tish", href: '/register' },
    { label: 'Kirish',            href: '/login'    },
    { label: "O'qituvchi bo'lish",href: '/register' },
    { label: 'Admin panel',       href: '/admin'    },
  ],
}

const SOCIALS = [
  { icon: Tv,     label: 'YouTube',   href: '#' },
  { icon: Send,   label: 'Telegram',  href: '#' },
  { icon: Share2, label: 'Instagram', href: '#' },
  { icon: Globe,  label: 'Web',       href: '#' },
]

export default function Footer() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <footer className={`relative border-t pt-16 pb-8 ${
      isDark ? 'border-white/5 bg-[#0B0F19]' : 'border-gray-200 bg-white'
    }`}>
      {/* Subtle glow */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px ${
        isDark ? 'bg-gradient-to-r from-transparent via-blue-500/40 to-transparent' : 'bg-gradient-to-r from-transparent via-blue-500/20 to-transparent'
      }`} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-10 mb-14">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className={`p-1.5 rounded-lg ${
                isDark
                  ? 'bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-900/40'
                  : 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/20'
              }`}>
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Freelancer<span className="text-blue-600">School</span>
              </span>
            </Link>
            <p className={`text-sm leading-relaxed max-w-xs mb-6 ${
              isDark ? 'text-white/40' : 'text-gray-500'
            }`}>
              O&apos;zbekiston yoshlari uchun bepul freelancerlik ta&apos;lim platformasi.
              Noldan professional darajagacha — sertifikat bilan.
            </p>
            <div className="flex gap-2.5">
              {SOCIALS.map(({ icon: Icon, label, href }) => (
                <motion.a
                  key={label}
                  href={href}
                  whileHover={{ y: -3, scale: 1.1 }}
                  transition={{ duration: 0.15 }}
                  aria-label={label}
                  className={`h-9 w-9 rounded-xl flex items-center justify-center transition-colors ${
                    isDark
                      ? 'glass text-white/40 hover:text-white'
                      : 'bg-gray-100 text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            { title: 'Platforma', links: LINKS.platform },
            { title: 'Platformalar', links: LINKS.platforms },
            { title: 'Hisob', links: LINKS.account },
          ].map(({ title, links }) => (
            <div key={title}>
              <p className={`font-semibold text-sm mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</p>
              <ul className="space-y-3">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className={`text-sm transition-colors duration-200 ${
                        isDark
                          ? 'text-white/40 hover:text-white'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className={`border-t pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 ${
          isDark ? 'border-white/5' : 'border-gray-200'
        }`}>
          <p className={`text-sm ${isDark ? 'text-white/25' : 'text-gray-400'}`}>
            © 2024 Freelancer School. Barcha huquqlar himoyalangan.
          </p>
          <p className={`text-sm flex items-center gap-1.5 ${isDark ? 'text-white/25' : 'text-gray-400'}`}>
            O&apos;zbekiston yoshlari uchun
            <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
            bilan yaratildi
          </p>
        </div>
      </div>
    </footer>
  )
}