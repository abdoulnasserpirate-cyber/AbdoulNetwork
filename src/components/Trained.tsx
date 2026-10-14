import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { messages, peopleTrained } from '../data/contact'
import { waLink } from '../lib/whatsapp'
import { useRichEffects } from '../lib/hooks'
import { Counter } from './Counter'
import { FadeIn } from './FadeIn'
import { Magnetic } from './Magnetic'

const photos = [
  { src: '/images/formation-1.webp', alt: 'Abdoul Nasser animant une formation sur ChatGPT et l’art du prompt' },
  { src: '/images/formation-2.webp', alt: 'Abdoul Nasser devant des participants en formation' },
  { src: '/images/studio.webp', alt: 'Abdoul Nasser en studio, face au micro' },
]

export function Trained() {
  const ref = useRef<HTMLElement>(null)
  const rich = useRichEffects()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y1 = useTransform(scrollYProgress, [0, 1], [rich ? 140 : 0, rich ? -140 : 0])
  const y2 = useTransform(scrollYProgress, [0, 1], [rich ? -80 : 0, rich ? 120 : 0])
  const y3 = useTransform(scrollYProgress, [0, 1], [rich ? 200 : 0, rich ? -60 : 0])

  return (
    <section ref={ref} id="formation" className="relative isolate flex min-h-[100svh] items-center overflow-hidden py-24">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{ background: 'radial-gradient(60% 50% at 50% 50%, rgba(139,92,246,0.18), transparent 70%)' }}
      />

      {/* Photos de formation flottantes (desktop) */}
      <div className="pointer-events-none absolute inset-0 -z-10 hidden lg:block">
        <motion.figure style={{ y: y1 }} className="absolute left-[3%] top-[14%] w-[22vw] max-w-[340px] -rotate-6">
          <Photo {...photos[0]} />
        </motion.figure>
        <motion.figure style={{ y: y2 }} className="absolute bottom-[10%] right-[3%] w-[24vw] max-w-[360px] rotate-[5deg]">
          <Photo {...photos[1]} />
        </motion.figure>
        <motion.figure style={{ y: y3 }} className="absolute right-[8%] top-[8%] w-[14vw] max-w-[220px] rotate-[8deg] opacity-80">
          <Photo {...photos[2]} />
        </motion.figure>
      </div>

      <div className="container-x text-center">
        <h2 className="display text-gradient text-[clamp(6.5rem,32vw,20rem)] leading-[0.85]">
          <Counter to={peopleTrained} suffix="+" duration={2.4} />
        </h2>
        <FadeIn delay={0.15}>
          <p className="display mx-auto mt-4 max-w-2xl text-[clamp(1.5rem,4vw,2.75rem)] leading-tight">
            personnes formées à l’IA et aux outils digitaux.
          </p>
        </FadeIn>
        <FadeIn delay={0.3}>
          <p className="mx-auto mt-5 max-w-md text-muted sm:text-lg">Créatif, technique, et toujours orienté résultat.</p>
        </FadeIn>
        <FadeIn delay={0.45} className="mt-10 flex justify-center">
          <Magnetic>
            <a
              href={waLink(messages.training)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-violet/50 bg-violet/10 px-7 py-4 font-semibold text-ink shadow-[0_0_40px_-10px_rgba(139,92,246,0.9)] transition-colors hover:bg-violet/25 active:scale-95"
            >
              Me former / être accompagné
            </a>
          </Magnetic>
        </FadeIn>

        {/* Version mobile / tablette des photos */}
        <FadeIn delay={0.2} className="mt-14 lg:hidden">
          <div className="mx-auto grid max-w-xl grid-cols-2 gap-3">
            <figure className="-rotate-3">
              <Photo {...photos[0]} />
            </figure>
            <figure className="mt-6 rotate-3">
              <Photo {...photos[1]} />
            </figure>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

function Photo({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="overflow-hidden rounded-2xl ring-1 ring-white/10 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)]">
      <img src={src} alt={alt} loading="lazy" decoding="async" className="aspect-[4/3] h-full w-full object-cover" />
    </div>
  )
}
