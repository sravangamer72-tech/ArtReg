import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { Calendar, Clock, MapPin, ChevronRight } from 'lucide-react'
import type { Workshop } from '@art-workshop/shared'
import WaveIllustration from './WaveIllustration'

interface WorkshopCardProps {
  workshop: Workshop
  index?: number
}

export default function WorkshopCard({ workshop, index = 0 }: WorkshopCardProps) {
  const navigate = useNavigate()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.12 }}
      whileHover={{ y: -6, boxShadow: '0 24px 48px rgba(13,43,69,0.14)' }}
      className="bg-white rounded-2xl shadow-md overflow-hidden cursor-pointer border border-gray-100 transition-shadow duration-300"
    >
      <div className="grid grid-cols-1 md:grid-cols-5">

        {/* Left — image or wave illustration fallback */}
        <div
          className="md:col-span-2 relative overflow-hidden"
          style={!workshop.image_url ? { background: 'linear-gradient(135deg, #E6F3FA 0%, #b8dff0 100%)' } : {}}
        >
          {workshop.image_url ? (
            <img
              src={workshop.image_url}
              alt={workshop.name}
              className="w-full h-auto block"
            />
          ) : (
            <div className="p-8 flex items-center justify-center min-h-[200px]">
              <WaveIllustration className="w-full max-w-[220px] drop-shadow-sm" />
            </div>
          )}
        </div>

        {/* Right — details */}
        <div className="md:col-span-3 p-6 md:p-8 flex flex-col justify-between gap-5">
          <div>
            {/* Title row */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <h3
                className="font-display font-bold text-navy leading-tight"
                style={{ fontSize: 'clamp(1.1rem, 2vw, 1.35rem)' }}
              >
                {workshop.name}
              </h3>
              {/* Stylish price badge */}
              <div
                className="shrink-0 px-4 py-1.5 rounded-full text-white font-body font-bold text-sm"
                style={{ background: 'linear-gradient(135deg, #16537E, #4CA0C2)' }}
              >
                ₹{workshop.price.toLocaleString('en-IN')}
              </div>
            </div>

            {/* Info pills */}
            <div className="flex flex-wrap gap-3 mb-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-body text-navy/60 bg-background px-3 py-1.5 rounded-full">
                <Calendar size={12} className="text-accent" />
                {workshop.date}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-body text-navy/60 bg-background px-3 py-1.5 rounded-full">
                <Clock size={12} className="text-accent" />
                {workshop.time}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-body text-navy/60 bg-background px-3 py-1.5 rounded-full">
                <MapPin size={12} className="text-accent" />
                {workshop.venue}
              </span>
            </div>

            {workshop.description && (
              <p className="font-body text-sm text-navy/55 leading-relaxed line-clamp-2">
                {workshop.description}
              </p>
            )}
          </div>

          {/* Bottom row */}
          <div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(`/workshops/${workshop.id}`)}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#0D2B45] text-white font-body font-semibold text-sm rounded-xl hover:bg-[#16537E] transition-colors"
              >
                View Details <ChevronRight size={15} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
