import { useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches,
  )
  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])
  return matches
}

/** Vrai uniquement sur desktop avec souris : active curseur, magnétisme, parallaxe forte. */
export function useRichEffects(): boolean {
  const fine = useMediaQuery('(hover: hover) and (pointer: fine) and (min-width: 1024px)')
  const reduced = useReducedMotion()
  return fine && !reduced
}

/** Vrai si l'utilisateur accepte les animations en boucle. */
export function useAmbientMotion(): boolean {
  return !useReducedMotion()
}
