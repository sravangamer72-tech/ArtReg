import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Loader } from 'lucide-react'
import { supabase, type Registration } from '@art-workshop/shared'
import GlassCard from '@/components/ui/GlassCard'
import { FloatingOrb } from '@/components/ui'
import toast from 'react-hot-toast'

interface RazorpayResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

export default function PaymentPage() {
  const { registrationId } = useParams<{ registrationId: string }>()
  const navigate = useNavigate()
  const [registration, setRegistration] = useState<Registration | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID

  useEffect(() => {
    if (!registrationId) {
      toast.error('Invalid registration')
      navigate('/register')
      return
    }

    fetchRegistration()
  }, [registrationId])

  const fetchRegistration = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('id', registrationId)
        .single()

      if (error) throw error
      setRegistration(data)

      // Auto-initiate payment after fetching
      setTimeout(() => {
        initiatePayment(data)
      }, 500)
    } catch (error) {
      console.error('Failed to fetch registration:', error)
      toast.error('Failed to load payment details')
      navigate('/register')
    } finally {
      setLoading(false)
    }
  }

  const initiatePayment = async (reg: Registration) => {
    try {
      setProcessing(true)

      // Call edge function to create Razorpay order
      const response = await fetch(
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

      if (!response.ok) {
        throw new Error('Failed to create order')
      }

      const orderData = await response.json()

      // Open Razorpay modal
      openRazorpayModal(orderData, reg)
    } catch (error) {
      console.error('Failed to initiate payment:', error)
      toast.error('Failed to initiate payment. Please try again.')
      setProcessing(false)
    }
  }

  const openRazorpayModal = (
    orderData: { order_id: string; key_id: string; amount: number },
    reg: Registration
  ) => {
    const options = {
      key: orderData.key_id,
      amount: orderData.amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      order_id: orderData.order_id,
      name: 'ArtFlow',
      description: `Registration for ${reg.workshop_name}`,
      image: '', // Add logo URL if needed
      prefill: {
        name: reg.full_name,
        email: reg.email,
        contact: reg.phone,
      },
      theme: {
        color: '#7C3AED',
      },
      handler: (response: RazorpayResponse) => {
        handlePaymentSuccess(response, reg)
      },
      modal: {
        ondismiss: () => {
          setProcessing(false)
          toast.error('Payment cancelled')
        },
      },
    }

    // Create script if not already loaded
    const script = document.querySelector('script[src*="checkout.razorpay"]')
    if (!script) {
      const newScript = document.createElement('script')
      newScript.src = 'https://checkout.razorpay.com/v1/checkout.js'
      newScript.onload = () => {
        const razorpay = new (window as any).Razorpay(options)
        razorpay.open()
      }
      document.body.appendChild(newScript)
    } else {
      const razorpay = new (window as any).Razorpay(options)
      razorpay.open()
    }
  }

  const handlePaymentSuccess = async (response: RazorpayResponse, reg: Registration) => {
    try {
      setProcessing(true)

      // Verify payment with edge function
      const verifyResponse = await fetch(
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
            registration_id: reg.id,
          }),
        }
      )

      if (!verifyResponse.ok) {
        throw new Error('Payment verification failed')
      }

      const verifyData = await verifyResponse.json()

      if (verifyData.success) {
        toast.success('Payment successful!')
        // Navigate to success page with pass ID
        navigate(`/success/${verifyData.pass_id}`)
      } else {
        throw new Error('Payment verification failed')
      }
    } catch (error) {
      console.error('Payment verification error:', error)
      toast.error('Payment verification failed. Please contact support.')

      // Update registration status to failed
      try {
        await supabase
          .from('registrations')
          .update({ payment_status: 'failed' })
          .eq('id', reg.id)
      } catch (updateError) {
        console.error('Failed to update registration:', updateError)
      }

      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-white flex items-center justify-center pt-20">
        <FloatingOrb
          delay={0}
          duration={8}
          size={300}
          className="top-20 -left-40 bg-gradient-to-br from-violet-600/20 to-transparent"
        />

        <div className="relative z-10 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="flex justify-center mb-4"
          >
            <Loader size={48} className="text-primary" />
          </motion.div>
          <h2 className="text-2xl font-syne font-bold mb-2">Loading Payment Details</h2>
          <p className="text-secondary">Please wait while we prepare your payment...</p>
        </div>
      </div>
    )
  }

  if (processing) {
    return (
      <div className="min-h-screen bg-background text-white flex items-center justify-center pt-20">
        <FloatingOrb
          delay={0}
          duration={8}
          size={300}
          className="top-20 -left-40 bg-gradient-to-br from-violet-600/20 to-transparent"
        />

        <div className="relative z-10 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="flex justify-center mb-4"
          >
            <Loader size={48} className="text-primary" />
          </motion.div>
          <h2 className="text-2xl font-syne font-bold mb-2">Processing Payment</h2>
          <p className="text-secondary">Your payment is being verified. This may take a few moments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-white flex items-center justify-center pt-20 pb-8">
      <FloatingOrb
        delay={0}
        duration={8}
        size={300}
        className="top-20 -left-40 bg-gradient-to-br from-violet-600/20 to-transparent"
      />

      <div className="max-w-md w-full mx-auto px-4 relative z-10">
        <GlassCard className="p-8 text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl font-syne font-bold mb-2">Payment Details</h1>
            <p className="text-secondary">Review your payment information</p>
          </motion.div>

          {registration && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="space-y-4 py-6 border-y border-white/10"
            >
              <div>
                <p className="text-secondary text-sm uppercase tracking-wide">Workshop</p>
                <p className="font-semibold text-lg">{registration.workshop_name}</p>
              </div>
              <div>
                <p className="text-secondary text-sm uppercase tracking-wide">Participant</p>
                <p className="font-semibold">{registration.full_name}</p>
              </div>
              <div className="pt-4 flex items-center justify-between font-syne font-bold">
                <span>Amount</span>
                <span className="text-2xl text-primary">₹{registration.amount.toLocaleString('en-IN')}</span>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-sm text-secondary"
          >
            <p>🔒 Secure payment powered by Razorpay</p>
          </motion.div>
        </GlassCard>
      </div>
    </div>
  )
}
