import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { label: 'Home',      href: '/' },
  { label: 'About',     href: '/#about' },
  { label: 'Workshops', href: '/#workshops' },
  { label: 'Register',  href: '/register' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    if (href.startsWith('/#')) {
      e.preventDefault()
      const id = href.replace('/#', '')
      if (location.pathname === '/') {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      } else {
        navigate('/')
        setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 100)
      }
      setOpen(false)
    }
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md'
          : 'bg-white shadow-sm'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src="/Screenshot_2026-06-12_023905-removebg-preview.png" alt="ReSoLArt.co" className="h-10 w-auto" />
          <span className="font-display font-bold text-navy text-xl leading-none">ReSoLArt.co</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(({ label, href }) => {
            const isHash = href.startsWith('/#')
            const active = href === '/' ? location.pathname === '/' && !location.hash : false
            return (
              <a
                key={label}
                href={href}
                onClick={(e) => handleNavClick(e, href)}
                className={`font-body font-medium text-sm transition-colors relative group cursor-pointer ${
                  active ? 'text-navy' : 'text-navy/55 hover:text-navy'
                } ${isHash ? '' : ''}`}
              >
                {label}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-navy rounded-full transition-all duration-300 ${
                    active ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </a>
            )
          })}
        </div>

        {/* Register CTA */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="hidden md:block"
        >
          <Link
            to="/register"
            className="bg-[#0D2B45] text-white px-5 py-2 rounded-lg font-body font-medium text-sm hover:bg-[#16537E] transition-colors"
          >
            Register Now
          </Link>
        </motion.div>

        {/* Hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-navy hover:bg-background transition-colors"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="md:hidden absolute top-16 left-0 right-0 bg-white border-t border-gray-100 shadow-lg px-4 py-3"
          >
            {navLinks.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                onClick={(e) => handleNavClick(e, href)}
                className="flex items-center py-3 px-2 font-body text-sm text-navy/70 hover:text-navy border-b border-gray-50 last:border-0 transition-colors cursor-pointer"
              >
                {label}
              </a>
            ))}
            <Link
              to="/register"
              onClick={() => setOpen(false)}
              className="mt-3 flex items-center justify-center py-3 bg-[#0D2B45] text-white text-sm font-body font-medium rounded-xl hover:bg-[#16537E] transition-colors"
            >
              Register Now
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
