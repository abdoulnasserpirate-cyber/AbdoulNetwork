import { motion } from 'motion/react'
import type { ElementType } from 'react'

export type Segment = { text: string; gradient?: boolean }

type Props = {
  segments: Segment[] | string
  as?: ElementType
  className?: string
  delay?: number
  stagger?: number
  /** Déclenche à l'apparition (sinon au montage). */
  inView?: boolean
}

/** Titre révélé mot par mot : chaque mot glisse hors d'un masque. */
export function RevealText({ segments, as: Tag = 'h2', className, delay = 0, stagger = 0.07, inView = true }: Props) {
  const segs: Segment[] = typeof segments === 'string' ? [{ text: segments }] : segments
  const words = segs.flatMap((s) => s.text.split(' ').filter(Boolean).map((w) => ({ w, gradient: s.gradient })))
  const label = segs.map((s) => s.text).join(' ')

  const trigger = inView
    ? { initial: 'hidden', whileInView: 'show', viewport: { once: true, margin: '0px 0px -10% 0px' } }
    : { initial: 'hidden', animate: 'show' }

  return (
    <Tag className={className} aria-label={label}>
      <motion.span className="block" {...trigger} transition={{ staggerChildren: stagger, delayChildren: delay }}>
        {words.map(({ w, gradient }, i) => (
          <span key={i} aria-hidden="true" className="-mb-[0.2em] inline-block overflow-hidden pb-[0.2em] align-top">
            <motion.span
              className={`inline-block ${gradient ? 'text-gradient' : ''}`}
              variants={{
                hidden: { y: '110%', opacity: 0 },
                show: { y: '0%', opacity: 1, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
              }}
            >
              {w}
            </motion.span>
            {i < words.length - 1 && ' '}
          </span>
        ))}
      </motion.span>
    </Tag>
  )
}
