import React from 'react'

interface GlassCardProps {
  children?: React.ReactNode
  className?: string
  onClick?: () => void
}

export default function GlassCard({ children, className = '', onClick }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white/60 backdrop-blur-xl border border-[rgba(27,79,114,0.15)] rounded-2xl ${className}`}
    >
      {children}
    </div>
  )
}
