// Réalisations affichées dans la section « Du concret. »
// Pour ajouter un projet : dépose les fichiers dans public/images et public/videos,
// puis ajoute un objet dans la liste ci-dessous.

export type Category = 'motion' | 'video' | 'web' | 'apps' | 'ia'

export const categoryLabels: Record<Category, string> = {
  motion: 'Motion',
  video: 'Vidéo',
  web: 'Web',
  apps: 'Apps',
  ia: 'IA',
}

export type Project = {
  id: string
  title: string
  /** Une seule phrase, affichée dans la modale. */
  summary: string
  /** Un projet peut apparaître dans plusieurs filtres. */
  categories: Category[]
  /** Image WebP (obligatoire) — sert aussi de poster aux vidéos. */
  cover: string
  /** Vidéo complète (avec son) lue dans la modale. */
  video?: string
  /** Aperçu court et muet, joué au survol / à l'écran sur mobile. */
  preview?: string
  /** Lien externe (site, app…). Vide = pas de bouton. */
  link?: string
  /** Mis en avant : carte plus grande. */
  featured?: boolean
}

export const projects: Project[] = [
  {
    id: 'chief-chief',
    title: 'Chief Chief — commande WhatsApp pour restaurant',
    summary: 'Les clients choisissent leurs plats en ligne, la commande arrive sur WhatsApp.',
    categories: ['web', 'motion', 'video'],
    cover: '/images/chief-chief-cover.webp',
    video: '/videos/chief-chief.mp4',
    preview: '/videos/chief-chief-preview.mp4',
    link: 'https://chiefchiefrestaurant.com',
    featured: true,
  },
  {
    id: 'allo-multiservices',
    title: 'Allô Multiservices — publicité motion',
    summary: 'Une pub animée et rythmée pour un service de livraison à Maradi.',
    categories: ['motion', 'video'],
    cover: '/images/allo-multiservices-cover.webp',
    video: '/videos/allo-multiservices.mp4',
    preview: '/videos/allo-multiservices-preview.mp4',
  },
]
