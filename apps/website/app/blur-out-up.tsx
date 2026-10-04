'use client'

// Adapted from SmoothUI blur-out-up; source and MIT notice: ../vendor/smoothui/.
import { motion, useReducedMotion } from 'motion/react'

export function BlurOutUp({
  children,
  delay = 500,
}: {
  children: string
  delay?: number
}) {
  const reduced = useReducedMotion()
  const words = children.split(' ')

  return (
    <span>
      <span className="sr-only">{children}</span>
      {words.map((word, index) => (
        <motion.span
          animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
          aria-hidden="true"
          className="inline-block whitespace-pre motion-reduce:transform-none! motion-reduce:opacity-100! motion-reduce:filter-none!"
          initial={{ filter: 'blur(6px)', opacity: 0, y: 10 }}
          key={`${index}-${word}`}
          transition={
            reduced
              ? { duration: 0 }
              : {
                  delay: (delay + index * 28) / 1000,
                  duration: 0.56,
                  ease: [0.22, 1, 0.36, 1],
                }
          }
        >
          {word}
          {index < words.length - 1 ? ' ' : ''}
        </motion.span>
      ))}
    </span>
  )
}
