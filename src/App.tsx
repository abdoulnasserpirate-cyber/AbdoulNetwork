import { MotionConfig } from 'motion/react'
import { SmoothScroll } from './components/SmoothScroll'
import { Cursor } from './components/Cursor'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { Marquee } from './components/Marquee'
import { Services } from './components/Services'
import { Work } from './components/Work'
import { Trained } from './components/Trained'
import { Contact } from './components/Contact'
import { FloatingWhatsApp } from './components/FloatingWhatsApp'

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll />
      <Cursor />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-bg"
      >
        Aller au contenu
      </a>
      <Navbar />
      <main id="main">
        <Hero />
        <Marquee />
        <Services />
        <Work />
        <Trained />
        <Contact />
      </main>
      <FloatingWhatsApp />
      <div className="grain" aria-hidden="true" />
    </MotionConfig>
  )
}
