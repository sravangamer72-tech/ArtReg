import { Link } from 'react-router-dom'
import { Instagram, Linkedin, Mail, Phone } from 'lucide-react'

export default function Footer() {
  return (
    <footer style={{ background: '#0D2B45' }}>
      {/* Wave top decoration */}
      <div className="overflow-hidden leading-none">
        <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block">
          <path
            d="M0,24 C240,48 480,0 720,24 C960,48 1200,8 1440,24 L1440,48 L0,48 Z"
            fill="#0D2B45"
          />
          <rect width="1440" height="24" fill="white" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">

          {/* Brand — wider column */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-5">
              <img
                src="/logo.png"
                alt="ReSoLArt.co"
                className="h-10 w-auto brightness-0 invert"
              />
              <div>
                <div className="font-display font-bold text-white text-lg leading-none tracking-tight">
                  ReSoLArt.co
                </div>
                <div className="font-body text-[9px] text-accent/70 tracking-[0.15em] uppercase mt-0.5">
                  create • connect • resonate
                </div>
              </div>
            </div>
            <p className="font-body text-sm text-white/50 leading-relaxed max-w-xs mb-6">
              A safe, joyful space to express yourself through art. No experience necessary — just an open heart and curious mind.
            </p>
            <div className="space-y-2">
              <a href="mailto:hello@resolart.co" className="flex items-center gap-2 font-body text-sm text-white/40 hover:text-accent transition-colors">
                <Mail size={14} /> hello@resolart.co
              </a>
              <a href="tel:+919999999999" className="flex items-center gap-2 font-body text-sm text-white/40 hover:text-accent transition-colors">
                <Phone size={14} /> +91 99999 99999
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3">
            <h4 className="font-display font-bold text-white text-sm uppercase tracking-wider mb-5">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'About Us', href: '/#about' },
                { label: 'Workshops', href: '/#workshops' },
                { label: 'Register Now', href: '/register' },
                { label: 'Contact Us', href: '/#about' },
                { label: 'FAQ', href: '/#about' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link
                    to={href}
                    className="font-body text-sm text-white/45 hover:text-accent transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Follow Us */}
          <div className="md:col-span-4">
            <h4 className="font-display font-bold text-white text-sm uppercase tracking-wider mb-5">
              Follow Us
            </h4>
            <div className="flex gap-3 mb-5">
              <a
                href="#"
                className="w-10 h-10 rounded-xl border border-white/15 flex items-center justify-center text-white/50 hover:text-white hover:border-accent hover:bg-accent/10 transition-all"
                aria-label="Instagram"
              >
                <Instagram size={17} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-xl border border-white/15 flex items-center justify-center text-white/50 hover:text-white hover:border-accent hover:bg-accent/10 transition-all"
                aria-label="LinkedIn"
              >
                <Linkedin size={17} />
              </a>
            </div>
            <div
              className="rounded-xl p-4 border border-white/8"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              <p className="font-body text-xs text-white/50 leading-relaxed">
                Follow us for workshop updates, behind-the-scenes creativity, and community highlights.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-body text-xs text-white/30">
            © 2025 ReSoLArt.co. All rights reserved.
          </p>
          <div className="flex gap-5">
            <a href="#" className="font-body text-xs text-white/30 hover:text-white/60 transition-colors">Privacy Policy</a>
            <a href="#" className="font-body text-xs text-white/30 hover:text-white/60 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
