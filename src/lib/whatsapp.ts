import { contact } from '../data/contact'

/** Unique point d'entrée pour tous les liens WhatsApp du site. */
export function waLink(message: string): string {
  return `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(message)}`
}
