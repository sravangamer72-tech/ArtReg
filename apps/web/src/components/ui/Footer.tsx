import { Link } from 'react-router-dom'
import { Instagram, Linkedin, Mail, MapPin, Phone } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="relative" style={{ background: '#0D2B45' }}>
      {/* Wave top */}
      <div className="overflow-hidden leading-none -mb-px">
        <svg
          viewBox="0 0 1440 64"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full block"
          preserveAspectRatio="none"
          style={{ height: 64 }}
        >
          <rect width="1440" height="30" fill="#F7F3E8" />
          <path
            d="M0,30 C200,60 400,10 600,35 C800,60 1000,15 1200,35 C1300,45 1380,28 1440,32 L1440,64 L0,64 Z"
            fill="#0D2B45"
          />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">

          {/* Brand */}
          <div className="md:col-span-5">
            <div className="flex items-end gap-3 mb-5">
              <img src="/Screenshot_2026-06-12_023905-removebg-preview.png" alt="ReSoLArt.co" className="h-10 w-auto brightness-0 invert mb-1" />
              <div>
                <p className="font-display font-bold text-white text-lg leading-none">ReSoLArt.co</p>
                <p className="font-body text-[10px] text-white/40 tracking-widest mt-0.5 uppercase">
                  create • connect • resonate
                </p>
              </div>
            </div>
            <p className="font-body text-sm text-white/45 leading-relaxed max-w-xs mb-5">
              A creative community where artists of all levels come together to express, learn, and connect through the joy of making art.
            </p>
            <div className="space-y-2">
              <a href="mailto:resolart47@gmail.com" className="flex items-center gap-2 font-body text-xs text-white/35 hover:text-accent transition-colors">
                <Mail size={13} /> resolart47@gmail.com
              </a>
              <a href="tel:9121352046" className="flex items-center gap-2 font-body text-xs text-white/35 hover:text-accent transition-colors">
                <Phone size={13} /> 9121352046
              </a>
              <p className="flex items-center gap-2 font-body text-xs text-white/35">
                <MapPin size={13} /> Hyderabad, Telangana
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3">
            <h4 className="font-body font-semibold text-white text-xs uppercase tracking-widest mb-5">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'About Us',     href: '/#about' },
                { label: 'Workshops',    href: '/#workshops' },
                { label: 'Register',     href: '/register' },
                { label: 'Contact Us',   href: '/#about' },
                { label: 'FAQ',          href: '/#about' },
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
            <h4 className="font-body font-semibold text-white text-xs uppercase tracking-widest mb-5">
              Follow Us
            </h4>
            <div className="flex gap-3 mb-6">
              <a
                href="https://www.instagram.com/resolart.co?igsh=MWVzMDFlNTFtNTZseA=="
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-xl border border-white/15 flex items-center justify-center text-white/50 hover:text-white hover:border-accent hover:bg-accent/10 transition-all"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://www.linkedin.com/company/resolart-co/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-10 h-10 rounded-xl border border-white/15 flex items-center justify-center text-white/50 hover:text-white hover:border-accent hover:bg-accent/10 transition-all"
              >
                <Linkedin size={18} />
              </a>
            </div>
            <p className="font-body text-xs text-white/35 leading-relaxed">
              Follow us for workshop updates, creative inspiration, and community highlights.
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-body text-xs text-white/25">
            © 2025 ReSoLArt.co. All rights reserved.
          </p>
          <div className="flex gap-5">
            <a href="#" className="font-body text-xs text-white/25 hover:text-white/50 transition-colors">Privacy Policy</a>
            <a href="#" className="font-body text-xs text-white/25 hover:text-white/50 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
