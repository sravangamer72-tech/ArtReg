import { motion } from 'framer-motion'
import { useFormContext } from 'react-hook-form'
import GlassCard from '@/components/ui/GlassCard'

export default function Step1Name() {
  const { register, formState: { errors } } = useFormContext()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div>
        <span className="font-accent italic text-ocean text-base">step 1</span>
        <h2 className="font-display text-2xl font-bold text-navy mt-1 mb-1">What shall we call you?</h2>
        <p className="font-body text-secondary text-sm">Your name will appear on your experience pass</p>
      </div>

      <GlassCard className="p-6">
        <label className="block mb-2">
          <span className="font-body text-xs font-semibold text-secondary uppercase tracking-widest">Full Name</span>
        </label>
        <input
          type="text"
          placeholder="e.g. Priya Sharma"
          {...register('fullName')}
          className="w-full bg-white/80 border border-primary/20 rounded-xl px-4 py-3 text-navy placeholder-navy/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-body"
        />
        {errors.fullName && (
          <p className="text-red-500 text-sm mt-2 font-body">{errors.fullName.message as string}</p>
        )}
      </GlassCard>

      <div className="flex items-center gap-2 text-sm text-secondary font-body">
        <span>🌊</span>
        <span>Use your full name as you'd like it on your experience pass</span>
      </div>
    </motion.div>
  )
}
