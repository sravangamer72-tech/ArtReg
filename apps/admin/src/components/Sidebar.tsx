import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CreditCard,
  ScanLine,
  X,
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navItems = [
  { path: '/dashboard',     label: 'Dashboard',     icon: LayoutDashboard },
  { path: '/registrations', label: 'Registrations', icon: Users },
  { path: '/workshops',     label: 'Workshops',     icon: BookOpen },
  { path: '/payments',      label: 'Payments',      icon: CreditCard },
  { path: '/checkin',       label: 'Check-ins',     icon: ScanLine },
]

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const content = (
    <div className="flex flex-col h-full" style={{ background: '#0D2B45' }}>
      {/* Brand */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <img
            src="/Screenshot_2026-06-12_023905-removebg-preview.png"
            alt="ReSoLArt.co"
            className="h-10 w-auto"
            style={{ filter: 'drop-shadow(0 0 6px rgba(76,160,194,0.6))' }}
          />
          <div>
            <p className="font-display font-bold text-white text-base leading-none">
              ReSoLArt.co
            </p>
            <p className="font-body text-[10px] text-white/40 mt-0.5">Admin Panel</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        <p className="px-3 mb-3 font-body text-[10px] font-semibold text-white/30 uppercase tracking-widest">
          Menu
        </p>
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-body font-medium transition-all ${
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:bg-white/8 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={17}
                  className={`shrink-0 ${isActive ? 'text-accent' : 'text-white/40'}`}
                />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

    </div>
  )

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-64 z-30">
        {content}
      </aside>

      {/* Mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            key="mobile-sidebar"
            initial={{ x: -256 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
            transition={{ type: 'tween', duration: 0.22 }}
            className="lg:hidden fixed inset-y-0 left-0 w-64 z-40 flex flex-col"
          >
            {content}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}
