import { motion } from 'motion/react'
import { Mail } from 'lucide-react'
import { contact, messages } from '../data/contact'
import { waLink } from '../lib/whatsapp'
import { useAmbientMotion } from '../lib/hooks'
import { RevealText } from './RevealText'
import { Magnetic } from './Magnetic'
import { FadeIn } from './FadeIn'
import { WhatsAppIcon } from './WhatsAppIcon'
import { SocialIcon } from './SocialIcon'

export function Contact() {
  const ambient = useAmbientMotion()
  const socials = contact.socials.filter((s) => s.url.trim())

  return (
    <section id="contact" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden pt-24">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-[70%]"
        style={{ background: 'radial-gradient(70% 60% at 50% 100%, rgba(34,211,238,0.16), transparent 70%), radial-gradient(50% 50% at 50% 70%, rgba(139,92,246,0.2), transparent 70%)' }}
      />

      <div className="container-x flex flex-1 flex-col items-center justify-center text-center">
        <RevealText
          segments={[{ text: 'Parlons de ton' }, { text: 'projet.', gradient: true }]}
          className="display text-[clamp(3rem,11vw,10rem)]"
        />

        <FadeIn delay={0.2} className="mt-14 sm:mt-16">
          <Magnetic strength={0.4}>
            <a
              href={waLink(messages.contact)}
              target="_blank"
              rel="noopener noreferrer"
              className="relative inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-violet to-cyan px-9 py-6 text-lg font-semibold text-bg active:scale-95 sm:gap-4 sm:px-14 sm:py-8 sm:text-2xl"
            >
              {ambient &&
                [0, 1.2].map((d) => (
                  <motion.span
                    key={d}
                    aria-hidden="true"
                    className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-violet to-cyan"
                    initial={{ opacity: 0.55, scale: 1 }}
                    animate={{ opacity: 0, scale: 1.45 }}
                    transition={{ duration: 2.4, delay: d, repeat: Infinity, ease: 'easeOut' }}
                  />
                ))}
              <span aria-hidden="true" className="absolute inset-0 -z-10 rounded-full shadow-[0_0_80px_-5px_rgba(139,92,246,0.9)]" />
              <WhatsAppIcon className="h-6 w-6 sm:h-8 sm:w-8" />
              Écris-moi sur WhatsApp
            </a>
          </Magnetic>
        </FadeIn>

        {contact.email && (
          <FadeIn delay={0.35} className="mt-8">
            <a href={`mailto:${contact.email}`} className="inline-flex items-center gap-2 text-sm text-muted underline-offset-4 hover:text-ink hover:underline">
              <Mail className="h-4 w-4" />
              {contact.email}
            </a>
          </FadeIn>
        )}
      </div>

      <footer className="container-x mt-20 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] py-6 text-sm text-muted sm:flex-row">
        <p>
          © {new Date().getFullYear()} {contact.brand} · {contact.city}
        </p>
        {socials.length > 0 && (
          <ul className="flex items-center gap-2">
            {socials.map((s) => (
              <li key={s.network}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.network}
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-ink/80 transition-colors hover:border-white/30 hover:text-ink"
                >
                  <SocialIcon network={s.network} />
                </a>
              </li>
            ))}
          </ul>
        )}
      </footer>
    </section>
  )
}
