import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  CheckCircle, Download, Home, Sparkles, QrCode,
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import toast from 'react-hot-toast'
import { supabase, generatePassId, type Workshop } from '@art-workshop/shared'
import Navbar from '../components/ui/Navbar'
import ProgressSteps from '../components/ui/ProgressSteps'

/* ─── Validation ─── */
const schema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  workshopId: z.string().min(1, 'No workshop selected'),
})
type FormData = z.infer<typeof schema>

/* ─── UPI config ─── */
const UPI_ID = 'resolart47@oksbi'   // ← update with your UPI ID
const UPI_ORG = 'ReSoLArt.co'

function buildUpiUri(amount: number, note: string) {
  return `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_ORG)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`
}

interface RegistrationResult {
  id: string
  pass_id: string
  full_name: string
  workshop_name: string
  amount: number
}

const MOCK_REGISTRATION: RegistrationResult = {
  id: 'preview-id',
  pass_id: 'RSL-20260001',
  full_name: 'Priya Sharma',
  workshop_name: 'Ocean Soul Painting',
  amount: 1500,
}

const MOCK_WORKSHOP = {
  id: 'preview-ws',
  name: 'Ocean Soul Painting',
  date: '2026-06-28',
  time: '10:00 AM – 1:00 PM',
  venue: 'The Art Loft, Hyderabad',
  price: 1500,
  capacity: 12,
  enrolled: 7,
  is_active: true,
  description: '',
  instructor: '',
  image_url: '',
} as any

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [activeWorkshop, setActiveWorkshop] = useState<Workshop | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [registration, setRegistration] = useState<RegistrationResult | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema), mode: 'onChange' })

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('workshops')
        .select('*')
        .eq('is_active', true)
        .order('date', { ascending: true })
      const list = data ?? []
      setWorkshops(list)
      // Auto-select only if nothing is chosen yet
      setActiveWorkshop(prev => {
        if (prev) return prev
        if (list.length > 0) { setValue('workshopId', list[0].id); return list[0] }
        return null
      })
    }

    load()

    const channel = supabase
      .channel('workshops-register')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workshops' }, load)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [setValue])

  /* ── Step 1 submit ── */
  const onStep1Submit = handleSubmit(async (data) => {
    if (!activeWorkshop) { toast.error('No workshop available'); return }
    setSubmitting(true)
    try {
      const passId = generatePassId()
      const { data: reg, error } = await supabase
        .from('registrations')
        .insert({
          full_name: data.fullName,
          email: data.email,
          phone: data.phone,
          workshop_id: activeWorkshop.id,
          workshop_name: activeWorkshop.name,
          pass_id: passId,
          amount: activeWorkshop.price,
          payment_status: 'pending',
        })
        .select()
        .single()
      if (error) throw error
      setRegistration(reg as RegistrationResult)
      setStep(2)
    } catch {
      toast.error('Could not save registration. Please try again.')
    } finally {
      setSubmitting(false)
    }
  })

  /* ── Step 2: UPI payment confirmed ── */
  const handleUpiPaid = async () => {
    if (!registration) return
    setSubmitting(true)
    try {
      await supabase
        .from('registrations')
        .update({ payment_status: 'pending_verification' })
        .eq('id', registration.id)
      setStep(3)
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (step === 3 && registration) {
    return (
      <div className="min-h-screen font-body">
        <Navbar />
        <div className="pt-16">
          <ConfirmationPage registration={registration} workshop={activeWorkshop} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background font-body">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
          <div className="mb-10">
            <ProgressSteps current={step} />
          </div>
          <div className="bg-white rounded-2xl shadow-card p-8 md:p-10">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="s1"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.22 }}
                >
                  <Step1Form
                    register={register}
                    errors={errors}
                    onSubmit={onStep1Submit}
                    submitting={submitting}
                    workshops={workshops}
                    activeWorkshop={activeWorkshop}
                    onSelectWorkshop={(w) => { setActiveWorkshop(w); setValue('workshopId', w.id) }}
                    onPreview={() => {
                      setRegistration(MOCK_REGISTRATION)
                      setActiveWorkshop(MOCK_WORKSHOP)
                      setStep(3)
                    }}
                  />
                </motion.div>
              )}
              {step === 2 && registration && activeWorkshop && (
                <motion.div
                  key="s2"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.22 }}
                >
                  <Step2Payment
                    registration={registration}
                    workshop={activeWorkshop}
                    onPaid={handleUpiPaid}
                    submitting={submitting}
                    onBack={() => setStep(1)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Step 1 ─── */
function Step1Form({
  register,
  errors,
  onSubmit,
  submitting,
  workshops,
  activeWorkshop,
  onSelectWorkshop,
  onPreview,
}: {
  register: any
  errors: any
  onSubmit: () => void
  submitting: boolean
  workshops: Workshop[]
  activeWorkshop: Workshop | null
  onSelectWorkshop: (w: Workshop) => void
  onPreview: () => void
}) {
  // No workshops available yet
  if (workshops.length === 0) {
    return (
      <div className="text-center py-12">
        <Sparkles size={28} className="text-accent mx-auto mb-4 opacity-50" />
        <p className="font-display text-lg font-bold text-navy mb-1">No workshops available right now</p>
        <p className="font-body text-sm text-navy/45">Check back soon — new sessions are added regularly.</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="font-display text-3xl font-bold text-navy mb-1">Your Details</h2>
      <p className="font-body text-gray-500 text-sm mb-8">Fill in your information to reserve a spot.</p>

      {/* Workshop selector — shown when admin has created multiple active workshops */}
      {workshops.length > 1 ? (
        <div className="mb-7">
          <p className="font-body text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Choose Workshop
          </p>
          <div className="space-y-2">
            {workshops.map((w) => {
              const spotsLeft = w.capacity - w.enrolled
              const selected = activeWorkshop?.id === w.id
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => onSelectWorkshop(w)}
                  disabled={spotsLeft === 0}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all ${
                    selected
                      ? 'border-ocean bg-light ring-2 ring-ocean/20'
                      : spotsLeft === 0
                      ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                      : 'border-gray-200 bg-white hover:border-accent/50 hover:bg-light/50'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                      selected ? 'border-ocean' : 'border-gray-300'
                    }`}
                  >
                    {selected && <div className="w-2 h-2 rounded-full bg-ocean" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm font-semibold text-navy truncate">{w.name}</p>
                    <p className="font-body text-xs text-navy/45">{w.date} · {w.venue}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-body text-sm font-bold text-ocean">₹{w.price.toLocaleString('en-IN')}</p>
                    {spotsLeft === 0 ? (
                      <p className="font-body text-[10px] text-red-400">Full</p>
                    ) : spotsLeft <= 4 ? (
                      <p className="font-body text-[10px] text-amber-500">{spotsLeft} left</p>
                    ) : (
                      <p className="font-body text-[10px] text-navy/30">{spotsLeft} seats</p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        /* Single workshop — show as banner */
        activeWorkshop && (
          <div className="flex items-center gap-3 px-4 py-3 bg-light rounded-xl border border-accent/20 mb-7">
            <Sparkles size={16} className="text-ocean shrink-0" />
            <div>
              <p className="font-body text-xs text-ocean font-semibold">{activeWorkshop.name}</p>
              <p className="font-body text-xs text-navy/45">{activeWorkshop.date} · {activeWorkshop.venue}</p>
            </div>
            <span className="ml-auto font-body text-sm font-bold text-ocean">
              ₹{activeWorkshop.price.toLocaleString('en-IN')}
            </span>
          </div>
        )
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Full Name" error={errors.fullName?.message}>
          <input
            {...register('fullName')}
            type="text"
            placeholder="e.g. Priya Sharma"
            className={inputCls}
          />
        </Field>

        <Field label="Email Address" error={errors.email?.message}>
          <input
            {...register('email')}
            type="email"
            placeholder="you@example.com"
            className={inputCls}
          />
        </Field>

        <Field label="Phone Number" error={errors.phone?.message} className="sm:col-span-2">
          <div className="flex">
            <span className="px-3.5 py-3 border border-r-0 border-gray-200 rounded-l-lg bg-gray-50 font-body text-sm text-gray-500 flex items-center">
              +91
            </span>
            <input
              {...register('phone')}
              type="tel"
              placeholder="9876543210"
              maxLength={10}
              className="flex-1 border border-gray-200 rounded-r-lg px-4 py-3 font-body text-sm text-navy placeholder-gray-400 focus:outline-none focus:border-[#16537E] focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
        </Field>
      </div>

      <button
        onClick={onSubmit}
        disabled={submitting || !activeWorkshop}
        className="mt-8 w-full bg-[#0D2B45] text-white py-3.5 rounded-xl font-body font-semibold hover:bg-[#16537E] transition-colors text-sm disabled:opacity-60"
      >
        {submitting ? 'Saving…' : 'Continue to Payment →'}
      </button>

      <button
        type="button"
        onClick={onPreview}
        className="mt-3 w-full text-center font-body text-xs text-gray-300 hover:text-accent transition-colors"
      >
        Preview confirmation page →
      </button>
    </div>
  )
}

/* ─── UPI App Icons ─── */
function GPayIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill="white"/>
      {/* Google G — 4-colour arc */}
      <path d="M29.6 20.2c0-.7-.1-1.4-.2-2H20v3.8h5.4c-.2 1.2-.9 2.2-1.9 2.9v2.4h3.1c1.8-1.7 2.9-4.1 2.9-7.1z" fill="#4285F4"/>
      <path d="M20 30c2.7 0 5-.9 6.6-2.5l-3.1-2.4c-.9.6-2 .9-3.5.9-2.7 0-4.9-1.8-5.7-4.2h-3.2v2.5C12.8 27.9 16.2 30 20 30z" fill="#34A853"/>
      <path d="M14.3 21.8c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8v-2.5h-3.2C10.4 17 10 18.5 10 20s.4 3 1.1 4.3l3.2-2.5z" fill="#FBBC05"/>
      <path d="M20 13.8c1.5 0 2.9.5 3.9 1.5l2.9-2.9C25 10.9 22.7 10 20 10c-3.8 0-7.2 2.1-8.9 5.2l3.2 2.5c.8-2.5 3-4.2 5.7-4.2z" fill="#EA4335"/>
    </svg>
  )
}
function PhonePeIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill="#5F259F"/>
      {/* Stylised P */}
      <path d="M15.5 10h6.2c3.6 0 5.8 2.1 5.8 5.4 0 3.3-2.2 5.4-5.8 5.4H19v6.6c0 .3-.3.6-.6.6h-2.8c-.3 0-.6-.3-.6-.6V10.6c0-.3.3-.6.6-.6z" fill="white"/>
      {/* Small circle accent — bottom right */}
      <circle cx="28" cy="30" r="4" fill="#CBB3F0"/>
    </svg>
  )
}
function PaytmIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill="#002970"/>
      {/* Paytm wordmark */}
      <text x="20" y="26" textAnchor="middle" fontFamily="Arial,sans-serif" fontWeight="800" fontSize="13" fill="#00BAF2">Paytm</text>
      {/* Brand stripe */}
      <rect x="10" y="29" width="20" height="2.5" rx="1.25" fill="#00BAF2" opacity="0.4"/>
    </svg>
  )
}
function BhimIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill="#00A859"/>
      <text x="20" y="24" textAnchor="middle" fontFamily="Arial,sans-serif" fontWeight="800" fontSize="14" fill="white">BHIM</text>
      {/* Indian tricolour stripe */}
      <rect x="9" y="28" width="7" height="3" rx="1.5" fill="#FF9933"/>
      <rect x="16.5" y="28" width="7" height="3" rx="1.5" fill="white"/>
      <rect x="24" y="28" width="7" height="3" rx="1.5" fill="#138808"/>
    </svg>
  )
}

/* ─── Step 2: UPI Payment ─── */
function Step2Payment({
  registration,
  workshop,
  onPaid,
  submitting,
  onBack,
}: {
  registration: RegistrationResult
  workshop: Workshop
  onPaid: () => void
  submitting: boolean
  onBack: () => void
}) {
  const [paymentInitiated, setPaymentInitiated] = useState(false)
  const [chosenApp, setChosenApp] = useState('')
  const onPaidRef = useRef(onPaid)
  useEffect(() => { onPaidRef.current = onPaid }, [onPaid])

  const note = `Registration - ${registration.workshop_name}`
  const amountStr = `₹${registration.amount.toLocaleString('en-IN')}`
  const params = `pa=${UPI_ID}&pn=${encodeURIComponent(UPI_ORG)}&am=${registration.amount}&cu=INR&tn=${encodeURIComponent(note)}`

  const upiApps = [
    { label: 'Google Pay', href: `tez://upi/pay?${params}`,    icon: <GPayIcon />,    bg: '#F1F3F4', text: '#202124', border: '1.5px solid #e0e0e0' },
    { label: 'PhonePe',    href: `phonepe://pay?${params}`,    icon: <PhonePeIcon />, bg: '#5F259F', text: '#ffffff', border: 'none' },
    { label: 'Paytm',      href: `paytmmp://pay?${params}`,    icon: <PaytmIcon />,   bg: '#002970', text: '#ffffff', border: 'none' },
    { label: 'BHIM',       href: `upi://pay?${params}`,        icon: <BhimIcon />,    bg: '#00A859', text: '#ffffff', border: 'none' },
  ]

  // Auto-detect return from UPI app via visibility change
  useEffect(() => {
    if (!paymentInitiated) return
    let confirmTimer: ReturnType<typeof setTimeout>
    const handleReturn = () => {
      if (document.visibilityState === 'visible') {
        confirmTimer = setTimeout(() => onPaidRef.current(), 500)
      }
    }
    // Delay attach so the immediate transition to the UPI app doesn't fire
    const attachTimer = setTimeout(() => {
      document.addEventListener('visibilitychange', handleReturn)
    }, 1200)
    return () => {
      clearTimeout(confirmTimer)
      clearTimeout(attachTimer)
      document.removeEventListener('visibilitychange', handleReturn)
    }
  }, [paymentInitiated])

  // ── Saving/confirming state (auto-triggered on return) ──
  if (submitting) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 border-4 border-navy/10 border-t-navy rounded-full animate-spin mb-5" />
        <p className="font-display text-lg font-bold text-navy mb-1">Confirming your registration…</p>
        <p className="font-body text-sm text-navy/40">Just a moment</p>
      </div>
    )
  }

  // ── Waiting for user to return from UPI app ──
  if (paymentInitiated) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full bg-ocean/10 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full border-4 border-ocean/20 border-t-ocean animate-spin absolute inset-0" />
            <CheckCircle size={34} className="text-ocean" />
          </div>
        </div>
        <h3 className="font-display text-xl font-bold text-navy mb-1">
          Paying via {chosenApp}
        </h3>
        <p className="font-body text-sm text-navy/50 mb-1">
          Complete your payment in the app.
        </p>
        <p className="font-body text-xs text-navy/35 mb-8">
          Your ticket will appear automatically once you return.
        </p>
        <button
          onClick={onBack}
          className="font-body text-xs text-gray-400 hover:text-navy transition-colors"
        >
          ← Cancel and go back
        </button>
      </div>
    )
  }

  // ── Default: choose app or scan QR ──
  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-navy mb-1">Pay via UPI</h2>
      <p className="font-body text-gray-500 text-sm mb-6">
        Choose your UPI app or scan the QR code to pay.
      </p>

      {/* Amount banner */}
      <div
        className="flex items-center justify-between px-5 py-4 rounded-2xl mb-6"
        style={{ background: 'linear-gradient(135deg,#0D2B45,#16537E)' }}
      >
        <div>
          <p className="font-body text-xs text-white/55 uppercase tracking-widest mb-0.5">Amount to Pay</p>
          <p className="font-display text-3xl font-bold text-white">{amountStr}</p>
          <p className="font-body text-xs text-white/50 mt-0.5">{registration.workshop_name}</p>
        </div>
        <div className="text-right">
          <p className="font-body text-[10px] text-white/40 uppercase tracking-widest mb-0.5">UPI ID</p>
          <p className="font-mono text-sm text-white font-semibold">{UPI_ID}</p>
          <p className="font-body text-[10px] text-white/40 mt-0.5">{UPI_ORG}</p>
        </div>
      </div>

      {/* UPI app buttons — mobile only */}
      <div className="md:hidden mb-6">
        <p className="font-body text-xs text-navy/50 uppercase tracking-widest mb-3 text-center">
          Tap to open app
        </p>
        <div className="grid grid-cols-2 gap-3">
          {upiApps.map(({ label, href, icon, bg, text, border }) => (
            <a
              key={label}
              href={href}
              onClick={() => { setChosenApp(label); setPaymentInitiated(true) }}
              className="flex flex-col items-center justify-center gap-2 py-4 rounded-2xl active:scale-95 transition-transform shadow-sm"
              style={{ background: bg, border, color: text }}
            >
              {icon}
              <span className="font-body font-semibold text-xs">{label}</span>
            </a>
          ))}
        </div>
      </div>

      {/* QR Code */}
      <div className="flex flex-col items-center mb-6">
        <div className="flex items-center gap-2 mb-3">
          <QrCode size={14} className="text-navy/40" />
          <p className="font-body text-xs text-navy/50 uppercase tracking-widest">
            <span className="md:hidden">Or scan to pay</span>
            <span className="hidden md:inline">Scan to Pay</span>
          </p>
        </div>
        <div className="p-4 bg-white rounded-2xl border-2 border-gray-100 shadow-card inline-block">
          <QRCodeSVG
            value={`upi://pay?${params}`}
            size={180}
            fgColor="#0D2B45"
            bgColor="#ffffff"
            level="M"
          />
        </div>
        <p className="font-body text-xs text-navy/40 mt-2 text-center">
          Open any UPI app → Scan QR → Pay
        </p>
        {/* Desktop fallback after scanning */}
        <button
          onClick={() => { setChosenApp('QR'); setPaymentInitiated(true) }}
          className="hidden md:block mt-4 font-body text-xs text-ocean hover:text-navy transition-colors underline underline-offset-2"
        >
          I've scanned and paid →
        </button>
      </div>

      <button
        onClick={onBack}
        className="w-full text-center font-body text-sm text-gray-400 hover:text-navy transition-colors"
      >
        ← Edit details
      </button>
    </div>
  )
}

/* ─── Confirmation Page ─── */
function ConfirmationPage({
  registration,
  workshop,
}: {
  registration: RegistrationResult
  workshop: Workshop | null
}) {
  return (
    <div
      className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden px-4 py-16"
      style={{
        backgroundImage: "url('/bg-wave-swirl.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0" style={{ background: 'rgba(13,43,69,0.80)' }} />

      {/* Floating particles */}
      {([
        { x: '8%',  y: '12%', size: 6,  delay: 0 },
        { x: '88%', y: '8%',  size: 8,  delay: 0.4 },
        { x: '92%', y: '72%', size: 5,  delay: 0.8 },
        { x: '4%',  y: '78%', size: 9,  delay: 1.2 },
        { x: '48%', y: '4%',  size: 4,  delay: 0.2 },
        { x: '72%', y: '88%', size: 7,  delay: 0.6 },
      ] as const).map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{ left: p.x, top: p.y, width: p.size, height: p.size, background: '#4CA0C2', opacity: 0.3 }}
          animate={{ y: [0, -18, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 5 + i, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      <div className="relative z-10 w-full max-w-sm">

        {/* Header above ticket */}
        <motion.div
          className="text-center mb-5"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-1.5 rounded-full">
            <CheckCircle size={14} className="text-green-400" />
            <span className="font-body text-xs text-white font-semibold uppercase tracking-wider">
              Booking Confirmed
            </span>
          </div>
        </motion.div>

        {/* ── VIRTUAL TICKET ── */}
        <motion.div
          className="rounded-3xl overflow-visible shadow-[0_32px_80px_rgba(0,0,0,0.45)]"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
        >
          {/* ── TOP: Brand header ── */}
          <div
            className="relative px-6 pt-6 pb-8 overflow-hidden rounded-t-3xl"
            style={{ background: 'linear-gradient(135deg, #0D2B45 0%, #16537E 60%, #4CA0C2 100%)' }}
          >
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <img src="/hero-wave.png" alt="" className="w-full h-full object-cover" />
            </div>

            {/* Logo row — no invert, original wave colors + glow */}
            <div className="relative flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <img
                  src="/Screenshot_2026-06-12_023905-removebg-preview.png"
                  alt="ReSoLArt.co"
                  className="h-9 w-auto"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(76,160,194,0.7))' }}
                />
                <div>
                  <p className="font-display font-bold text-white text-base leading-none">ReSoLArt.co</p>
                  <p className="font-body text-[9px] text-white/50 uppercase tracking-widest mt-0.5">
                    create · connect · resonate
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center font-body text-[10px] text-white/70 uppercase tracking-widest bg-white/10 border border-white/20 px-2.5 py-1 rounded-full">
                Art Workshop
              </span>
            </div>

            <p className="relative font-body text-[10px] text-white/50 uppercase tracking-widest mb-1">Event</p>
            <h2 className="relative font-display text-2xl font-bold text-white leading-tight mb-1">
              {registration.workshop_name}
            </h2>
            <p className="relative font-body text-sm text-white/60">
              {workshop?.date}{workshop?.time ? ` · ${workshop.time}` : ''}
            </p>
          </div>

          {/* ── PERFORATION ── */}
          <div className="relative h-0 flex items-center z-10">
            <div className="absolute -left-3.5 w-7 h-7 rounded-full" style={{ background: 'rgba(13,43,69,0.75)' }} />
            <div className="absolute -right-3.5 w-7 h-7 rounded-full" style={{ background: 'rgba(13,43,69,0.75)' }} />
            <div className="w-full border-t-2 border-dashed border-gray-200 mx-5" />
          </div>

          {/* ── MAIN BODY ── */}
          <div className="bg-white px-6 pt-6 pb-5">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-5">
              <TicketField label="Attendee" value={registration.full_name} />
              <TicketField label="Amount Paid" value={`₹${registration.amount.toLocaleString('en-IN')}`} accent />
              {workshop && (
                <>
                  <TicketField label="Venue" value={workshop.venue} />
                  <TicketField label="Seat" value="1" />
                </>
              )}
            </div>

            {/* Pass ID + QR code */}
            <div className="bg-[#F7F3E8] rounded-2xl px-4 py-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-body text-[9px] text-gray-400 uppercase tracking-widest mb-1">Pass ID</p>
                <p className="font-mono text-navy text-[15px] font-bold tracking-wider mb-3">
                  {registration.pass_id}
                </p>
                <div className="flex items-end gap-[2px] h-5">
                  {[3,5,2,6,4,3,5,2,6,3,4,5,2,4,3].map((h, i) => (
                    <div key={i} className="w-[2px] rounded-full bg-navy/25" style={{ height: `${h * 3}px` }} />
                  ))}
                </div>
              </div>
              <div className="shrink-0 p-1.5 bg-white rounded-xl shadow-sm border border-gray-100">
                <QRCodeSVG
                  value={registration.pass_id}
                  size={76}
                  fgColor="#0D2B45"
                  bgColor="#ffffff"
                  level="M"
                />
              </div>
            </div>
          </div>

          {/* ── FOOTER ── */}
          <div className="bg-[#F7F3E8] px-5 py-3 rounded-b-3xl border-t border-gray-100 flex items-center justify-center">
            <p className="font-body text-[9px] text-gray-400 uppercase tracking-widest">
              Present this pass at the venue · ReSoLArt.co
            </p>
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          className="mt-5 space-y-2.5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          <a
            href={`/success/${registration.pass_id}`}
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-white text-navy font-body font-bold rounded-xl hover:bg-light transition-colors text-sm shadow-lg"
          >
            <Download size={16} /> Download Pass
          </a>
          <a
            href="/"
            className="flex items-center justify-center gap-2 w-full py-3 border border-white/20 text-white/80 font-body text-sm rounded-xl hover:bg-white/10 transition-all"
          >
            <Home size={15} /> Back to Home
          </a>
        </motion.div>
      </div>
    </div>
  )
}

function TicketField({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="font-body text-[9px] text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
      <p className={`font-body text-sm font-semibold leading-snug ${accent ? 'text-ocean' : 'text-navy'}`}>
        {value}
      </p>
    </div>
  )
}

function SummaryRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center px-5 py-3.5">
      <span className="font-body text-sm text-gray-500">{label}</span>
      <span className={`font-body text-sm font-semibold ${highlight ? 'text-[#16537E] text-base font-bold' : 'text-navy'}`}>
        {value}
      </span>
    </div>
  )
}

const inputCls =
  'w-full border border-gray-200 rounded-lg px-4 py-3 font-body text-sm text-navy placeholder-gray-400 focus:outline-none focus:border-[#16537E] focus:ring-2 focus:ring-blue-100 transition-all'

function Field({ label, error, children, className }: { label: string; error?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="mt-1.5 font-body text-xs text-red-500">{error}</p>}
    </div>
  )
}
