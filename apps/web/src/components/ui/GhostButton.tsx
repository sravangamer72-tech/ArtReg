import React from 'react'
import { motion } from 'framer-motion'

interface GhostButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

export default function GhostButton({
  children,
  onClick,
  disabled = false,
  className = '',
  type = 'button',
}: GhostButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`
        px-6 py-3 rounded-full font-semibold text-primary
        border-2 border-primary/30
        hover:border-primary/60 hover:bg-primary/5
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-300
        flex items-center justify-center gap-2
        ${className}
      `}
    >
      {children}
    </motion.button>
  )
}
