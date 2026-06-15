import { motion } from 'framer-motion'
import { useFormContext } from 'react-hook-form'
import GlassCard from '@/components/ui/GlassCard'

export default function Step4Interests() {
  const { register, watch } = useFormContext()
  const value = watch('creativeInterest') || ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div>
        <span className="font-accent italic text-ocean text-base">step 4</span>
        <h2 className="font-display text-2xl font-bold text-navy mt-1 mb-1">What draws you to create?</h2>
        <p className="font-body text-secondary text-sm">Optional — share whatever feels right</p>
      </div>

      <GlassCard className="p-6">
        <label className="block mb-2">
          <span className="font-body text-xs font-semibold text-secondary uppercase tracking-widest">
            Your creative story
          </span>
        </label>
        <textarea
          placeholder="E.g., I've always wanted to paint but never felt confident. I'm looking for a space where I can explore without pressure…"
          {...register('creativeInterest')}
          rows={6}
          className="w-full bg-white/80 border border-primary/20 rounded-xl px-4 py-3 text-navy placeholder-navy/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all resize-none font-body"
        />
        <div className="text-xs text-secondary/60 mt-2 font-body text-right">
          {value.length} / 500
        </div>
      </GlassCard>

      <div className="flex items-start gap-3">
        <span className="text-2xl">🌿</span>
        <p className="font-body text-sm text-secondary leading-relaxed">
          Your story helps us make the experience more meaningful for you. There are no wrong answers — just share what's on your heart.
        </p>
      </div>
    </motion.div>
  )
}
