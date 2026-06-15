import { motion } from 'framer-motion'
import { useFormContext } from 'react-hook-form'
import GlassCard from '@/components/ui/GlassCard'
import { Mail, Phone } from 'lucide-react'

export default function Step2Contact() {
  const { register, formState: { errors }, watch } = useFormContext()
  const email = watch('email')
  const phone = watch('phone')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div>
        <span className="font-accent italic text-ocean text-base">step 2</span>
        <h2 className="font-display text-2xl font-bold text-navy mt-1 mb-1">How can we reach you?</h2>
        <p className="font-body text-secondary text-sm">We'll send your experience pass and updates here</p>
      </div>

      {/* Email */}
      <GlassCard className="p-6">
        <label className="block mb-2">
          <span className="font-body text-xs font-semibold text-secondary uppercase tracking-widest flex items-center gap-2">
            <Mail size={13} /> Email Address
          </span>
        </label>
        <input
          type="email"
          placeholder="your@email.com"
          {...register('email')}
          className="w-full bg-white/80 border border-primary/20 rounded-xl px-4 py-3 text-navy placeholder-navy/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-body"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-2 font-body">{errors.email.message as string}</p>
        )}
        {email && !errors.email && (
          <p className="text-success text-sm mt-2 font-body">✓ Looks good</p>
        )}
      </GlassCard>

      {/* Phone */}
      <GlassCard className="p-6">
        <label className="block mb-2">
          <span className="font-body text-xs font-semibold text-secondary uppercase tracking-widest flex items-center gap-2">
            <Phone size={13} /> Phone Number
          </span>
        </label>
        <div className="flex gap-2">
          <div className="bg-surface border border-primary/20 rounded-xl px-4 py-3 font-body text-secondary text-sm flex items-center">
            +91
          </div>
          <input
            type="tel"
            placeholder="9876543210"
            {...register('phone')}
            maxLength={10}
            className="flex-1 bg-white/80 border border-primary/20 rounded-xl px-4 py-3 text-navy placeholder-navy/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-body"
          />
        </div>
        {errors.phone && (
          <p className="text-red-500 text-sm mt-2 font-body">{errors.phone.message as string}</p>
        )}
        {phone && phone.length === 10 && !errors.phone && (
          <p className="text-success text-sm mt-2 font-body">✓ Valid number</p>
        )}
      </GlassCard>

      <div className="flex items-center gap-2 text-sm text-secondary font-body">
        <span>🔒</span>
        <span>Your details are private and only used for experience communications</span>
      </div>
    </motion.div>
  )
}
