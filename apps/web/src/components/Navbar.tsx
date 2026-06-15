import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/#about' },
  { label: 'Workshops', href: '/#workshops' },
  { label: 'Register', href: '/register' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-[0_1px_16px_rgba(13,43,69,0.08)]'
          : 'bg-white border-b border-gray-100'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-18 flex items-center justify-between" style={{ height: 72 }}>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <img
              src="/logo.png"
              alt="ReSoLArt.co"
              className="h-10 w-auto transition-transform duration-300 group-hover:scale-105"
            />
            <div className="leading-tight">
              <div className="font-display font-bold text-navy text-[1.1rem] leading-none tracking-tight">
                ReSoLArt.co
              </div>
              <div className="font-body text-[9px] text-accent/80 tracking-[0.15em] mt-0.5 uppercase">
                create • connect • resonate
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ label, href }) => {
              const active =
                href === '/'
                  ? location.pathname === '/'
                  : location.pathname === href || location.pathname.startsWith(href.replace('/#', '/'))
              return (
                <Link
                  key={label}
                  to={href}
                  className={`relative px-4 py-2 font-body text-sm font-medium rounded-lg transition-colors duration-200 ${
                    active ? 'text-ocean' : 'text-navy/70 hover:text-navy hover:bg-background'
                  }`}
                >
                  {label}
                  {active && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-4 right-4 h-0.5 bg-ocean rounded-full"
                    />
                  )}
                </Link>
              )
            })}

          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-navy hover:bg-background transition-colors"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="md:hidden bg-white border-t border-gray-100 px-4 pt-2 pb-5 space-y-0.5"
          >
            {navLinks.map(({ label, href }) => (
              <Link
                key={label}
                to={href}
                onClick={() => setOpen(false)}
                className="flex items-center py-3 px-2 font-body text-sm text-navy/75 hover:text-ocean border-b border-gray-50 last:border-0 transition-colors"
              >
                {label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
