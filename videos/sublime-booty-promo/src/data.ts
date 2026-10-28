// Toutes les données de la pub au même endroit : changer un prix ici suffit.

export const BRAND = {
  name: "Sublime Booty ByChris",
  city: "Maradi, Niger",
  slogan: "Ton corps. Ton royaume.",
  logo: "logos/sublime-booty-logo.png",
};

export const PROMO = {
  title: "GRANDE PROMO",
  dates: "DU 1ER AU 8 NOVEMBRE",
  datesShort: "Du 1er au 8 novembre",
  days: 8,
};

export type Kit = {
  id: string;
  name: string;
  composition: string;
  price: number;
  oldPrice: number;
};

export const KITS_FESSIER: Kit[] = [
  { id: "sexy-lady", name: "Kit Sexy Lady", composition: "crème VIP + savon + petit sirop", price: 18000, oldPrice: 25000 },
  { id: "curves", name: "Kit Curves", composition: "crème VIP + savon + sirop + céréales Booty Gain", price: 43000, oldPrice: 55000 },
  { id: "skinny", name: "Kit Skinny Pro Max", composition: "sirop prise de poids + crème VIP + savon + sirop Sexy Lady", price: 39000, oldPrice: 50000 },
  { id: "morpho-simple", name: "Kit Morphologie V Simple", composition: "crème impériale + suppositoire + savon", price: 45000, oldPrice: 55000 },
  { id: "morpho-royale", name: "Kit Morphologie V Royale", composition: "crème impériale + céréales Booty Gain + suppositoire + savon fessier", price: 62000, oldPrice: 80000 },
  { id: "booster", name: "Kit Booster Ultra Dosé", composition: "crème impériale + suppositoire + savon + céréales + sirop", price: 70000, oldPrice: 90000 },
];

export const KIT_VEDETTE: Kit = {
  id: "amaria",
  name: "Kit Spécial Amaria",
  composition: "crème + savon + sirop + céréales + suppositoire + kit luxe gros lolo",
  price: 100000,
  oldPrice: 130000,
};

export const KITS_SEINS: Kit[] = [
  { id: "gros-lolo", name: "Kit Gros Lolo Luxe", composition: "2 sirops seins + crème seins", price: 25000, oldPrice: 30000 },
  { id: "raffermissant", name: "Kit Raffermissant Luxe", composition: "thé Caolin + huile raffermissante", price: 24000, oldPrice: 30000 },
];

export const KITS_MINCEUR: Kit[] = [
  { id: "ventre-plat", name: "Thé Ventre Plat + Crème", composition: "", price: 20000, oldPrice: 24000 },
  { id: "perte-poids", name: "Thé Perte de Poids", composition: "", price: 10000, oldPrice: 12000 },
];

export const TIRAGE = {
  title: "GRAND TIRAGE AU SORT",
  subtitle: "À la fin de la promo, gagnez un kit offert !",
  min: 50000,
  max: 200000,
  badge: "TOUS FRAIS PAYÉS",
};

export const PAIEMENT = {
  logos: [
    { name: "NITA", src: "logos/pay-nita.png", bg: "#FFFFFF" },
    { name: "AMANA", src: "logos/pay-amana.jpg", bg: "#FFFFFF" },
    { name: "Wave", src: "logos/pay-wave.jpg", bg: "#1DC8FF" },
    { name: "Western Union", src: "logos/pay-western-union.png", bg: "#FFDD00" },
    { name: "Ria", src: "logos/pay-ria.png", bg: "#FF6B00" },
  ],
  numero: "227 92 48 56 12",
  titulaire: "Mehou Loko Christelle",
};

export const LIVRAISON = {
  title: "LIVRAISON DISCRÈTE",
  subtitle: "Rapide et sécurisée, partout au Niger",
  tarifs: [
    { zone: "Maradi", prix: "1 000 F CFA" },
    { zone: "Autres villes du Niger", prix: "1 500 F CFA" },
  ],
};

export const WHATSAPP = {
  numero: "+227 92 48 56 12",
  cta: "COMMANDEZ MAINTENANT",
};

// Mannequins (photos fournies, jamais retouchées). `curve` = tracé des hanches
// en coordonnées normalisées (0–1) de l'image, pour la ligne lumineuse.
export type Model = {
  src: string;
  w: number;
  h: number;
  focusY: number; // centre du cadrage vertical (0 = haut)
  curves: [number, number][][];
};

export const MODELS: Record<string, Model> = {
  pullBordeaux: {
    src: "images/mannequin-pull-bordeaux.jpg",
    w: 736,
    h: 920,
    focusY: 0.35,
    curves: [],
  },
  robeRougeEpaules: {
    src: "images/mannequin-robe-rouge-epaules.png",
    w: 1121,
    h: 1403,
    focusY: 0.5,
    curves: [
      [[0.6, 0.3], [0.63, 0.44], [0.6, 0.5], [0.68, 0.62], [0.66, 0.75], [0.6, 0.88]],
      [[0.4, 0.3], [0.375, 0.42], [0.375, 0.5], [0.33, 0.62], [0.35, 0.75], [0.4, 0.88]],
    ],
  },
  robeRougeFleur: {
    src: "images/mannequin-robe-rouge-fleur.jpg",
    w: 736,
    h: 1462,
    focusY: 0.45,
    curves: [
      [[0.6, 0.2], [0.66, 0.28], [0.68, 0.4], [0.76, 0.5], [0.73, 0.62], [0.67, 0.78]],
      [[0.38, 0.2], [0.33, 0.28], [0.32, 0.4], [0.27, 0.5], [0.29, 0.62], [0.35, 0.78]],
    ],
  },
  robeBordeaux: {
    src: "images/mannequin-robe-bordeaux.jpg",
    w: 864,
    h: 1080,
    focusY: 0.5,
    curves: [
      [[0.58, 0.32], [0.6, 0.44], [0.59, 0.52], [0.65, 0.64], [0.63, 0.75], [0.6, 0.86]],
      [[0.41, 0.32], [0.38, 0.44], [0.385, 0.52], [0.37, 0.64], [0.39, 0.75], [0.41, 0.86]],
    ],
  },
};

export const COLORS = {
  black: "#000000",
  ink: "#0A0006",
  magenta: "#E0006F",
  pink: "#FF3D9A",
  gold: "#F2C46D",
  goldLight: "#FFE7AE",
  goldDark: "#E9B85C",
  yellow: "#FFE14D",
  white: "#FFFFFF",
};

export const GOLD_GRADIENT = `linear-gradient(180deg, ${COLORS.goldLight} 0%, ${COLORS.gold} 45%, ${COLORS.goldDark} 100%)`;

// Audio : la voix off fournie contient déjà sa musique de fond.
// Pour ajouter une musique séparée, déposer public/audio/musique.mp3 et mettre le nom ici.
export const AUDIO = {
  voice: "audio/voix.mp3",
  music: null as string | null,
  musicVolume: 0.35,
  musicDuckedVolume: 0.15,
  tailSeconds: 1.5,
};

export const formatPrice = (n: number) =>
  `${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ")}F`;
