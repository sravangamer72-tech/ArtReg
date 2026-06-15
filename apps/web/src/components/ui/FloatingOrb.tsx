import { motion } from 'framer-motion'

interface FloatingOrbProps {
  delay?: number
  duration?: number
  size?: number
  className?: string
}

export default function FloatingOrb({
  delay = 0,
  duration = 6,
  size = 300,
  className = '',
}: FloatingOrbProps) {
  return (
    <motion.div
      animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
      className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
      style={{ width: size, height: size }}
    />
  )
}
