import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  CheckCircle, Download, Home, Sparkles, QrCode, Loader2, CalendarPlus, Upload, XCircle,
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
const UPI_ID = '9121352046@pthdfc'
const UPI_ORG = 'ReSoLArt'

interface RegistrationResult {
  id: string
  pass_id: string
  full_name: string
  workshop_name: string
  amount: number
  phone: string
}


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

  /* ── Step 1 → Step 2 (seat selection). If user re-submits after going back, delete the old pending registration first ── */
  const onStep1SubmitWrapped: typeof onStep1Submit = async (e) => {
    if (registration?.id) {
      await supabase.from('registrations').delete().eq('id', registration.id).eq('payment_status', 'pending')
      setRegistration(null)
    }
    return onStep1Submit(e)
  }

  /* ── Step 2 seat confirmed → Step 3 payment ── */
  const handleSeatConfirmed = (newAmount: number) => {
    setRegistration(prev => prev ? { ...prev, amount: newAmount } : prev)
    setStep(3)
  }

  /* ── Step 3 payment done → Step 4 confirmation ── */
  const handleUpiPaid = () => setStep(4)

  if (step === 4 && registration) {
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
            <ProgressSteps current={step} steps={['Your Details', 'Pick a Ticket', 'Payment']} />
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
                    onSubmit={onStep1SubmitWrapped}
                    submitting={submitting}
                    workshops={workshops}
                    activeWorkshop={activeWorkshop}
                    onSelectWorkshop={(w) => { setActiveWorkshop(w); setValue('workshopId', w.id) }}
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
                  <Step2SeatSelection
                    workshop={activeWorkshop}
                    registrationId={registration.id}
                    onConfirm={handleSeatConfirmed}
                    onBack={() => setStep(1)}
                  />
                </motion.div>
              )}
              {step === 3 && registration && activeWorkshop && (
                <motion.div
                  key="s3"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.22 }}
                >
                  <Step2Payment
                    registration={registration}
                    onPaid={handleUpiPaid}
                    submitting={submitting}
                    onBack={() => setStep(2)}
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
}: {
  register: any
  errors: any
  onSubmit: () => void
  submitting: boolean
  workshops: Workshop[]
  activeWorkshop: Workshop | null
  onSelectWorkshop: (w: Workshop) => void
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
              const selected = activeWorkshop?.id === w.id
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => onSelectWorkshop(w)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all ${
                    selected
                      ? 'border-ocean bg-light ring-2 ring-ocean/20'
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
                  <p className="font-body text-sm font-bold text-ocean shrink-0">₹{w.price.toLocaleString('en-IN')}</p>
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
        {submitting ? 'Saving…' : 'Continue to Ticket Selection →'}
      </button>

    </div>
  )
}

/* ─── Step 2: Seat Quantity Selection ─── */
function Step2SeatSelection({
  workshop,
  registrationId,
  onConfirm,
  onBack,
}: {
  workshop: Workshop
  registrationId: string
  onConfirm: (newAmount: number) => void
  onBack: () => void
}) {
  const [quantity, setQuantity] = useState<number | null>(null)
  const [manualInput, setManualInput] = useState('')
  const [manualError, setManualError] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [inputFocused, setInputFocused] = useState(false)

  const total = quantity != null ? quantity * workshop.price : 0

  const handleBoxClick = (qty: number) => {
    setQuantity(prev => (prev === qty && !manualInput ? null : qty))
    setManualInput('')
    setManualError('')
    setError('')
  }

  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setManualInput(val)
    setManualError('')
    setQuantity(null)
    setError('')
    if (!val) return
    const num = parseInt(val, 10)
    if (!Number.isInteger(num) || num < 1) {
      setManualError('Enter a valid number of tickets')
    } else {
      setQuantity(num)
    }
  }

  const handleConfirm = async () => {
    if (!quantity) { setError('Please select the number of tickets.'); return }
    setSaving(true)
    try {
      const totalAmount = quantity * workshop.price
      const { error: updateError } = await supabase
        .from('registrations')
        .update({ seat_number: quantity, amount: totalAmount })
        .eq('id', registrationId)
      if (updateError) throw updateError
      onConfirm(totalAmount)
    } catch (err: any) {
      setError(err?.message ?? 'Could not save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-navy mb-1">Number of Tickets</h2>
      <p className="font-body text-gray-500 text-sm mb-6">
        How many tickets do you need for <span className="font-medium text-navy">{workshop.name}</span>?
      </p>

      {/* 5-box quantity row */}
      <div className="grid grid-cols-5 gap-2 mb-2">
        {[1, 2, 3, 4].map((qty) => {
          const active = quantity === qty && !manualInput
          return (
            <button
              key={qty}
              type="button"
              onClick={() => handleBoxClick(qty)}
              className={`h-14 rounded-xl text-base font-body font-bold transition-all border-2 ${
                active
                  ? 'bg-[#0D2B45] border-[#0D2B45] text-white shadow-md'
                  : 'bg-white border-gray-200 text-navy hover:border-[#16537E] hover:bg-light'
              }`}
            >
              {qty}
            </button>
          )
        })}

        {/* Box 5 — input, shows + when idle */}
        {(() => {
          const inputInvalid = !!manualInput && !!manualError
          const inputSelected = !!manualInput && !manualError && !!quantity
          const showPlus = !manualInput && !inputFocused
          return (
            <div
              className={`relative h-14 rounded-xl border-2 transition-all flex items-center justify-center ${
                inputInvalid
                  ? 'border-red-300 bg-red-50'
                  : inputSelected
                  ? 'bg-[#0D2B45] border-[#0D2B45]'
                  : inputFocused
                  ? 'border-[#16537E] bg-white'
                  : 'bg-white border-gray-200 hover:border-[#16537E]'
              }`}
            >
              {showPlus && (
                <span className="absolute pointer-events-none text-2xl font-light text-gray-400 select-none leading-none">
                  +
                </span>
              )}
              <input
                type="number"
                min={1}
                value={manualInput}
                onChange={handleManualChange}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder=""
                className={`w-full h-full text-center text-base font-body font-bold bg-transparent border-none outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                  showPlus ? 'caret-transparent' : ''
                } ${
                  inputInvalid ? 'text-red-500' : inputSelected ? 'text-white' : 'text-navy'
                }`}
              />
            </div>
          )
        })()}
      </div>

      {manualError && (
        <p className="font-body text-xs text-red-500 mb-3">{manualError}</p>
      )}

      {/* Price summary */}
      {quantity != null && (
        <div className="flex items-center justify-between bg-light rounded-xl border border-accent/20 px-4 py-3 mb-4">
          <p className="font-body text-sm text-navy/70">
            {quantity} {quantity === 1 ? 'ticket' : 'tickets'} × ₹{workshop.price.toLocaleString('en-IN')}
          </p>
          <p className="font-body text-base font-bold text-ocean">
            = ₹{total.toLocaleString('en-IN')}
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
          <XCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
          <p className="font-body text-sm text-red-600">{error}</p>
        </div>
      )}

      <button
        onClick={handleConfirm}
        disabled={!quantity || saving}
        className="mt-2 w-full bg-[#0D2B45] text-white py-3.5 rounded-xl font-body font-semibold hover:bg-[#16537E] transition-colors text-sm disabled:opacity-60"
      >
        {saving
          ? 'Saving…'
          : quantity
          ? `Continue to Payment → ₹${total.toLocaleString('en-IN')}`
          : 'Continue to Payment →'}
      </button>

      <button
        onClick={onBack}
        className="w-full text-center font-body text-sm text-gray-400 hover:text-navy transition-colors mt-4"
      >
        ← Edit details
      </button>
    </div>
  )
}

/* ─── Step 2: Payment + Screenshot Upload ─── */
function Step2Payment({
  registration,
  onPaid,
  submitting,
  onBack,
}: {
  registration: RegistrationResult
  onPaid: () => void
  submitting: boolean
  onBack: () => void
}) {
  const [verifying, setVerifying] = useState(false)
  const [verifyStep, setVerifyStep] = useState('')
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const note = `Workshop Registration - ${registration.workshop_name}`
  const amountStr = `₹${registration.amount.toLocaleString('en-IN')}`
  const params = `pa=${UPI_ID}&pn=${encodeURIComponent(UPI_ORG)}&am=${registration.amount}&cu=INR&tn=${encodeURIComponent(note)}`

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setVerifying(true)

    try {
      // ── Check 1: Valid image file ──
      const validExts = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif', '.bmp', '.gif']
      const isImage =
        file.type.startsWith('image/') ||
        validExts.some((ext) => file.name.toLowerCase().endsWith(ext))
      if (!isImage) {
        setError('Please upload a screenshot image from your UPI app.')
        return
      }
      if (file.size < 1024) {
        setError('The image appears to be empty or corrupted. Please upload a valid screenshot.')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be under 5MB. Please compress the screenshot and try again.')
        return
      }

      // ── OCR ──
      setVerifyStep('Reading screenshot… (may take 10–20 seconds)')
      const Tesseract = (await import('tesseract.js')).default
      const { data: { text } } = await Tesseract.recognize(file, 'eng', { logger: () => {} })
      const lower = text.toLowerCase()
      console.log('[OCR raw]', text)

      // ── Check 2: Success indicator ──
      setVerifyStep('Checking payment status…')
      const successWords = [
        // Google Pay
        'completed', 'payment complete',
        // PhonePe
        'payment successful', 'payment success',
        // Paytm
        'payment done', 'money sent',
        // BHIM / generic
        'transaction successful', 'transaction complete', 'transfer successful',
        // Bank apps
        'amount debited', 'amount credited',
        // Generic catch-all
        'paid', 'success', 'successful', 'debited', 'transferred', 'sent', 'approved',
      ]
      const successFound = successWords.some((w) => lower.includes(w))
      if (!successFound) {
        setError('Payment success not confirmed. Please upload a screenshot that shows "Paid", "Success", "Completed", or "Debited".')
        return
      }

      // ── Check 3: Today's date or recent timestamp ──
      setVerifyStep('Checking payment date…')
      const now = new Date()
      const MONTHS_SHORT = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec']
      const MONTHS_LONG  = ['january','february','march','april','may','june','july','august','september','october','november','december']
      const dd      = String(now.getDate()).padStart(2, '0')
      const d       = String(now.getDate())
      const mm      = String(now.getMonth() + 1).padStart(2, '0')
      const yyyy    = String(now.getFullYear())
      const yy      = yyyy.slice(2)
      const mon     = MONTHS_SHORT[now.getMonth()]
      const monFull = MONTHS_LONG[now.getMonth()]
      const dateVariants = [
        // DD/MM/YYYY  (most Indian apps)
        `${dd}/${mm}/${yyyy}`, `${d}/${mm}/${yyyy}`,
        `${dd}/${mm}/${yy}`,   `${d}/${mm}/${yy}`,
        // DD-MM-YYYY
        `${dd}-${mm}-${yyyy}`, `${d}-${mm}-${yyyy}`, `${dd}-${mm}-${yy}`,
        // MM/DD/YYYY  (some bank apps)
        `${mm}/${dd}/${yyyy}`, `${mm}/${dd}/${yy}`,
        // YYYY-MM-DD  (ISO / some bank exports)
        `${yyyy}-${mm}-${dd}`,
        // "24 Jun 2026" / "24 June 2026"
        `${dd} ${mon} ${yyyy}`, `${d} ${mon} ${yyyy}`,
        `${dd} ${monFull} ${yyyy}`, `${d} ${monFull} ${yyyy}`,
        // "Jun 24, 2026" / "June 24, 2026"
        `${mon} ${dd}, ${yyyy}`, `${mon} ${d}, ${yyyy}`,
        `${monFull} ${dd}, ${yyyy}`, `${monFull} ${d}, ${yyyy}`,
        // Relative / inline labels
        'today', 'just now', 'moments ago', 'seconds ago',
        'min ago', 'mins ago', 'minute ago', 'minutes ago',
      ]
      // UPI apps show a bare time (e.g. "1:21 am") for today's transactions
      const hasTimeStamp = /\b\d{1,2}:\d{2}\s*(?:am|pm)\b/i.test(text)
      const dateFound = dateVariants.some((v) => lower.includes(v)) || hasTimeStamp
      if (!dateFound) {
        setError("This screenshot appears to be outdated. Please upload today's payment screenshot.")
        return
      }

      // ── Check 4: UPI / payment platform indicator ──
      setVerifyStep('Verifying payment source…')
      const upiIndicators = [
        'upi', 'utr', 'ref no', 'reference no', 'reference number',
        'transaction id', 'txn id', 'txn no',
        'google pay', 'gpay', 'phonepe', 'paytm', 'bhim', 'amazon pay',
        'imobile', 'yono', 'mobikwik',
        'bank', 'neft', 'imps', 'transfer',
      ]
      const upiFound = upiIndicators.some((w) => lower.includes(w))
      if (!upiFound) {
        setError('Could not verify this as a UPI payment. Please upload a screenshot from your UPI or banking app.')
        return
      }

      // ── Check 5: UTR / Transaction ID duplicate check ──
      setVerifyStep('Verifying transaction ID…')
      const utrPatterns = [
        /(?:google\s*(?:transaction|pay)\s*id|upi\s*transaction\s*id|utr|upi\s*ref(?:erence)?)\s*[:#\-]?\s*([A-Z0-9]{12,})/i,
        /(?:ref(?:erence)?\s*(?:no\.?|id|number)?|txn\s*(?:id|no\.?))\s*[:#\-]?\s*([A-Z0-9]{12,})/i,
        /(?:transaction\s*(?:id|no\.?))\s*[:#\-]?\s*([A-Z0-9]{12,})/i,
        /\b(\d{12})\b/,
      ]
      let utr: string | null = null
      for (const pat of utrPatterns) {
        const m = text.match(pat)
        if (m?.[1]) { utr = m[1]; break }
      }

      if (utr) {
        const { data: dup } = await supabase
          .from('registrations')
          .select('id')
          .eq('utr_number', utr)
          .maybeSingle()
        if (dup) {
          setError('This payment screenshot has already been used. Please make a new payment.')
          return
        }
      }

      // ── All checks passed — save ──
      setVerifyStep('Confirming payment…')
      const payload: Record<string, unknown> = { payment_status: 'paid' }
      if (utr) payload.utr_number = utr

      const { error: updateError } = await supabase
        .from('registrations')
        .update(payload)
        .eq('id', registration.id)
      if (updateError) throw updateError

      onPaid()

    } catch (err: any) {
      setError(err?.message ?? 'Verification failed. Please try again.')
    } finally {
      setVerifying(false)
      setVerifyStep('')
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  if (submitting) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 border-4 border-navy/10 border-t-navy rounded-full animate-spin mb-5" />
        <p className="font-display text-lg font-bold text-navy mb-1">Confirming your registration…</p>
        <p className="font-body text-sm text-navy/40">Just a moment</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-navy mb-1">Complete Payment</h2>
      <p className="font-body text-gray-500 text-sm mb-6">
        Pay via UPI, take a screenshot, and upload it to confirm.
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

      {/* QR Code */}
      <div className="flex flex-col items-center mb-6">
        <div className="flex items-center gap-2 mb-3">
          <QrCode size={14} className="text-navy/40" />
          <p className="font-body text-xs text-navy/50 uppercase tracking-widest">Scan to Pay</p>
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
      </div>

      {/* Instructions */}
      <div className="bg-[#F7F3E8] rounded-2xl px-5 py-4 mb-6 space-y-2.5">
        {[
          `Pay ${amountStr} via any UPI app`,
          'Take a screenshot of the payment success screen',
          'Upload the screenshot below to confirm your booking',
        ].map((step, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="shrink-0 w-5 h-5 rounded-full bg-ocean text-white font-body text-xs font-bold flex items-center justify-center mt-0.5">
              {i + 1}
            </span>
            <p className="font-body text-sm text-navy/70">{step}</p>
          </div>
        ))}
      </div>

      {/* Reminder */}
      <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
        <span className="text-amber-500 text-base leading-none mt-0.5">⚠️</span>
        <p className="font-body text-sm text-amber-800">
          <span className="font-semibold">Before paying —</span> make sure you upload the payment success screenshot. Without it, your booking cannot be confirmed.
        </p>
      </div>

      {/* Upload area */}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <button
        onClick={() => fileRef.current?.click()}
        disabled={verifying}
        className="w-full border-2 border-dashed border-ocean/30 rounded-2xl py-8 flex flex-col items-center gap-3 hover:border-ocean/60 hover:bg-light/50 transition-all disabled:opacity-60"
      >
        {verifying ? (
          <>
            <Loader2 size={28} className="text-ocean animate-spin" />
            <p className="font-body text-sm text-navy/60">{verifyStep || 'Processing…'}</p>
            <p className="font-body text-xs text-navy/35">Please wait, do not close this page</p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-ocean/10 flex items-center justify-center">
              <Upload size={22} className="text-ocean" />
            </div>
            <div className="text-center">
              <p className="font-body text-sm font-semibold text-navy">Upload Payment Screenshot</p>
              <p className="font-body text-xs text-navy/40 mt-0.5">Tap to select from gallery</p>
            </div>
          </>
        )}
      </button>

      {/* Error */}
      {error && (
        <div className="mt-4 flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <XCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
          <p className="font-body text-sm text-red-600">{error}</p>
        </div>
      )}

      <button
        onClick={onBack}
        className="w-full text-center font-body text-sm text-gray-400 hover:text-navy transition-colors mt-5"
      >
        ← Edit details
      </button>
    </div>
  )
}

/* ─── Verifying Screen ─── */
/* ─── Confirmation Page ─── */
function ConfirmationPage({
  registration,
  workshop,
}: {
  registration: RegistrationResult
  workshop: Workshop | null
}) {
  const ticketRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)

  const downloadTicket = async () => {
    if (!ticketRef.current || downloading) return
    setDownloading(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const { jsPDF } = await import('jspdf')
      const el = ticketRef.current
      const canvas = await html2canvas(el, { scale: 3, useCORS: true, logging: false, backgroundColor: '#ffffff' })
      const imgData = canvas.toDataURL('image/png')
      const w = el.offsetWidth
      const h = el.offsetHeight
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [w + 48, h + 48] })
      pdf.addImage(imgData, 'PNG', 24, 24, w, h)
      pdf.save(`ReSoLArt-${registration.pass_id}.pdf`)
    } catch {
      toast.error('Download failed. Try a screenshot instead.')
    } finally {
      setDownloading(false)
    }
  }

  const addToCalendar = () => {
    const d = (workshop?.date ?? '2025-06-28').replace(/-/g, '')
    const url = new URL('https://calendar.google.com/calendar/r/eventedit')
    url.searchParams.set('text', `${registration.workshop_name} · ReSoLArt.co`)
    url.searchParams.set('dates', `${d}T100000/${d}T130000`)
    url.searchParams.set('details', `Pass ID: ${registration.pass_id}\nPresent this pass at the venue entry.`)
    url.searchParams.set('location', workshop?.venue ?? 'Hyderabad')
    window.open(url.toString(), '_blank')
  }

  return (
    <div
      className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden px-4 py-16"
      style={{ backgroundImage: "url('/bg-wave-swirl.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="absolute inset-0" style={{ background: 'rgba(13,43,69,0.80)' }} />

      {/* Floating particles */}
      {([
        { x: '8%',  y: '12%', size: 6, delay: 0 },
        { x: '88%', y: '8%',  size: 8, delay: 0.4 },
        { x: '92%', y: '72%', size: 5, delay: 0.8 },
        { x: '4%',  y: '78%', size: 9, delay: 1.2 },
        { x: '48%', y: '4%',  size: 4, delay: 0.2 },
        { x: '72%', y: '88%', size: 7, delay: 0.6 },
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
        {/* Confirmed badge */}
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
          ref={ticketRef}
          className="rounded-3xl overflow-visible shadow-[0_32px_80px_rgba(0,0,0,0.45)]"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.5, ease: 'easeOut' }}
        >
          {/* TOP: Brand header */}
          <div
            className="relative px-6 pt-6 pb-8 overflow-hidden rounded-t-3xl"
            style={{ background: 'linear-gradient(135deg, #0D2B45 0%, #16537E 60%, #4CA0C2 100%)' }}
          >
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <img src="/hero-wave.png" alt="" className="w-full h-full object-cover" />
            </div>
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

          {/* PERFORATION */}
          <div className="relative h-0 flex items-center z-10">
            <div className="absolute -left-3.5 w-7 h-7 rounded-full" style={{ background: 'rgba(13,43,69,0.75)' }} />
            <div className="absolute -right-3.5 w-7 h-7 rounded-full" style={{ background: 'rgba(13,43,69,0.75)' }} />
            <div className="w-full border-t-2 border-dashed border-gray-200 mx-5" />
          </div>

          {/* MAIN BODY */}
          <div className="bg-white px-6 pt-6 pb-5">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-5">
              <TicketField label="Attendee" value={registration.full_name} />
              <TicketField label="Amount Paid" value={`₹${registration.amount.toLocaleString('en-IN')}`} accent />
              {workshop && (
                <>
                  <TicketField label="Venue" value={workshop.venue} />
                  <TicketField label="Date" value={workshop.date} />
                </>
              )}
            </div>

            {/* Pass ID + QR */}
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

          {/* FOOTER */}
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
          transition={{ delay: 0.5 }}
        >
          <a
            href={`https://wa.me/919121352046?text=${encodeURIComponent(
              `Hi ReSoLArt! Here is my booking confirmation:\n\n` +
              `================================\n` +
              `RESOLART WORKSHOP TICKET\n` +
              `================================\n` +
              `Ticket No  : ${registration.pass_id}\n` +
              `Name       : ${registration.full_name}\n` +
              `Phone      : ${registration.phone}\n` +
              `Workshop   : ${registration.workshop_name}\n` +
              `Date       : ${workshop?.date ?? ''}\n` +
              `Venue      : ${workshop?.venue ?? ''}\n` +
              `Amount     : Rs.${registration.amount}\n` +
              `Status     : CONFIRMED\n` +
              `================================\n` +
              `Present Ticket No at venue entry.\n` +
              `See you at the workshop!\n` +
              `================================`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-body font-bold text-base shadow-lg transition-opacity hover:opacity-90"
            style={{ background: '#25D366', color: '#fff' }}
          >
            📲 Send My Ticket on WhatsApp
          </a>
          <button
            onClick={downloadTicket}
            disabled={downloading}
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-white text-navy font-body font-bold rounded-xl hover:bg-light transition-colors text-sm shadow-lg disabled:opacity-60"
          >
            {downloading
              ? <><Loader2 size={16} className="animate-spin" /> Preparing PDF…</>
              : <><Download size={16} /> Download Ticket</>
            }
          </button>
          <button
            onClick={addToCalendar}
            className="flex items-center justify-center gap-2 w-full py-3 border border-white/20 text-white/80 font-body text-sm rounded-xl hover:bg-white/10 transition-all"
          >
            <CalendarPlus size={15} /> Add to Calendar
          </button>
          <a
            href="/"
            className="flex items-center justify-center gap-2 w-full py-3 text-white/40 font-body text-sm hover:text-white/70 transition-colors"
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
