import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Download, Home, CheckCircle } from 'lucide-react'
import html2canvas from 'html2canvas'
import { supabase, type Registration } from '@art-workshop/shared'
import Navbar from '../components/ui/Navbar'
import PassCard from '../components/ui/PassCard'

export default function SuccessPage() {
  const { passId } = useParams<{ passId: string }>()
  const navigate = useNavigate()
  const [registration, setRegistration] = useState<Registration | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const passRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!passId) return
    supabase
      .from('registrations')
      .select('*')
      .eq('pass_id', passId)
      .single()
      .then(({ data }) => {
        setRegistration(data)
        setLoading(false)
      })
  }, [passId])

  const downloadPass = async () => {
    if (!passRef.current) return
    setDownloading(true)
    try {
      const canvas = await html2canvas(passRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      })
      const url = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = url
      a.download = `ReSoLArt-Pass-${registration?.pass_id ?? 'pass'}.png`
      a.click()
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-16">
        <Navbar />
        <div className="flex justify-center items-center py-40">
          <div className="w-10 h-10 border-2 border-ocean border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!registration) {
    return (
      <div className="min-h-screen bg-background pt-16">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-24 text-center">
          <h2 className="font-display text-3xl font-bold text-navy mb-4">Pass not found</h2>
          <button
            onClick={() => navigate('/')}
            className="font-body text-sm text-ocean hover:underline"
          >
            ← Back to home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background font-body">
      <Navbar />

      <div className="pt-16">
        <div className="max-w-xl mx-auto px-4 py-12">

          {/* Success header */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle size={34} className="text-green-600" />
            </motion.div>
            <h1 className="font-display text-3xl font-bold text-navy">Your Pass is Ready!</h1>
            <p className="font-body text-navy/55 text-sm mt-2">
              Save or screenshot this pass — present it at the venue for check-in.
            </p>
          </motion.div>

          {/* Pass card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="flex justify-center mb-8"
          >
            <div ref={passRef}>
              <PassCard registration={registration} />
            </div>
          </motion.div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={downloadPass}
              disabled={downloading}
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#0D2B45] text-white font-body font-semibold rounded-lg hover:bg-[#16537E] transition-colors text-sm disabled:opacity-60"
            >
              <Download size={16} />
              {downloading ? 'Downloading…' : 'Download Pass'}
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center gap-2 w-full py-3.5 border border-gray-200 text-navy font-body text-sm rounded-lg hover:bg-surface transition-colors"
            >
              <Home size={16} />
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
