import { useState } from 'react'
import { motion, type TargetAndTransition, type Transition } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { services, type IconMotion, type Service } from '../data/services'
import { messages } from '../data/contact'
import { waLink } from '../lib/whatsapp'
import { useAmbientMotion, useMediaQuery } from '../lib/hooks'
import { RevealText } from './RevealText'
import { FadeIn } from './FadeIn'

const sizeClass: Record<Service['size'], string> = {
  xl: 'col-span-2 md:row-span-2',
  wide: 'col-span-2',
  sm: 'col-span-1',
  banner: 'col-span-1 md:col-span-3',
}

const iconLoops: Record<IconMotion, { animate: TargetAndTransition; transition: Transition }> = {
  pulse: { animate: { scale: [1, 1.14, 1] }, transition: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } },
  spin: { animate: { rotate: 360 }, transition: { duration: 12, repeat: Infinity, ease: 'linear' } },
  tilt: { animate: { rotate: [0, -14, 0] }, transition: { duration: 0.9, repeat: Infinity, repeatDelay: 1.6, ease: 'easeInOut' } },
  float: { animate: { y: [0, -6, 0] }, transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } },
  shake: { animate: { rotate: [0, 9, -9, 0] }, transition: { duration: 0.7, repeat: Infinity, repeatDelay: 2.2 } },
  bounce: { animate: { y: [0, -9, 0] }, transition: { duration: 1, repeat: Infinity, repeatDelay: 1.4, ease: 'easeOut' } },
}

export function Services() {
  const [active, setActive] = useState<string | null>(null)
  const canHover = useMediaQuery('(hover: hover) and (pointer: fine)')

  return (
    <section id="services" className="relative scroll-mt-20 py-24 sm:py-32">
      <div className="container-x">
        <RevealText segments={[{ text: 'Ce que je' }, { text: 'crée.', gradient: true }]} className="display mb-12 text-[clamp(2.5rem,7vw,6rem)] sm:mb-16" />

        <div className="grid auto-rows-[200px] grid-cols-2 gap-3 sm:gap-4 md:auto-rows-[220px] md:grid-cols-4">
          {services.map((s, i) => (
            <FadeIn key={s.id} delay={i * 0.06} className={sizeClass[s.size]}>
              <Tile
                service={s}
                active={active === s.id}
                canHover={canHover}
                onActivate={() => setActive(s.id)}
                onDeactivate={() => setActive((cur) => (cur === s.id ? null : cur))}
                onToggle={() => setActive((cur) => (cur === s.id ? null : s.id))}
              />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

type TileProps = {
  service: Service
  active: boolean
  canHover: boolean
  onActivate: () => void
  onDeactivate: () => void
  onToggle: () => void
}

function Tile({ service, active, canHover, onActivate, onDeactivate, onToggle }: TileProps) {
  const ambient = useAmbientMotion()
  const Icon = service.icon
  const big = service.size === 'xl' || service.size === 'banner'
  const loop = iconLoops[service.iconMotion]
  const panelId = `service-${service.id}`

  return (
    <div
      className="group relative h-full overflow-hidden rounded-3xl border border-white/[0.07] bg-bg2/60"
      onPointerEnter={(e) => e.pointerType === 'mouse' && onActivate()}
      onPointerLeave={(e) => e.pointerType === 'mouse' && onDeactivate()}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) onDeactivate()
      }}
    >
      {/* Illumination */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        initial={false}
        animate={{ opacity: active ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background:
            'radial-gradient(120% 90% at 0% 0%, rgba(139,92,246,0.35), transparent 60%), radial-gradient(90% 80% at 100% 100%, rgba(34,211,238,0.25), transparent 60%)',
        }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-3xl border border-violet/60 shadow-[inset_0_0_40px_rgba(139,92,246,0.25)]"
        initial={false}
        animate={{ opacity: active ? 1 : 0 }}
      />

      {/* Icône géante décorative */}
      {big && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-10 -right-10 text-white/[0.05]"
          animate={ambient ? { rotate: 360 } : undefined}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        >
          <Icon strokeWidth={0.6} className="h-64 w-64 md:h-80 md:w-80" />
        </motion.div>
      )}

      {/* Contenu de base */}
      <div className="pointer-events-none relative flex h-full flex-col justify-between p-5 sm:p-6">
        <motion.div
          className={`grid place-items-center rounded-2xl bg-gradient-to-br from-violet/25 to-cyan/15 text-ink ring-1 ring-white/10 ${big ? 'h-14 w-14' : 'h-12 w-12'}`}
          animate={{ scale: active ? 0.8 : 1, opacity: active ? 0 : 1 }}
        >
          <motion.span className="grid place-items-center" {...(ambient ? loop : {})}>
            <Icon className={big ? 'h-7 w-7' : 'h-6 w-6'} strokeWidth={1.6} />
          </motion.span>
        </motion.div>
        <motion.h3
          className={`display leading-[1] ${big ? 'text-[clamp(1.6rem,3.6vw,2.75rem)]' : 'text-[1.2rem] sm:text-2xl'}`}
          animate={{ opacity: active ? 0 : 1, y: active ? -8 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {service.title}
        </motion.h3>
      </div>

      {/* Bascule (tap / clavier) */}
      <button
        type="button"
        className="absolute inset-0 z-10 rounded-3xl"
        aria-expanded={active}
        aria-controls={panelId}
        onClick={() => !canHover && onToggle()}
        onFocus={onActivate}
      >
        <span className="sr-only">{service.title}</span>
      </button>

      {/* Révélation */}
      <motion.div
        id={panelId}
        className={`absolute inset-0 z-20 flex flex-col justify-end p-5 sm:p-6 ${active ? '' : 'pointer-events-none'}`}
        initial={false}
        animate={{ opacity: active ? 1 : 0 }}
        transition={{ duration: 0.35 }}
        onClick={() => !canHover && onToggle()}
        aria-hidden={!active}
      >
        <motion.div initial={false} animate={{ y: active ? 0 : 16 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
          <p className={`display leading-none text-ink ${big ? 'text-2xl sm:text-3xl' : 'text-base sm:text-xl'}`}>{service.title}</p>
          <p className={`mt-2 text-ink/80 ${big ? 'text-base sm:text-lg' : 'text-[0.8rem] leading-snug sm:text-sm'}`}>{service.line}</p>
          <a
            href={waLink(messages.service(service.title))}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={active ? 0 : -1}
            onClick={(e) => e.stopPropagation()}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 text-xs font-semibold text-bg transition-transform hover:scale-105 active:scale-95 sm:mt-4 sm:px-4 sm:text-sm"
          >
            M'intéresse
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </motion.div>
      </motion.div>
    </div>
  )
}
