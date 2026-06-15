import { Check } from 'lucide-react'

interface ProgressStepsProps {
  current: number
  steps?: string[]
}

export default function ProgressSteps({
  current,
  steps = ['Your Details', 'Payment', 'Confirmation'],
}: ProgressStepsProps) {
  return (
    <div className="flex items-center justify-center">
      {steps.map((label, i) => {
        const n = i + 1
        const done = n < current
        const active = n === current

        return (
          <div key={n} className="flex items-center">
            {/* Step circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-body font-semibold transition-all ${
                  done
                    ? 'bg-[#0D2B45] text-white'
                    : active
                    ? 'bg-[#0D2B45] text-white'
                    : 'border-2 border-gray-300 text-gray-400 bg-white'
                }`}
              >
                {done ? <Check size={15} strokeWidth={2.5} /> : n}
              </div>
              <span
                className={`mt-2 font-body text-[11px] font-medium whitespace-nowrap ${
                  active ? 'text-navy' : done ? 'text-navy/70' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
            </div>

            {/* Connector line */}
            {i < steps.length - 1 && (
              <div
                className={`h-0.5 mx-1 mb-5 transition-colors ${
                  n < current ? 'bg-[#0D2B45]' : 'bg-gray-200'
                }`}
                style={{ width: '4rem' }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
