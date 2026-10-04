'use client'

import { motion as motionTokens } from '@vidro/design-system'
import { useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'

export function AnimatedNumber({ value }: { value: number }) {
  const reducedMotion = useReducedMotion()
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (reducedMotion) {
      setDisplay(value)
      return
    }

    const start = performance.now()
    const duration = motionTokens.duration.normal * 1000 * 3
    let frame = 0

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration)
      const eased = 1 - (1 - progress) ** 3
      setDisplay(Math.round(value * eased))
      if (progress < 1) {
        frame = requestAnimationFrame(tick)
      }
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [reducedMotion, value])

  return <span className="tabular-nums">{display}</span>
}
