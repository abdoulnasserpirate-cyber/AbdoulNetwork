import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'
import { useRichEffects } from '../lib/hooks'

const INTERACTIVE = 'a, button, [role="button"], [data-cursor]'

/** Curseur discret : point précis + anneau qui suit et grossit sur les éléments cliquables. Desktop uniquement. */
export function Cursor() {
  const enabled = useRichEffects()
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const rx = useSpring(x, { stiffness: 350, damping: 32, mass: 0.6 })
  const ry = useSpring(y, { stiffness: 350, damping: 32, mass: 0.6 })
  const [hover, setHover] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!enabled) return
    document.documentElement.classList.add('custom-cursor')
    const move = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      setVisible(true)
      const t = e.target as Element | null
      setHover(!!t?.closest?.(INTERACTIVE))
    }
    const leave = () => setVisible(false)
    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerleave', leave)
    return () => {
      document.documentElement.classList.remove('custom-cursor')
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerleave', leave)
    }
  }, [enabled, x, y])

  if (!enabled) return null

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[90]">
      <motion.div
        className="absolute left-0 top-0 h-10 w-10 rounded-full border border-white/50"
        style={{ x: rx, y: ry, translateX: '-50%', translateY: '-50%' }}
        animate={{ scale: hover ? 1.8 : 1, opacity: visible ? (hover ? 0.9 : 0.5) : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      />
      <motion.div
        className="absolute left-0 top-0 h-1.5 w-1.5 rounded-full bg-cyan"
        style={{ x, y, translateX: '-50%', translateY: '-50%' }}
        animate={{ opacity: visible ? 1 : 0, scale: hover ? 0 : 1 }}
      />
    </div>
  )
}
