import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, Bell } from 'lucide-react'
import Sidebar from './Sidebar'

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard':     { title: 'Dashboard',     subtitle: 'Overview of registrations and revenue' },
  '/registrations': { title: 'Registrations', subtitle: 'Manage all workshop registrations' },
  '/workshops':     { title: 'Workshops',     subtitle: 'Manage your workshop listings' },
  '/payments':      { title: 'Payments',      subtitle: 'Track payment statuses' },
  '/checkin':       { title: 'Check-in',      subtitle: 'Scan QR codes or search by pass ID' },
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  const page = pageTitles[location.pathname] ?? { title: 'Admin', subtitle: 'ReSoLArt.co Admin Panel' }

  return (
    <div className="flex h-screen bg-background overflow-hidden font-body">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 bg-black/40 z-30 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 lg:ml-64">
        {/* Top bar */}
        <header className="shrink-0 h-16 flex items-center justify-between px-6 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-navy hover:bg-background transition-colors"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="font-display font-bold text-navy text-base leading-none">
                {page.title}
              </h1>
              <p className="font-body text-xs text-navy/40 mt-0.5 hidden sm:block">
                {page.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg text-navy/40 hover:text-navy hover:bg-background transition-colors">
              <Bell size={18} />
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{ background: '#16537E' }}
              >
                A
              </div>
              <p className="font-body text-sm font-medium text-navy hidden sm:block">
                Admin
              </p>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
