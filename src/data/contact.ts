// Coordonnées et textes de contact — modifie ici, tout le site suit.
// Un lien vide ('') masque automatiquement l'élément correspondant.

export type SocialNetwork = 'tiktok' | 'instagram' | 'facebook' | 'youtube' | 'linkedin'

export const contact = {
  brand: 'Abdoul Network',
  fullName: 'Abdoul Nasser Oumarou',
  city: 'Maradi, Niger',
  /** Numéro WhatsApp au format international, sans + ni espaces. */
  whatsapp: '22796669998',
  /** Laisse vide pour masquer le lien e-mail. */
  email: '',
  /** Photo du Hero. Si le fichier est absent, un cadre « photo à ajouter » s'affiche. */
  photo: '/images/profile.webp',
  /** Seuls les réseaux avec une URL sont affichés dans le footer. */
  socials: [
    { network: 'tiktok', url: '' },
    { network: 'instagram', url: '' },
    { network: 'facebook', url: '' },
    { network: 'youtube', url: '' },
    { network: 'linkedin', url: '' },
  ] as { network: SocialNetwork; url: string }[],
}

/** Seule preuve sociale du site. Ne pas inventer d'autres chiffres. */
export const peopleTrained = 200

/** Messages WhatsApp préremplis. */
export const messages = {
  hero: "Bonjour Abdoul ! J'ai un projet et j'aimerais en parler avec toi.",
  nav: "Bonjour Abdoul ! Je viens de voir ton site, j'aimerais échanger avec toi.",
  training: "Bonjour Abdoul ! J'aimerais être formé(e) ou accompagné(e) sur l'IA et les outils digitaux.",
  contact: "Bonjour Abdoul ! Parlons de mon projet.",
  floating: "Bonjour Abdoul ! Je viens de ton site, parlons de mon projet.",
  service: (service: string) => `Bonjour Abdoul ! Je suis intéressé(e) par : ${service}. Parlons-en !`,
  project: (title: string) => `Bonjour Abdoul ! J'ai vu ta réalisation « ${title} » et je veux un projet similaire.`,
}
