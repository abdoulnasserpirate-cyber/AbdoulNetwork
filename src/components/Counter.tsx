import { useEffect, useRef } from 'react'
import { animate, useInView, useReducedMotion } from 'motion/react'

type Props = { to: number; duration?: number; className?: string; prefix?: string; suffix?: string }

/** Compteur 0 → to, déclenché à l'apparition. Le texte final est présent dès le départ pour les lecteurs d'écran. */
export function Counter({ to, duration = 2, className, prefix = '', suffix = '' }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || !inView || reduced) return
    const controls = animate(0, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        el.textContent = `${prefix}${Math.round(v)}${suffix}`
      },
    })
    return () => controls.stop()
  }, [inView, reduced, to, duration, prefix, suffix])

  return (
    <span className={className}>
      <span className="sr-only">{`${prefix}${to}${suffix}`}</span>
      <span ref={ref} aria-hidden="true" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {reduced ? `${prefix}${to}${suffix}` : `${prefix}0${suffix}`}
      </span>
    </span>
  )
}
