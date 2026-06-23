import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import {
  Palette, Users, Star, Sparkles, Package,
  ChevronRight, Shield, Zap, Instagram,
} from 'lucide-react'
import { supabase, type Workshop } from '@art-workshop/shared'
import Navbar from '../components/ui/Navbar'
import Footer from '../components/ui/Footer'
import WaveIllustration from '../components/ui/WaveIllustration'
import WorkshopCard from '../components/ui/WorkshopCard'

/* ─── Count-up hook ──────────────────────────────────────────────── */
function useCountUp(end: number, duration = 1600, trigger = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!trigger) return
    let current = 0
    const increment = end / (duration / 16)
    const timer = setInterval(() => {
      current = Math.min(current + increment, end)
      setCount(current)
      if (current >= end) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [end, duration, trigger])
  return count
}

/* ─── Stat Item ──────────────────────────────────────────────────── */
interface StatDef {
  end: number
  suffix: string
  label: string
  decimal?: boolean
}

function StatItem({ end, suffix, label, decimal, delay }: StatDef & { delay: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const raw = useCountUp(decimal ? end * 10 : end, 1600, inView)
  const display = decimal ? (raw / 10).toFixed(1) : Math.floor(raw).toString()

  return (
    <motion.div
      ref={ref}
      className="flex flex-col items-center text-center"
      initial={{ opacity: 0, y: 24, scale: 0.88 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, delay, type: 'spring', stiffness: 120 }}
    >
      <div className="font-display font-bold text-white" style={{ fontSize: 'clamp(2.2rem, 4vw, 3rem)' }}>
        {display}{suffix}
      </div>
      <div className="font-body text-sm text-white/55 mt-1">{label}</div>
    </motion.div>
  )
}

/* ─── Benefit Card ───────────────────────────────────────────────── */
interface BenefitDef {
  Icon: React.ElementType
  title: string
  desc: string
}

function BenefitCard({ Icon, title, desc, delay }: BenefitDef & { delay: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <motion.div
      ref={ref}
      className="bg-white rounded-2xl p-6 border border-gray-100 relative overflow-hidden group"
      initial={{ opacity: 0, y: 36, scale: 0.96 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      whileHover={{
        y: -6,
        boxShadow: '0 24px 48px rgba(76,160,194,0.2)',
        borderColor: '#4CA0C2',
      }}
    >
      {/* Hover shimmer */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500"
        style={{ background: 'linear-gradient(135deg, rgba(76,160,194,0.06) 0%, transparent 60%)' }}
      />
      <motion.div
        className="w-12 h-12 rounded-xl bg-light flex items-center justify-center text-ocean mb-4"
        whileHover={{ scale: 1.1, rotate: 6 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <Icon size={22} />
      </motion.div>
      <h3 className="font-display font-bold text-navy text-lg mb-2">{title}</h3>
      <p className="font-body text-sm text-navy/55 leading-relaxed">{desc}</p>
    </motion.div>
  )
}


/* ─── Page ───────────────────────────────────────────────────────── */
const BENEFITS: BenefitDef[] = [
  { Icon: Palette,  title: 'Express Freely',   desc: 'Sessions led by practicing professional artists with years of teaching and creative experience.' },
  { Icon: Users,    title: 'Connect Deeply',   desc: 'Every participant gets personal attention, feedback, and guidance from the artist.' },
  { Icon: Star,     title: 'Experience Art',   desc: "No experience required. Whether it's your first brushstroke or your hundredth, you belong here." },
  { Icon: Sparkles, title: 'Resonate Within',  desc: 'All art supplies are provided. Just bring your curiosity — canvas, paints, and brushes await.' },
  { Icon: Package,  title: 'Heal Through Art', desc: "Every piece you create is yours to keep. Leave with finished artwork you're genuinely proud of." },
]

const STATS: StatDef[] = [
  { end: 50,  suffix: '+', label: 'Artists Joined' },
  { end: 15,  suffix: '+', label: 'Workshops Held' },
  { end: 4.9, suffix: '★', label: 'Average Rating', decimal: true },
]


export default function LandingPage() {
  const navigate = useNavigate()
  const [workshops, setWorkshops] = useState<Workshop[]>([])

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('workshops')
        .select('*')
        .eq('is_active', true)
        .order('date', { ascending: true })
      setWorkshops(data ?? [])
    }

    load()

    // Real-time: any change in admin (create/update/delete) refreshes the list instantly
    const channel = supabase
      .channel('workshops-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workshops' }, load)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return (
    <div className="bg-background font-body">
      <Navbar />
      <div className="pt-16">

        {/* ═══════════════════════════════════════════════════════
            HERO
        ═══════════════════════════════════════════════════════ */}
        <section
          className="relative min-h-[100vh] flex items-center overflow-hidden"
          style={{
            backgroundImage: "url('/hero-wave.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center right',
          }}
        >
          {/* Left-side cream fade so text stays readable */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(to right, rgba(247,243,232,0.92) 0%, rgba(247,243,232,0.75) 45%, rgba(247,243,232,0.1) 75%, rgba(247,243,232,0) 100%)',
            }}
          />

          {/* Floating particles */}
          {[
            { x: '15%', y: '20%', size: 8, delay: 0, duration: 7 },
            { x: '8%',  y: '65%', size: 5, delay: 1.5, duration: 9 },
            { x: '25%', y: '78%', size: 6, delay: 0.8, duration: 8 },
            { x: '42%', y: '15%', size: 4, delay: 2, duration: 6 },
            { x: '38%', y: '88%', size: 7, delay: 0.3, duration: 10 },
          ].map((p, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full pointer-events-none"
              style={{ left: p.x, top: p.y, width: p.size, height: p.size, background: i % 2 === 0 ? '#4CA0C2' : '#16537E', opacity: 0.25 }}
              animate={{ y: [0, -18, 0], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full relative z-10">
            <div className="max-w-xl">

              {/* Eyebrow */}
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-light/80 border border-accent/30 rounded-full mb-8 backdrop-blur-sm"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="font-body text-xs font-semibold text-ocean uppercase tracking-wider">
                  Art Workshops · Hyderabad
                </span>
              </motion.div>

              {/* Stagger headline */}
              <div className="mb-8">
                {['Create.', 'Connect.', 'Resonate.'].map((word, i) => (
                  <motion.h1
                    key={word}
                    className={`font-display font-bold leading-tight ${i === 1 ? 'text-ocean' : 'text-navy'}`}
                    style={{ fontSize: 'clamp(3.2rem, 6.5vw, 5.2rem)' }}
                    initial={{ opacity: 0, y: 32 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.65, delay: 0.2 + i * 0.4 }}
                  >
                    {word}
                  </motion.h1>
                ))}
              </div>

              <motion.div
                className="mb-10 space-y-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.4 }}
              >
                <p className="font-display italic text-xl md:text-2xl text-navy/85 leading-snug">
                  "Art is the{' '}
                  <span className="text-ocean not-italic font-semibold">wave</span>
                  {' '}that connects us all."
                </p>
                <p className="font-body text-[15px] text-navy/55 leading-relaxed">
                  Join our creative workshops and be part of something truly meaningful.
                </p>
              </motion.div>

              {/* CTA buttons */}
              <motion.div
                className="flex flex-wrap gap-4 mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.7 }}
              >
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/register')}
                  className="flex items-center gap-2 bg-[#0D2B45] text-white px-8 py-4 rounded-xl font-body font-semibold text-[15px] hover:bg-[#16537E] transition-colors shadow-[0_6px_24px_rgba(13,43,69,0.30)]"
                >
                  Register Now <ChevronRight size={18} />
                </motion.button>
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  href="#workshops"
                  className="flex items-center gap-2 border-2 border-navy/25 text-navy bg-white/40 backdrop-blur-sm px-8 py-4 rounded-xl font-body font-medium text-[15px] hover:border-ocean hover:text-ocean transition-all"
                >
                  Explore Workshops
                </motion.a>
              </motion.div>

              {/* Trust row */}
              <motion.div
                className="flex flex-wrap gap-5 pt-6 border-t border-navy/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.0 }}
              >
                {[
                  { icon: <Shield size={13} />, text: 'Secure Razorpay payment' },
                  { icon: <Zap size={13} />,    text: 'Instant pass on booking' },
                  { icon: <Star size={13} />,   text: '4.9★ average rating' },
                ].map(({ icon, text }) => (
                  <div key={text} className="flex items-center gap-1.5 font-body text-xs text-navy/45">
                    <span className="text-accent">{icon}</span>
                    {text}
                  </div>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 z-10 cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.4 }}
            onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <span className="font-body text-[10px] text-navy/30 uppercase tracking-widest">Scroll</span>
            <motion.div
              className="w-5 h-8 rounded-full border-2 border-navy/20 flex items-start justify-center pt-1.5"
              animate={{ borderColor: ['rgba(13,43,69,0.2)', 'rgba(76,160,194,0.5)', 'rgba(13,43,69,0.2)'] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div
                className="w-1 h-1.5 rounded-full bg-ocean"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              />
            </motion.div>
          </motion.div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            STATS BAR
        ═══════════════════════════════════════════════════════ */}
        <section className="py-14" style={{ background: '#0D2B45' }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {STATS.map((s, i) => (
                <StatItem key={s.label} {...s} delay={i * 0.1} />
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            BENEFITS
        ═══════════════════════════════════════════════════════ */}
        <section
          id="about"
          className="relative py-24 overflow-hidden"
          style={{
            backgroundImage: "url('/bg-art-palette.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center right',
          }}
        >
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(247,243,232,0.88)' }} />
          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-14"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-4 py-1.5 bg-light text-ocean text-xs font-body font-semibold uppercase tracking-wider rounded-full mb-4">
                Why ReSoLArt
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-navy mb-4">
                Everything you need to create
              </h2>
              <p className="font-body text-navy/55 max-w-xl mx-auto leading-relaxed">
                We handle the details so you can focus entirely on making art and enjoying the experience.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {BENEFITS.map((b, i) => (
                <BenefitCard key={b.title} {...b} delay={i * 0.08} />
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            WORKSHOPS
        ═══════════════════════════════════════════════════════ */}
        <section id="workshops" className="bg-white py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-4 py-1.5 bg-light text-ocean text-xs font-body font-semibold uppercase tracking-wider rounded-full mb-4">
                Upcoming Events
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-navy mb-3">
                Current Workshops
              </h2>
              <p className="font-body text-sm text-navy/45 max-w-md mx-auto">
                Each workshop is a unique creative journey — find the one that calls to you.
              </p>
            </motion.div>

            {workshops.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-light flex items-center justify-center mx-auto mb-5">
                  <Palette size={26} className="text-accent" />
                </div>
                <p className="font-display text-xl font-bold text-navy mb-2">New workshops coming soon</p>
                <p className="font-body text-sm text-navy/45">Follow us on Instagram to be the first to know.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {workshops.map((w, i) => (
                  <WorkshopCard key={w.id} workshop={w} index={i} />
                ))}
              </div>
            )}
          </div>
        </section>


        {/* ═══════════════════════════════════════════════════════
            BIG CTA
        ═══════════════════════════════════════════════════════ */}
        <section
          className="py-24 relative overflow-hidden"
          style={{
            backgroundImage: "url('/bg-wave-swirl.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Dark navy overlay */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(13,43,69,0.82)' }} />

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1.5 bg-white/10 text-white/80 text-xs font-body font-semibold uppercase tracking-wider rounded-full mb-6">
                Stay in the Loop
              </span>
              <h2
                className="font-display font-bold text-white mb-5 leading-tight"
                style={{ fontSize: 'clamp(2rem, 4.5vw, 3.2rem)' }}
              >
                Want to know when the next workshop drops?
              </h2>
              <p className="font-body text-white/60 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
                Follow us on Instagram to get first access to new workshops, behind-the-scenes moments, and community updates.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.a
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  href="https://www.instagram.com/resolart.co?igsh=MWVzMDFlNTFtNTZseA=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 bg-white text-navy px-10 py-4 rounded-xl font-body font-bold text-[15px] hover:bg-light transition-colors shadow-xl"
                >
                  <Instagram size={18} /> Follow @resolart.co
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  href="#workshops"
                  className="flex items-center justify-center gap-2 border-2 border-white/25 text-white px-10 py-4 rounded-xl font-body font-medium text-[15px] hover:bg-white/8 transition-all"
                >
                  Browse Workshops
                </motion.a>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  )
}
