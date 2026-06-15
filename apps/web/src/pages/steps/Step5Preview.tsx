import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFormContext } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { GradientButton } from '@/components/ui'
import GlassCard from '@/components/ui/GlassCard'
import { supabase, generatePassId, type Workshop } from '@art-workshop/shared'
import toast from 'react-hot-toast'
import { ShieldCheck, Loader, CheckCircle2 } from 'lucide-react'

interface Step5PreviewProps {
  workshops: Workshop[]
  onPaymentStart: () => void
}

interface RazorpayResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

const loadRazorpayScript = (): Promise<boolean> =>
  new Promise((resolve) => {
    if ((window as any).Razorpay) { resolve(true); return }
    const existing = document.querySelector('script[src*="checkout.razorpay"]')
    if (existing) {
      existing.addEventListener('load', () => resolve(true))
      existing.addEventListener('error', () => resolve(false))
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })


export default function Step5Preview({ workshops }: Step5PreviewProps) {
  const { getValues } = useFormContext()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)

  const formData = getValues()
  const selectedWorkshop = workshops.find((w) => w.id === formData.workshopId)

  const verifyPayment = async (response: RazorpayResponse, registrationId: string) => {
    setProcessing(true)
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-payment`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            registration_id: registrationId,
          }),
        }
      )
      if (!res.ok) throw new Error('Verification failed')
      const data = await res.json()
      if (!data.success) throw new Error('Payment verification failed')

      toast.success('Payment confirmed! Welcome to ReSoLArt.')
      navigate(`/success/${data.pass_id}`)
    } catch (err) {
      toast.error('Verification failed. Please contact us.')
      await supabase.from('registrations').update({ payment_status: 'failed' }).eq('id', registrationId)
      setProcessing(false)
    }
  }

  const handleProceedToPayment = async () => {
    try {
      setLoading(true)
      const passId = generatePassId()

      const { data: reg, error: regError } = await supabase
        .from('registrations')
        .insert({
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          workshop_id: formData.workshopId,
          workshop_name: selectedWorkshop?.name ?? '',
          creative_interest: formData.creativeInterest || null,
          pass_id: passId,
          amount: selectedWorkshop?.price ?? 0,
          payment_status: 'pending',
        })
        .select()
        .single()

      if (regError) throw regError

      const orderRes = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-razorpay-order`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            registration_id: reg.id,
            full_name: reg.full_name,
            email: reg.email,
            phone: reg.phone,
            workshop_name: reg.workshop_name,
            amount: reg.amount,
          }),
        }
      )
      if (!orderRes.ok) throw new Error('Could not create payment order')
      const orderData = await orderRes.json()

      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) throw new Error('Payment gateway unavailable. Try again.')

      setLoading(false)

      const rzp = new (window as any).Razorpay({
        key: orderData.key_id,
        amount: orderData.amount * 100,
        currency: 'INR',
        order_id: orderData.order_id,
        name: 'ReSoLArt.co',
        description: `Experience — ${reg.workshop_name}`,
        prefill: { name: reg.full_name, email: reg.email, contact: reg.phone },
        theme: { color: '#1B4F72' },
        handler: (response: RazorpayResponse) => { verifyPayment(response, reg.id) },
        modal: { ondismiss: () => { toast('Payment cancelled', { icon: '🌊' }) } },
      })

      rzp.on('payment.failed', async (failResponse: any) => {
        toast.error(`Payment failed: ${failResponse.error?.description ?? 'Please try again.'}`)
        await supabase.from('registrations').update({ payment_status: 'failed' }).eq('id', reg.id)
      })

      rzp.open()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to initiate payment.')
      setLoading(false)
    }
  }

  const isBusy = loading || processing

  return (
    <div className="relative">
      {/* Processing overlay */}
      <AnimatePresence>
        {processing && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl bg-background/85 backdrop-blur-sm"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="mb-4"
            >
              <Loader size={40} className="text-primary" />
            </motion.div>
            <p className="font-display font-bold text-lg text-navy">Confirming your experience</p>
            <p className="font-body text-sm text-secondary mt-1">Please don't close this window…</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <span className="font-accent italic text-ocean text-base">step 5</span>
          <h2 className="font-display text-2xl font-bold text-navy mt-1 mb-1">Your experience pass is ready</h2>
          <p className="font-body text-secondary text-sm">Review your details, then proceed to reserve your spot</p>
        </div>

        {/* Summary */}
        <GlassCard className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-body text-[10px] text-secondary uppercase tracking-widest mb-1">Name</p>
              <p className="font-body font-semibold text-navy">{formData.fullName}</p>
            </div>
            <div>
              <p className="font-body text-[10px] text-secondary uppercase tracking-widest mb-1">Email</p>
              <p className="font-body font-semibold text-navy break-all">{formData.email}</p>
            </div>
            <div>
              <p className="font-body text-[10px] text-secondary uppercase tracking-widest mb-1">Phone</p>
              <p className="font-body font-semibold text-navy">+91 {formData.phone}</p>
            </div>
            <div>
              <p className="font-body text-[10px] text-secondary uppercase tracking-widest mb-1">Experience</p>
              <p className="font-body font-semibold text-navy">{selectedWorkshop?.name}</p>
            </div>
          </div>
          {formData.creativeInterest && (
            <div className="pt-4 border-t border-primary/10">
              <p className="font-body text-[10px] text-secondary uppercase tracking-widest mb-2">Your Story</p>
              <p className="font-body text-sm text-navy/80">{formData.creativeInterest}</p>
            </div>
          )}
        </GlassCard>

        {/* Pass preview */}
        <div>
          <h3 className="font-display font-bold text-navy mb-1">Pass Preview</h3>
          <p className="font-body text-xs text-secondary mb-4">This is what you'll receive after payment</p>
          <GlassCard className="p-6 text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <img src="/logo.png" alt="ReSoLArt.co" className="h-12 w-auto mix-blend-multiply" />
              <span className="font-display font-bold text-primary text-lg">ReSoLArt.co</span>
            </div>
            <div className="font-accent italic text-secondary text-sm">create · connect · resonate</div>
            <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-widest">
              Experience Pass
            </div>
            <div className="bg-surface rounded-xl p-3 font-mono text-primary/60 tracking-widest text-sm">
              ART-XXXXXX-XXXX
            </div>
            <div className="bg-surface rounded-xl p-3 space-y-1">
              <p className="font-body font-semibold text-navy">{formData.fullName}</p>
              <p className="font-body text-sm text-secondary">{selectedWorkshop?.name}</p>
              {selectedWorkshop && (
                <p className="font-body text-xs text-secondary">{selectedWorkshop.date} · {selectedWorkshop.venue}</p>
              )}
            </div>
            <div className="flex items-center justify-center gap-1.5 text-xs text-secondary font-body">
              <CheckCircle2 size={13} className="text-success" />
              Includes QR check-in code
            </div>
          </GlassCard>
        </div>

        {/* Payment summary */}
        <GlassCard className="p-6 border border-primary/20 bg-primary/5">
          <div className="space-y-2">
            <div className="flex justify-between font-body text-sm">
              <span className="text-secondary">Experience Fee</span>
              <span className="font-semibold text-navy">₹{selectedWorkshop?.price.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between font-body text-sm">
              <span className="text-secondary">Platform Fee</span>
              <span className="font-semibold text-success">Free</span>
            </div>
            <div className="flex justify-between font-display text-lg font-bold border-t border-primary/10 pt-3 mt-2">
              <span className="text-navy">Total</span>
              <span className="text-primary">₹{selectedWorkshop?.price.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </GlassCard>

        {/* CTA */}
        <div className="space-y-3">
          <GradientButton
            onClick={handleProceedToPayment}
            loading={isBusy}
            disabled={isBusy}
            className="w-full py-4 text-base"
          >
            {loading ? 'Preparing…' : processing ? 'Confirming…' : 'Reserve My Spot'}
          </GradientButton>
          <div className="flex items-center justify-center gap-2 font-body text-xs text-secondary">
            <ShieldCheck size={13} className="text-primary shrink-0" />
            Secured by Razorpay · 256-bit SSL · PCI DSS compliant
          </div>
        </div>
      </motion.div>
    </div>
  )
}
