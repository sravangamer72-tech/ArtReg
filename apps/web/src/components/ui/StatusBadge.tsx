import type { Registration } from '@art-workshop/shared'

interface StatusBadgeProps {
  status: Registration['payment_status']
  className?: string
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const styles = {
    paid: 'bg-green-500/20 text-green-400 border border-green-500/30',
    pending: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    failed: 'bg-red-500/20 text-red-400 border border-red-500/30',
  }

  const label = {
    paid: 'Paid',
    pending: 'Pending',
    failed: 'Failed',
  }

  return (
    <span
      className={`
        text-xs font-bold uppercase px-3 py-1 rounded-full inline-flex items-center gap-1
        ${styles[status]}
        ${className}
      `}
    >
      <div className="w-2 h-2 rounded-full bg-current" />
      {label[status]}
    </span>
  )
}
