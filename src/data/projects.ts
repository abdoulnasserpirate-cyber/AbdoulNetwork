// Réalisations affichées dans la section « Du concret. »
// Pour ajouter un projet : dépose les fichiers dans public/images et public/videos,
// puis ajoute un objet dans la liste ci-dessous.

export type Category = 'motion' | 'video' | 'web' | 'apps' | 'ia' | 'tiktok'

export const categoryLabels: Record<Category, string> = {
  motion: 'Motion',
  video: 'Vidéo',
  web: 'Web',
  apps: 'Apps',
  ia: 'IA',
  tiktok: 'TikTok',
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
  /** Image complète affichée dans la modale (ex. une affiche carrée), si différente de la couverture. */
  image?: string
  /** Vidéo complète lue dans la modale. */
  video?: string
  /** Aperçu court et muet, joué au survol / à l'écran sur mobile. */
  preview?: string
  /** Lien externe (site, app…). Vide = pas de bouton. */
  link?: string
  /** Mis en avant : affiché en premier. */
  featured?: boolean
  /**
   * Projet de démonstration (maquette réalisée par Abdoul Network, sans client réel).
   * Affiche un badge « Concept ». Sources des maquettes : dossier mockups/.
   */
  concept?: boolean
  /** Bouton WhatsApp personnalisé dans la modale (sinon « Je veux pareil »). */
  cta?: { label: string; message: string }
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
    id: 'boutiko',
    title: 'Boutiko — app de gestion de boutique',
    summary: 'Ventes du jour, stock et reçus Mobile Money, dans une app simple pour les commerçants.',
    categories: ['apps'],
    cover: '/images/concept-app-boutiko.webp',
    video: '/videos/concept-app-boutiko.mp4',
    preview: '/videos/concept-app-boutiko.mp4',
    concept: true,
  },
  {
    id: 'assistant-ia',
    title: 'Assistant IA sur WhatsApp',
    summary: "Un assistant qui répond aux clients, vérifie le stock et enregistre les commandes, jour et nuit.",
    categories: ['ia', 'apps'],
    cover: '/images/concept-ia-assistant.webp',
    video: '/videos/concept-ia-assistant.mp4',
    preview: '/videos/concept-ia-assistant.mp4',
    concept: true,
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
  {
    id: 'academie-digitale',
    title: 'Académie Digitale — site de formation',
    summary: 'Un site rapide pour présenter des formations et recevoir les inscriptions, sur ordinateur comme sur mobile.',
    categories: ['web'],
    cover: '/images/concept-web-academie.webp',
    video: '/videos/concept-web-academie.mp4',
    preview: '/videos/concept-web-academie.mp4',
    concept: true,
  },
  {
    id: 'tiktok-contenu',
    title: 'Série TikTok — contenus courts qui accrochent',
    summary: 'Accroche forte, sous-titres dynamiques et appel à l’action : une série pensée pour arrêter le scroll.',
    categories: ['tiktok', 'video'],
    cover: '/images/concept-tiktok-contenu.webp',
    video: '/videos/concept-tiktok-contenu.mp4',
    preview: '/videos/concept-tiktok-contenu.mp4',
    concept: true,
  },
  {
    id: 'montage-reel',
    title: 'Montage d’un Reel — 3 outils IA',
    summary: 'Découpage, zooms, sous-titres karaoké et habillage sonore pour une vidéo verticale percutante.',
    categories: ['video'],
    cover: '/images/concept-montage-studio.webp',
    video: '/videos/concept-montage-studio.mp4',
    preview: '/videos/concept-montage-studio.mp4',
    concept: true,
  },
  {
    id: 'tiktok-monetisable',
    title: 'Création de compte TikTok monétisable',
    summary: 'Le visuel de mon offre : création de compte TikTok monétisable, à 5 000 FCFA.',
    categories: ['tiktok'],
    cover: '/images/tiktok-monetisable-cover.webp',
    image: '/images/tiktok-monetisable.webp',
    cta: {
      label: 'Je veux mon compte',
      message: "Bonjour Abdoul ! Je veux un compte TikTok monétisable (offre à 5 000 FCFA).",
    },
  },
]
