import { type MouseEvent, useEffect, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { Menu, X } from 'lucide-react'
import { contact, messages } from '../data/contact'
import { waLink } from '../lib/whatsapp'
import { scrollToId } from '../lib/scroll'
import { WhatsAppIcon } from './WhatsAppIcon'

const links = [
  { id: 'services', label: 'Services' },
  { id: 'realisations', label: 'Réalisations' },
  { id: 'contact', label: 'Contact' },
]

export function Navbar() {
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 24))

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const go = (id: string) => (e: MouseEvent) => {
    e.preventDefault()
    setOpen(false)
    scrollToId(id)
  }

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div
        className={`transition-[background-color,border-color] duration-500 ${
          open
            ? 'border-b border-white/[0.06] bg-bg/95 backdrop-blur-xl'
            : scrolled
              ? 'border-b border-white/[0.06] bg-bg/75 backdrop-blur-xl'
              : 'border-b border-transparent'
        }`}
      >
        <nav className="container-x flex h-16 items-center justify-between gap-4 sm:h-20" aria-label="Navigation principale">
          <a href="#top" onClick={go('top')} className="display flex items-center gap-2 whitespace-nowrap text-base tracking-tight sm:text-xl">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-violet to-cyan text-sm font-bold text-bg">A</span>
            <span>
              Abdoul<span className="text-muted"> Network</span>
            </span>
          </a>

          <ul className="hidden items-center gap-8 text-sm text-muted md:flex">
            {links.map((l) => (
              <li key={l.id}>
                <a href={`#${l.id}`} onClick={go(l.id)} className="transition-colors hover:text-ink">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <a
              href={waLink(messages.nav)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-ink px-3 py-2.5 text-sm sm:px-4 font-semibold text-bg transition-transform hover:scale-[1.04] active:scale-95"
            >
              <WhatsAppIcon className="h-4 w-4" />
              <span className="max-[379px]:sr-only">WhatsApp</span>
            </a>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-ink md:hidden"
              aria-expanded={open}
              aria-controls="menu-mobile"
              aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {open && (
            <motion.ul
              id="menu-mobile"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="container-x flex flex-col pb-6 md:hidden"
            >
              {links.map((l, i) => (
                <motion.li
                  key={l.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                >
                  <a href={`#${l.id}`} onClick={go(l.id)} className="display block py-3 text-3xl">
                    {l.label}
                  </a>
                </motion.li>
              ))}
              <li className="pt-2 text-sm text-muted">{contact.city}</li>
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  )
}
