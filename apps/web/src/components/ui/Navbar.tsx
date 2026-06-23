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

/*
  Wave underline — pure CSS approach.

  One SVG period (40 × 4 px) used as a tiling background-image.
  Path: smooth sine curve  M0,2 C7,0 13,0 20,2 C27,4 33,4 40,2
  @keyframes shifts background-position-x by -40px (one period) → seamless loop.
  No preserveAspectRatio distortion, works at any link width.
*/
const WAVE_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='4' viewBox='0 0 40 4'%3E%3Cpath d='M0,2 C7,0 13,0 20,2 C27,4 33,4 40,2' fill='none' stroke='%2316537E' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('/')
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (location.pathname !== '/') {
      setActiveSection(location.pathname)
      return
    }

    setActiveSection('/')

    const onScroll = () => {
      if (window.scrollY < 80) { setActiveSection('/'); return }
      for (const id of ['workshops', 'about']) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= 96) {
          setActiveSection(`/#${id}`)
          return
        }
      }
      setActiveSection('/')
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [location.pathname])

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
    <>
      {/* CSS keyframe — defined once, scoped to this component */}
      <style>{`
        @keyframes nav-wave-flow {
          from { background-position-x: 0; }
          to   { background-position-x: -40px; }
        }
      `}</style>

      <nav
        className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300 ${
          scrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white shadow-sm'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img
              src="/Screenshot_2026-06-12_023905-removebg-preview.png"
              alt="ReSoLArt.co"
              className="h-10 w-auto"
            />
            <span className="font-display font-bold text-navy text-xl leading-none">
              ReSoLArt.co
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(({ label, href }) => {
              const active = href === activeSection
              return (
                <a
                  key={label}
                  href={href}
                  onClick={(e) => handleNavClick(e, href)}
                  className={`font-body font-medium text-sm transition-colors relative group cursor-pointer pb-2 ${
                    active ? 'text-navy' : 'text-navy/55 hover:text-navy'
                  }`}
                >
                  {label}

                  {/* Flowing water wave (active) */}
                  <AnimatePresence>
                    {active && (
                      <motion.span
                        key="wave"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="absolute bottom-0 left-0 right-0 pointer-events-none"
                        style={{
                          height: 4,
                          backgroundImage: WAVE_BG,
                          backgroundRepeat: 'repeat-x',
                          backgroundSize: '40px 4px',
                          backgroundPosition: '0 center',
                          animation: 'nav-wave-flow 1.2s linear infinite',
                        }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Hover line (inactive) */}
                  {!active && (
                    <span className="absolute bottom-0 left-0 h-0.5 bg-navy/20 rounded-full w-0 group-hover:w-full transition-all duration-200" />
                  )}
                </a>
              )
            })}
          </div>

          {/* Register CTA */}
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="hidden md:block">
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
              {navLinks.map(({ label, href }) => {
                const active = href === activeSection
                return (
                  <a
                    key={label}
                    href={href}
                    onClick={(e) => handleNavClick(e, href)}
                    className={`flex items-center py-3 px-2 font-body text-sm border-b border-gray-50 last:border-0 transition-colors cursor-pointer ${
                      active ? 'text-navy font-semibold' : 'text-navy/70 hover:text-navy'
                    }`}
                  >
                    {label}
                  </a>
                )
              })}
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
    </>
  )
}
