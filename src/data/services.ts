import type { LucideIcon } from 'lucide-react'
import { BrainCircuit, Clapperboard, Globe, GraduationCap, Orbit, Smartphone } from 'lucide-react'

export type IconMotion = 'pulse' | 'spin' | 'tilt' | 'float' | 'shake' | 'bounce'

export type Service = {
  id: string
  title: string
  /** 6 à 8 mots, affichés au survol / au tap. */
  line: string
  icon: LucideIcon
  iconMotion: IconMotion
  /** Visuel de fond de la tuile. */
  image: string
  /** Taille de la tuile dans la grille bento. */
  size: 'xl' | 'wide' | 'sm' | 'banner'
}

export const services: Service[] = [
  { id: 'ia', title: 'IA & automatisation', line: 'Des outils IA qui travaillent pour toi.', icon: BrainCircuit, iconMotion: 'pulse', image: '/images/concept-ia-assistant.webp', size: 'xl' },
  { id: 'motion', title: 'Motion design', line: "Des animations qui captent l'attention immédiatement.", icon: Orbit, iconMotion: 'spin', image: '/images/allo-multiservices-cover.webp', size: 'wide' },
  { id: 'video', title: 'Montage vidéo', line: 'Des vidéos rythmées, prêtes à publier.', icon: Clapperboard, iconMotion: 'tilt', image: '/images/concept-montage-studio.webp', size: 'sm' },
  { id: 'web', title: 'Sites web', line: 'Des sites rapides, beaux et efficaces.', icon: Globe, iconMotion: 'float', image: '/images/concept-web-academie.webp', size: 'sm' },
  { id: 'apps', title: 'Applications', line: 'Des applis simples pour ton activité.', icon: Smartphone, iconMotion: 'shake', image: '/images/concept-app-boutiko.webp', size: 'sm' },
  { id: 'tiktok', title: 'TikTok & formation', line: 'Grandir sur TikTok et maîtriser les outils.', icon: GraduationCap, iconMotion: 'bounce', image: '/images/formation-3.webp', size: 'banner' },
]
