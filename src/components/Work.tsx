import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion, useInView, useReducedMotion } from 'motion/react'
import { ArrowUpRight, Play, X } from 'lucide-react'
import { categoryLabels, projects, type Category, type Project } from '../data/projects'
import { messages } from '../data/contact'
import { waLink } from '../lib/whatsapp'
import { lockScroll } from '../lib/scroll'
import { useMediaQuery } from '../lib/hooks'
import { RevealText } from './RevealText'
import { WhatsAppIcon } from './WhatsAppIcon'

type Filter = 'all' | Category
const order: Category[] = ['motion', 'video', 'web', 'apps', 'ia', 'tiktok']
const ease = [0.22, 1, 0.36, 1] as const

export function Work() {
  const [filter, setFilter] = useState<Filter>('all')
  const [selected, setSelected] = useState<Project | null>(null)
  const lastFocus = useRef<HTMLElement | null>(null)

  // Filtres sans projet masqués automatiquement.
  const filters = useMemo<Filter[]>(() => ['all', ...order.filter((c) => projects.some((p) => p.categories.includes(c)))], [])
  const visible = filter === 'all' ? projects : projects.filter((p) => p.categories.includes(filter))
  // Projets mis en avant d'abord.
  const sorted = [...visible].sort((a, b) => Number(!!b.featured) - Number(!!a.featured))

  const open = (p: Project) => {
    lastFocus.current = document.activeElement as HTMLElement
    setSelected(p)
  }
  const close = () => {
    setSelected(null)
    requestAnimationFrame(() => lastFocus.current?.focus())
  }

  return (
    <section id="realisations" className="relative scroll-mt-20 py-24 sm:py-32">
      <div className="container-x">
        <div className="mb-10 flex flex-col gap-8 md:mb-14 md:flex-row md:items-end md:justify-between">
          <RevealText segments={[{ text: 'Du' }, { text: 'concret.', gradient: true }]} className="display text-[clamp(2.5rem,7vw,6rem)]" />

          {filters.length > 2 && (
            <div role="group" aria-label="Filtrer les réalisations" className="flex flex-wrap gap-2">
              {filters.map((f) => {
                const on = f === filter
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    aria-pressed={on}
                    className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${on ? 'text-bg' : 'text-muted hover:text-ink'}`}
                  >
                    {on && (
                      <motion.span layoutId="filter-pill" className="absolute inset-0 -z-0 rounded-full bg-ink" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
                    )}
                    {!on && <span className="absolute inset-0 rounded-full border border-white/10" />}
                    <span className="relative">{f === 'all' ? 'Tout' : categoryLabels[f]}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <LayoutGroup>
          <motion.ul layout className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-6">
            <AnimatePresence mode="popLayout" initial={false}>
              {sorted.map((p, i) => (
                <Card key={p.id} project={p} index={i} onOpen={() => open(p)} hidden={selected?.id === p.id} />
              ))}
            </AnimatePresence>
          </motion.ul>

          <AnimatePresence>{selected && <Modal key={selected.id} project={selected} onClose={close} />}</AnimatePresence>
        </LayoutGroup>
      </div>
    </section>
  )
}

// Grille asymétrique : 7/5 puis 5/7, la colonne étroite décalée vers le bas.
const spans = ['md:col-span-7', 'md:col-span-5 md:mt-20', 'md:col-span-5 md:mt-20', 'md:col-span-7']

function Card({ project, index, onOpen, hidden }: { project: Project; index: number; onOpen: () => void; hidden: boolean }) {
  const ref = useRef<HTMLLIElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const reduced = useReducedMotion()
  const canHover = useMediaQuery('(hover: hover) and (pointer: fine)')
  const inView = useInView(ref, { amount: 0.6 })
  const [hover, setHover] = useState(false)
  const [playing, setPlaying] = useState(false)
  const active = canHover ? hover : inView
  const big = index % 4 === 0 || index % 4 === 3

  useEffect(() => {
    const v = videoRef.current
    if (!v || !project.preview) return
    if (active && !reduced && !hidden) {
      v.play().catch(() => {})
    } else {
      v.pause()
    }
  }, [active, reduced, hidden, project.preview])

  return (
    <motion.li
      ref={ref}
      layout
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.5, ease }}
      className={spans[index % spans.length]}
    >
      <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '0px 0px -10% 0px' }} transition={{ duration: 0.9, ease }}>
        <button
          type="button"
          onClick={onOpen}
          onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(true)}
          onPointerLeave={(e) => e.pointerType === 'mouse' && setHover(false)}
          onFocus={() => setHover(true)}
          onBlur={() => setHover(false)}
          className="group block w-full text-left"
          aria-label={`Voir la réalisation : ${project.title}`}
          data-cursor
        >
          <motion.div
            layoutId={`media-${project.id}`}
            className={`relative overflow-hidden rounded-3xl bg-bg2 ring-1 ring-white/[0.08] ${big ? 'aspect-[16/10]' : 'aspect-[4/3]'}`}
          >
            <img
              src={project.cover}
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.04]"
            />
            {project.preview && (
              <video
                ref={videoRef}
                src={project.preview}
                muted
                loop
                playsInline
                preload="none"
                aria-hidden="true"
                onPlaying={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${playing ? 'opacity-100' : 'opacity-0'}`}
              />
            )}
            <div
              className={`absolute inset-0 flex items-end bg-gradient-to-t from-bg/90 via-bg/20 to-transparent p-5 transition-opacity duration-500 sm:p-7 ${active ? 'opacity-100' : 'opacity-0'}`}
            >
              <div className={`flex w-full items-end justify-between gap-4 transition-transform duration-500 ${active ? 'translate-y-0' : 'translate-y-3'}`}>
                <h3 className="display text-xl leading-tight sm:text-3xl">{project.title}</h3>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink text-bg">
                  <ArrowUpRight className="h-5 w-5" />
                </span>
              </div>
            </div>
            {project.video && !active && (
              <span className="glass absolute left-4 top-4 grid h-9 w-9 place-items-center rounded-full">
                <Play className="h-4 w-4 fill-current" />
              </span>
            )}
            {project.concept && <ConceptBadge className="absolute right-4 top-4" />}
          </motion.div>
        </button>
      </motion.div>
    </motion.li>
  )
}

function Modal({ project, onClose }: { project: Project; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    lockScroll(true)
    closeRef.current?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab' && panelRef.current) {
        const items = panelRef.current.querySelectorAll<HTMLElement>('a[href], button, video[controls]')
        if (!items.length) return
        const first = items[0]
        const last = items[items.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      lockScroll(false)
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-labelledby={`modal-${project.id}`}>
      <motion.div
        className="absolute inset-0 bg-bg/85 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-y-auto p-4 sm:p-8" data-lenis-prevent>
        <div ref={panelRef} className="pointer-events-auto relative w-full max-w-5xl">
          <div className="mb-3 flex justify-end">
            <motion.button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1, transition: { delay: 0.3 } }}
              exit={{ opacity: 0, scale: 0.6 }}
              className="grid h-11 w-11 place-items-center rounded-full bg-ink text-bg"
            >
              <X className="h-5 w-5" />
            </motion.button>
          </div>
          <motion.div
            layoutId={`media-${project.id}`}
            className={`relative overflow-hidden rounded-3xl bg-black ring-1 ring-white/10 ${
              project.image && !project.video ? 'mx-auto aspect-square w-full max-w-[min(100%,68vh)]' : 'aspect-video'
            }`}
            transition={{ duration: 0.6, ease }}
          >
            {project.video ? (
              <video
                src={project.video}
                poster={project.cover}
                controls
                autoPlay
                playsInline
                loop={project.concept}
                muted={project.concept}
                preload="metadata"
                className="h-full w-full object-contain"
              />
            ) : (
              <img src={project.image ?? project.cover} alt={project.title} className="h-full w-full object-contain" />
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.25, duration: 0.5, ease } }}
            exit={{ opacity: 0, y: 10, transition: { duration: 0.2 } }}
            className="mt-6 flex flex-col gap-5 md:flex-row md:items-end md:justify-between"
          >
            <div className="max-w-2xl">
              {project.concept && <ConceptBadge className="mb-3" />}
              <h3 id={`modal-${project.id}`} className="display text-2xl leading-tight sm:text-4xl">
                {project.title}
              </h3>
              <p className="mt-2 text-muted">{project.summary}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-bg transition-transform hover:scale-105"
                >
                  Voir le site <ArrowUpRight className="h-4 w-4" />
                </a>
              )}
              <a
                href={waLink(project.cta?.message ?? messages.project(project.title))}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-medium transition-colors hover:bg-white/5"
              >
                <WhatsAppIcon className="h-4 w-4" /> {project.cta?.label ?? 'Je veux pareil'}
              </a>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  )
}

/** Projet de démonstration : maquette réalisée par Abdoul Network, sans client réel. */
function ConceptBadge({ className = '' }: { className?: string }) {
  return (
    <span
      title="Projet de démonstration réalisé par Abdoul Network"
      className={`inline-flex items-center rounded-full border border-white/20 bg-bg/70 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/90 backdrop-blur ${className}`}
    >
      Concept
    </span>
  )
}
