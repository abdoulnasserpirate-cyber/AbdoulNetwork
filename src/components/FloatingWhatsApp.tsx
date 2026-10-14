import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { messages } from '../data/contact'
import { waLink } from '../lib/whatsapp'
import { WhatsAppIcon } from './WhatsAppIcon'

/** Bouton WhatsApp flottant, mobile uniquement : apparaît après le Hero, se retire sur la section Contact. */
export function FloatingWhatsApp() {
  const { scrollY } = useScroll()
  const [pastHero, setPastHero] = useState(false)
  const [atContact, setAtContact] = useState(false)

  useMotionValueEvent(scrollY, 'change', (v) => setPastHero(v > window.innerHeight * 0.85))

  useEffect(() => {
    const el = document.getElementById('contact')
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setAtContact(entry.isIntersecting), { threshold: 0.25 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const show = pastHero && !atContact

  return (
    <AnimatePresence>
      {show && (
        <motion.a
          href={waLink(messages.floating)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Discuter sur WhatsApp"
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          transition={{ type: 'spring', stiffness: 380, damping: 26 }}
          className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-4 z-50 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-violet to-cyan text-bg shadow-[0_10px_30px_-5px_rgba(139,92,246,0.8)] md:hidden"
        >
          <WhatsAppIcon className="h-7 w-7" />
        </motion.a>
      )}
    </AnimatePresence>
  )
}
