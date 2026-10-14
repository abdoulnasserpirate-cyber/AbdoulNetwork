import { type ReactNode, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { ArrowDown, ImagePlus } from 'lucide-react'
import { contact, messages, peopleTrained } from '../data/contact'
import { waLink } from '../lib/whatsapp'
import { scrollToId } from '../lib/scroll'
import { useAmbientMotion, useRichEffects } from '../lib/hooks'
import { RevealText } from './RevealText'
import { Magnetic } from './Magnetic'
import { Counter } from './Counter'
import { WhatsAppIcon } from './WhatsAppIcon'

const ease = [0.22, 1, 0.36, 1] as const

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const rich = useRichEffects()
  const ambient = useAmbientMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })

  const photoY = useTransform(scrollYProgress, [0, 1], [0, rich ? 120 : 40])
  const shapesY = useTransform(scrollYProgress, [0, 1], [0, rich ? -220 : 0])
  const shapesY2 = useTransform(scrollYProgress, [0, 1], [0, rich ? 160 : 0])
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <section ref={ref} id="top" className="relative isolate flex min-h-[100svh] items-center overflow-hidden pb-16 pt-28 sm:pt-32">
      <Background ambient={ambient} />

      {/* Formes flottantes */}
      <motion.div aria-hidden="true" style={{ y: shapesY }} className="pointer-events-none absolute inset-0 -z-10">
        <Float ambient={ambient} className="absolute left-[6%] top-[22%] hidden h-3 w-3 sm:block rounded-full bg-cyan shadow-[0_0_24px_4px_rgba(34,211,238,0.6)]" />
        <Float ambient={ambient} delay={1.2} className="absolute right-[8%] top-[16%] hidden h-20 w-20 rounded-full border border-violet/40 md:block" />
        <Float ambient={ambient} delay={0.6} className="absolute bottom-[14%] left-[46%] hidden h-10 w-10 rotate-12 rounded-xl border border-cyan/30 lg:block" />
      </motion.div>
      <motion.div aria-hidden="true" style={{ y: shapesY2 }} className="pointer-events-none absolute inset-0 -z-10">
        <Float ambient={ambient} delay={2} className="display absolute right-[44%] top-[12%] hidden text-3xl text-violet/70 lg:block">
          ✦
        </Float>
        <Float ambient={ambient} delay={0.3} className="absolute bottom-[22%] right-[4%] h-2 w-2 rounded-full bg-violet shadow-[0_0_20px_4px_rgba(139,92,246,0.6)]" />
      </motion.div>

      <motion.div style={{ opacity: rich ? fade : 1 }} className="container-x grid w-full items-center gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease }}
            className="glass mb-7 inline-flex items-center gap-3 rounded-full py-1.5 pl-1.5 pr-4 text-sm"
          >
            <span className="relative grid h-7 place-items-center rounded-full bg-gradient-to-r from-violet to-cyan px-3 font-semibold text-bg">
              <Counter to={peopleTrained} prefix="+" duration={2.2} />
            </span>
            <span className="text-ink/85">personnes formées</span>
          </motion.div>

          <RevealText
            as="h1"
            inView={false}
            delay={0.35}
            className="display text-[clamp(2.75rem,8.6vw,7.25rem)]"
            segments={[{ text: 'Je transforme tes idées en' }, { text: 'expériences digitales.', gradient: true }]}
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.1 }}
            className="mt-6 font-display text-base tracking-wide text-muted sm:text-lg"
          >
            IA <span className="text-violet">·</span> Vidéo <span className="text-violet">·</span> Web{' '}
            <span className="text-violet">·</span> Applications
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.25, ease }}
            className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"
          >
            <Magnetic>
              <a
                href={waLink(messages.hero)}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-full bg-gradient-to-r from-violet to-cyan px-7 py-4 font-semibold text-bg shadow-[0_10px_40px_-10px_rgba(139,92,246,0.8)] transition-transform active:scale-95 sm:w-auto"
              >
                <WhatsAppIcon className="h-5 w-5" />
                Parlons de ton projet
              </a>
            </Magnetic>
            <a
              href="#realisations"
              onClick={(e) => {
                e.preventDefault()
                scrollToId('realisations')
              }}
              className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-7 py-4 font-medium text-ink transition-colors hover:border-white/40 hover:bg-white/5"
            >
              Voir mes réalisations
              <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
            </a>
          </motion.div>
        </div>

        <motion.div style={{ y: photoY }} className="relative mx-auto w-full max-w-[19rem] sm:max-w-sm lg:col-span-5 lg:max-w-md">
          <Portrait ambient={ambient} />
        </motion.div>
      </motion.div>
    </section>
  )
}

function Portrait({ ambient }: { ambient: boolean }) {
  const [failed, setFailed] = useState(!contact.photo)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, delay: 0.5, ease }}
      className="relative"
    >
      {/* Halo qui respire */}
      <motion.div
        aria-hidden="true"
        className="absolute -inset-10 -z-10 rounded-full"
        style={{
          background:
            'radial-gradient(closest-side at 35% 40%, rgba(139,92,246,0.55), transparent 70%), radial-gradient(closest-side at 70% 70%, rgba(34,211,238,0.4), transparent 70%)',
        }}
        animate={ambient ? { scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] } : undefined}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="relative rounded-[2rem] bg-gradient-to-br from-violet/70 via-white/10 to-cyan/70 p-px">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[calc(2rem-1px)] bg-bg2">
          {failed ? (
            <div className="grid h-full place-items-center p-6 text-center text-sm text-muted">
              <div>
                <ImagePlus className="mx-auto mb-3 h-8 w-8 text-violet" />
                Photo à ajouter
                <br />
                <code className="text-xs text-ink/70">public/images/profile.webp</code>
              </div>
            </div>
          ) : (
            <img
              src={contact.photo}
              alt={contact.fullName}
              width={720}
              height={1080}
              fetchPriority="high"
              onError={() => setFailed(true)}
              className="h-full w-full object-cover object-top"
            />
          )}
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-bg/80 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs">
            <span className="glass rounded-full px-3 py-1.5 text-ink/90">{contact.fullName}</span>
            <span className="flex items-center gap-1.5 text-ink/80">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan" />
              {contact.city.split(',')[0]}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function Background({ ambient }: { ambient: boolean }) {
  const loop = (x: number[], y: number[], duration: number) =>
    ambient ? { animate: { x, y }, transition: { duration, repeat: Infinity, repeatType: 'mirror' as const, ease: 'easeInOut' as const } } : {}

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-20 overflow-hidden">
      <motion.div
        {...loop([0, 120, -40], [0, 60, 120], 22)}
        className="absolute -left-[20%] -top-[20%] h-[70vmax] w-[70vmax] rounded-full"
        style={{ background: 'radial-gradient(closest-side, rgba(139,92,246,0.32), transparent 70%)', willChange: 'transform' }}
      />
      <motion.div
        {...loop([0, -140, 40], [0, -80, 40], 26)}
        className="absolute -bottom-[30%] -right-[20%] h-[65vmax] w-[65vmax] rounded-full"
        style={{ background: 'radial-gradient(closest-side, rgba(34,211,238,0.22), transparent 70%)', willChange: 'transform' }}
      />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage: 'radial-gradient(ellipse at 50% 40%, black 10%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 40%, black 10%, transparent 70%)',
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bg to-transparent" />
    </div>
  )
}

function Float({ className, delay = 0, ambient, children }: { className: string; delay?: number; ambient: boolean; children?: ReactNode }) {
  return (
    <motion.div
      className={className}
      animate={ambient ? { y: [0, -18, 0] } : undefined}
      transition={{ duration: 7, delay, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  )
}
