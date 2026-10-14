import type Lenis from 'lenis'

let instance: Lenis | null = null

export function setLenis(lenis: Lenis | null) {
  instance = lenis
}

export function getLenis() {
  return instance
}

/** Défilement fluide vers une ancre (#services…), avec repli natif. */
export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  if (instance) instance.scrollTo(el, { offset: 0 })
  else el.scrollIntoView({ behavior: 'smooth' })
}

export function lockScroll(lock: boolean) {
  document.documentElement.style.overflow = lock ? 'hidden' : ''
  if (instance) {
    if (lock) instance.stop()
    else instance.start()
  }
}
