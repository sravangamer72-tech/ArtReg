import { motion } from 'framer-motion'

interface StepIndicatorProps {
  currentStep: number
  totalSteps?: number
}

export default function StepIndicator({ currentStep, totalSteps = 5 }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <motion.div
          key={index}
          initial={false}
          animate={{
            width: index === currentStep - 1 ? 32 : 12,
            backgroundColor:
              index < currentStep - 1
                ? '#1B4F72'
                : index === currentStep - 1
                  ? '#2E86AB'
                  : 'rgba(27,79,114,0.15)',
          }}
          transition={{ duration: 0.3 }}
          className="h-2 rounded-full"
        />
      ))}
    </div>
  )
}
