import { useRef } from 'react'
import { motion, useAnimationFrame, useMotionValue, useScroll, useSpring, useTransform, useVelocity, useReducedMotion } from 'motion/react'

const words = ['Intelligence artificielle', 'Motion design', 'Vidéo', 'Web', 'Applications', 'TikTok', 'Formation']

const wrap = (min: number, max: number, v: number) => {
  const range = max - min
  return ((((v - min) % range) + range) % range) + min
}

function Row({ baseVelocity }: { baseVelocity: number }) {
  const reduced = useReducedMotion()
  const baseX = useMotionValue(0)
  const { scrollY } = useScroll()
  const velocity = useVelocity(scrollY)
  const smooth = useSpring(velocity, { damping: 50, stiffness: 300 })
  const factor = useTransform(smooth, [-2000, 0, 2000], [-2.5, 0, 2.5], { clamp: false })
  const direction = useRef(1)
  // Le contenu est dupliqué 2 fois : on boucle sur -50% → 0.
  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`)

  useAnimationFrame((_, delta) => {
    if (reduced) return
    let move = direction.current * baseVelocity * (delta / 1000)
    const f = factor.get()
    if (f < 0) direction.current = -1
    else if (f > 0) direction.current = 1
    move += direction.current * move * Math.abs(f)
    baseX.set(baseX.get() + move)
  })

  const items = [...words, ...words]

  return (
    <motion.div className="flex w-max whitespace-nowrap will-change-transform" style={{ x }}>
      {items.map((w, i) => (
        <span key={i} className="display flex items-center text-[clamp(3rem,10vw,9rem)] uppercase">
          <span className={i % 2 === 0 ? 'text-outline' : 'text-ink'}>{w}</span>
          <span className="mx-[0.35em] text-[0.45em] text-gradient">✦</span>
        </span>
      ))}
    </motion.div>
  )
}

export function Marquee() {
  return (
    <section aria-label="Domaines : intelligence artificielle, motion design, vidéo, web, applications, TikTok, formation" className="relative overflow-hidden border-y border-white/[0.06] py-8 sm:py-12">
      <div aria-hidden="true">
        <Row baseVelocity={-3} />
      </div>
    </section>
  )
}
