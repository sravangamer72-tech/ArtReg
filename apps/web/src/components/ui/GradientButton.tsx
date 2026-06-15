import React from 'react'
import { motion } from 'framer-motion'
import { Loader } from 'lucide-react'

interface GradientButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

export default function GradientButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  className = '',
  type = 'button',
}: GradientButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`
        relative px-6 py-3 rounded-full font-semibold text-white
        bg-gradient-to-r from-primary to-ocean
        shadow-ocean
        hover:shadow-ocean-lg
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-300
        flex items-center justify-center gap-2
        ${className}
      `}
    >
      {loading && <Loader size={18} className="animate-spin" />}
      {children}
    </motion.button>
  )
}
