import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin, IndianRupee, ArrowLeft } from 'lucide-react'
import { supabase, type Workshop } from '@art-workshop/shared'
import Navbar from '../components/ui/Navbar'
import Footer from '../components/ui/Footer'
import WaveIllustration from '../components/ui/WaveIllustration'

export default function WorkshopDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [workshop, setWorkshop] = useState<Workshop | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    supabase
      .from('workshops')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        setWorkshop(data)
        setLoading(false)
      })
  }, [id])

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

  if (!workshop) {
    return (
      <div className="min-h-screen bg-background pt-16">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-24 text-center">
          <h2 className="font-display text-3xl font-bold text-navy mb-4">Workshop not found</h2>
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 font-body text-sm text-navy/60 hover:text-navy mb-8 transition-colors"
          >
            <ArrowLeft size={16} /> Back to workshops
          </button>

          {/* Workshop name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold text-navy">
              {workshop.name}
            </h1>
          </motion.div>

          {/* Content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            {/* Left — uploaded image or wave illustration fallback */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl overflow-hidden"
            >
              {workshop.image_url ? (
                <img
                  src={workshop.image_url}
                  alt={workshop.name}
                  className="w-full h-auto block"
                />
              ) : (
                <div className="bg-gradient-to-br from-light to-[#A7D8F0] p-8">
                  <WaveIllustration className="w-full" />
                </div>
              )}
            </motion.div>

            {/* Right — details */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="space-y-6"
            >
              {/* Info grid */}
              <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-accent shrink-0" />
                  <div>
                    <p className="font-body text-[10px] text-navy/40 uppercase tracking-wider">Date</p>
                    <p className="font-body text-sm font-semibold text-navy">{workshop.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock size={18} className="text-accent shrink-0" />
                  <div>
                    <p className="font-body text-[10px] text-navy/40 uppercase tracking-wider">Time</p>
                    <p className="font-body text-sm font-semibold text-navy">{workshop.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={18} className="text-accent shrink-0" />
                  <div>
                    <p className="font-body text-[10px] text-navy/40 uppercase tracking-wider">Location</p>
                    <p className="font-body text-sm font-semibold text-navy">{workshop.venue}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <IndianRupee size={18} className="text-accent shrink-0" />
                  <div>
                    <p className="font-body text-[10px] text-navy/40 uppercase tracking-wider">Price per person</p>
                    <p className="font-body text-sm font-semibold text-navy">
                      ₹{workshop.price.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {workshop.description && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="font-display font-bold text-navy text-lg mb-3">About this Workshop</h3>
                  <p className="font-body text-navy/65 text-sm leading-relaxed">{workshop.description}</p>
                </div>
              )}


              {/* CTA */}
              <button
                onClick={() => navigate('/register')}
                className="w-full bg-[#0D2B45] text-white py-4 rounded-lg font-body font-semibold hover:bg-[#16537E] transition-colors flex items-center justify-center gap-2"
              >
                Register Now →
              </button>
            </motion.div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  )
}
