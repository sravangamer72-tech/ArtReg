import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'

interface Ripple { id: number; x: number; y: number }

/*
  Chain of 6 blobs — each one spring-follows the one ahead of it (not the cursor
  directly). This creates compound lag: blob 2 is always a little behind blob 1,
  blob 3 a little behind blob 2, etc. The result looks like liquid flowing.

  The SVG gooey filter (blur → alpha threshold) makes overlapping blobs merge
  into one connected liquid shape. When cursor moves fast and blobs separate,
  they look like individual droplets flowing in sequence.
*/

// accent=#4CA0C2 (76,160,194)  ocean=#16537E (22,83,126)  navy=#0D2B45 (13,43,69)
const BLOBS = [
  { size: 28, alpha: 0.55 },
  { size: 22, alpha: 0.48 },
  { size: 17, alpha: 0.40 },
  { size: 13, alpha: 0.32 },
  { size: 10, alpha: 0.24 },
  { size: 7,  alpha: 0.16 },
]

export default function WaterCursor() {
  const mx = useMotionValue(-200)
  const my = useMotionValue(-200)

  // Each spring targets the OUTPUT of the previous spring (chained, not all targeting cursor)
  const x1 = useSpring(mx, { damping: 28, stiffness: 380 })
  const y1 = useSpring(my, { damping: 28, stiffness: 380 })
  const x2 = useSpring(x1, { damping: 24, stiffness: 280 })
  const y2 = useSpring(y1, { damping: 24, stiffness: 280 })
  const x3 = useSpring(x2, { damping: 21, stiffness: 210 })
  const y3 = useSpring(y2, { damping: 21, stiffness: 210 })
  const x4 = useSpring(x3, { damping: 18, stiffness: 155 })
  const y4 = useSpring(y3, { damping: 18, stiffness: 155 })
  const x5 = useSpring(x4, { damping: 16, stiffness: 115 })
  const y5 = useSpring(y4, { damping: 16, stiffness: 115 })
  const x6 = useSpring(x5, { damping: 14, stiffness: 85 })
  const y6 = useSpring(y5, { damping: 14, stiffness: 85 })

  const chain = [
    [x1, y1], [x2, y2], [x3, y3],
    [x4, y4], [x5, y5], [x6, y6],
  ] as const

  const [ripples, setRipples] = useState<Ripple[]>([])
  const uid = useRef(0)

  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return

    const style = document.createElement('style')
    style.textContent = '*, *::before, *::after { cursor: none !important; }'
    document.head.appendChild(style)

    const onMove = (e: MouseEvent) => {
      mx.set(e.clientX)
      my.set(e.clientY)
    }

    const onDown = (e: MouseEvent) => {
      const id = ++uid.current
      setRipples(r => [...r, { id, x: e.clientX, y: e.clientY }])
      setTimeout(() => setRipples(r => r.filter(rip => rip.id !== id)), 1500)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mousedown', onDown)

    return () => {
      style.remove()
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onDown)
    }
  }, [])

  return (
    <>
      {/*
        The gooey filter lives here as a 0×0 SVG so it's in the DOM but invisible.
        feGaussianBlur softens all the blobs together.
        feColorMatrix amplifies + thresholds the alpha channel:
          - where two blurred blobs overlap their alphas add → above threshold → merged solid
          - at the edges → below threshold → transparent
        Result: blobs merge into liquid when close, separate into droplets when far.
      */}
      <svg
        style={{ position: 'fixed', width: 0, height: 0, overflow: 'hidden' }}
        aria-hidden="true"
      >
        <defs>
          <filter id="water-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 22 -9"
            />
          </filter>
        </defs>
      </svg>

      {/* Ripples — outside the goo filter so they stay crisp rings */}
      <AnimatePresence>
        {ripples.flatMap(({ id, x, y }) =>
          [0, 1, 2].map(i => (
            <motion.div
              key={`${id}-${i}`}
              className="fixed pointer-events-none rounded-full"
              style={{
                zIndex: 9990 + i,
                left: x,
                top: y,
                transform: 'translate(-50%, -50%)',
                /* accent color #4CA0C2 */
                border: `${1.4 - i * 0.35}px solid rgba(76,160,194,${0.60 - i * 0.14})`,
              }}
              initial={{ width: 0, height: 0, opacity: 1 }}
              animate={{
                width:   [90, 130, 188][i],
                height:  [90, 130, 188][i],
                opacity: 0,
              }}
              exit={{}}
              transition={{
                duration: [0.7, 1.0, 1.4][i],
                delay: i * 0.1,
                ease: 'easeOut',
              }}
            />
          ))
        )}
      </AnimatePresence>

      {/*
        All blobs share ONE container so the gooey filter processes them together.
        If they were in separate containers the filter wouldn't merge them.
      */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 9997, filter: 'url(#water-goo)' }}
      >
        {chain.map(([x, y], i) => {
          const { size, alpha } = BLOBS[i]
          return (
            <motion.div
              key={i}
              style={{
                position: 'absolute',
                x,
                y,
                width: size,
                height: size,
                marginLeft: -size / 2,
                marginTop:  -size / 2,
                borderRadius: '50%',
                /*
                  Highlight → accent #4CA0C2 → ocean #16537E → navy #0D2B45
                  The highlight is a pale tint of accent so it reads as water catching light.
                */
                background: `radial-gradient(
                  circle at 36% 30%,
                  rgba(196,228,242,${alpha})        0%,
                  rgba(76,160,194,${alpha})         40%,
                  rgba(22,83,126,${alpha * 0.88})  72%,
                  rgba(13,43,69,${alpha * 0.72})   100%
                )`,
              }}
            />
          )
        })}
      </div>

      {/* Tiny dot at exact cursor — no lag, shows the precise click target */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{ x: mx, y: my }}
      >
        <div
          style={{
            position: 'absolute',
            width: 4,
            height: 4,
            left: -2,
            top: -2,
            borderRadius: '50%',
            background: 'rgba(76,160,194,0.96)', /* accent #4CA0C2 */
          }}
        />
      </motion.div>
    </>
  )
}
