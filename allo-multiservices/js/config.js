/* ==========================================================================
   Allô Multi-Services Maradi — Données modifiables
   --------------------------------------------------------------------------
   Modifiez ici les numéros, l'adresse, le tarif ou l'affichage des services.
   Les pages HTML contiennent les mêmes valeurs en dur (pour le référencement
   et l'aperçu WhatsApp) : ce fichier les met à jour automatiquement à
   l'affichage. Pour un changement de numéro, pensez aussi aux balises
   <meta> des pages (recherche : 74 58 18 24).
   ========================================================================== */
window.ALLO_CONFIG = {
  marque: "Allô Multi-Services",
  ville: "Maradi",
  slogan: "Tous vos besoins, un seul appel.",
  contacts: {
    principal: "74 58 18 24",      // appel et WhatsApp
    whatsapp: "22774581824",       // format international, sans + ni espaces
    secondaires: ["88 57 92 90", "89 96 71 19"],
    indicatif: "+227"
  },
  adresse: "Maradi, quartier ADS",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Quartier+ADS+Maradi+Niger",
  disponibilite: "7 jours sur 7, week-end compris",
  tarif: "Livraison à partir de 500 F CFA selon la zone",
  servicesDomicile: { actif: true }   // à confirmer avec le client
};
