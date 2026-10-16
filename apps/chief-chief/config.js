/* ============================================================
   Chief-Chief — configuration
   Tout ce que le restaurant modifie au quotidien est ici :
   numéro WhatsApp, horaires, promo, fermeture, zones, menu.
   ============================================================ */
window.CC_CONFIG = {
  // Numéro WhatsApp au format international, chiffres uniquement (ex : 22790000000).
  // ⚠️ À REMPLACER par le vrai numéro du restaurant.
  WHATSAPP_NUMBER: "227XXXXXXXX",
  WHATSAPP_DISPLAY: "+227 XX XX XX XX",

  // Fuseau horaire du restaurant (Maradi, Niger).
  TIMEZONE: "Africa/Niamey",

  // Horaires de prise de commande (heures pleines, 24 h).
  OPEN_HOUR: 8,
  CLOSE_HOUR: 22,
  // À partir de cette heure, le tarif de nuit des zones s'applique.
  NIGHT_HOUR: 21,

  // Date d'ouverture des commandes (AAAA-MM-JJ). null = déjà ouvert.
  ORDER_OPEN_DATE: null,

  // Fermeture exceptionnelle : mettre la date du jour (AAAA-MM-JJ) pour fermer ce jour-là.
  CLOSED_DATES: [],
  CLOSED_MESSAGE: "Fermé aujourd'hui, reprise demain.",

  // Promo -15 % : active entre ces deux dates incluses (AAAA-MM-JJ).
  PROMO: {
    active: true,
    percent: 15,
    from: "2026-01-01",
    until: "2026-12-31",
    label: "Pizzas, Poulet Complet, Formules",
    targetSection: "formules"
  },

  // Messages du bandeau noir (changent toutes les 4 s).
  TICKER: [
    "🛵 Livraison rapide à domicile",
    "💳 Paiement à la livraison",
    "🎉 -15 % sur les Pizzas, le Poulet Complet et les Formules",
    "🕗 Commandes de 8h à 22h"
  ],

  // Zones de livraison : prix de jour / prix de nuit (après NIGHT_HOUR).
  // ⚠️ Noms et tarifs à confirmer par le restaurant.
  ZONES: [
    { id: "z1", name: "Centre-ville", day: 500, night: 700 },
    { id: "z2", name: "Quartiers proches", day: 700, night: 1000 },
    { id: "z3", name: "Quartiers éloignés", day: 1000, night: 1300 },
    { id: "z4", name: "Périphérie", day: 1500, night: 2000 },
    { id: "z5", name: "Hors ville (environs)", day: 2000, night: 2500 }
  ],

  SAUCES: ["Arachide", "Tomate", "Gombo", "Feuilles"],

  // Carrousel du hero : photo + accroche affichée en même temps.
  CAROUSEL: [
    { img: "img/plat-du-chef.webp", title: "Le Plat du Chef", hook: "Fast-food généreux, fait maison" },
    { img: "img/pizza.webp", title: "Pizzas", hook: "Des pizzas qui débordent de garniture" },
    { img: "img/poulet-frites.webp", title: "Poulet croustillant", hook: "Croustillant dehors, fondant dedans" },
    { img: "img/riz-creole.webp", title: "Riz créole", hook: "Le goût qui vous ramène toujours" }
  ],

  /* Menu.
     badge : "populaire" | "nouveau" | "epice" | "leger"
     promo : true → -PROMO.percent % quand la promo est active
     available : false → plat grisé, non commandable
     variants : [{ label, price }] → le prix de base est celui de la 1re variante
     sauce : true → choix de sauce obligatoire (gratuite)
     img : photo (sinon une vignette illustrée avec l'emoji est affichée)
     ⚠️ Prix d'exemple : à vérifier par le restaurant. */
  SIGNATURE: {
    id: "plat-du-chef",
    name: "Le Plat du Chef",
    desc: "La composition signature de la maison Chief-Chief : riz sauté, viande tendre, haricots verts, carottes et olives.",
    price: 3500,
    img: "img/plat-du-chef.webp",
    thumb: "img/plat-du-chef-thumb.webp",
    emoji: "⭐"
  },

  CATEGORIES: [
    {
      id: "formules", name: "Formules", emoji: "🍱",
      items: [
        { id: "f-chinchard", name: "Formule Chinchard", desc: "Chinchard frit, attiéké ou frites, salade et boisson.", price: 3000, promo: true, badge: "populaire", emoji: "🐟" },
        { id: "f-poulet", name: "Formule Poulet", desc: "Quart de poulet croustillant, frites et boisson.", price: 3000, promo: true, emoji: "🍗", img: "img/poulet-frites.webp", thumb: "img/poulet-frites-thumb.webp" },
        { id: "f-chawarma", name: "Formule Chawarma", desc: "Chawarma viande, frites et boisson.", price: 2500, promo: true, badge: "nouveau", emoji: "🌯" },
        { id: "f-pizza", name: "Formule Pizza Solo", desc: "Petite pizza au choix et boisson.", price: 3500, promo: true, emoji: "🍕", img: "img/pizza.webp", thumb: "img/pizza-thumb.webp" }
      ]
    },
    {
      id: "pizzas", name: "Pizzas", emoji: "🍕",
      items: [
        { id: "p-reine", name: "Pizza Reine", desc: "Sauce tomate, fromage, jambon de bœuf, champignons.", promo: true, badge: "populaire", emoji: "🍕", img: "img/pizza.webp", thumb: "img/pizza-thumb.webp",
          variants: [{ label: "Moyenne", price: 5000 }, { label: "Grande", price: 7000 }] },
        { id: "p-pizza", name: "Pizza au choix", desc: "Six recettes maison, généreusement garnies.", promo: true, emoji: "🍕", img: "img/pizza.webp", thumb: "img/pizza-thumb.webp",
          variants: [
            { label: "Margherita", price: 4000 }, { label: "Viande", price: 5000 }, { label: "Poulet", price: 5000 },
            { label: "Thon", price: 5000 }, { label: "Végétarienne", price: 4500 }, { label: "Chief-Chief", price: 6000 }
          ] },
        { id: "p-epicee", name: "Pizza Pimentée", desc: "Viande hachée, piments frais, oignons, poivrons.", promo: true, badge: "epice", emoji: "🌶️", price: 5500 }
      ]
    },
    {
      id: "poulet", name: "Poulet", emoji: "🍗",
      items: [
        { id: "po-complet", name: "Poulet Complet", desc: "Poulet entier croustillant, frites et sauce maison.", price: 8000, promo: true, badge: "populaire", emoji: "🍗", img: "img/poulet-frites.webp", thumb: "img/poulet-frites-thumb.webp" },
        { id: "po-demi", name: "Demi-poulet frites", desc: "Demi-poulet croustillant et frites dorées.", price: 4500, emoji: "🍗", img: "img/poulet-frites.webp", thumb: "img/poulet-frites-thumb.webp" },
        { id: "po-ailes", name: "Ailes épicées (8 pcs)", desc: "Ailes marinées et grillées, sauce piquante.", price: 3000, badge: "epice", emoji: "🔥" }
      ]
    },
    {
      id: "plats", name: "Riz & Plats", emoji: "🍛",
      items: [
        { id: "r-creole", name: "Riz créole", desc: "Riz aux vermicelles dorés, œuf, persil, viande au choix.", price: 2500, emoji: "🍚", img: "img/riz-creole.webp", thumb: "img/riz-creole-thumb.webp", sauce: true },
        { id: "r-carpe", name: "Carpe braisée", desc: "Carpe braisée aux épices, attiéké ou riz.", emoji: "🐟", badge: "populaire",
          variants: [{ label: "Demi", price: 3000 }, { label: "1 kg", price: 5500 }, { label: "2 kg", price: 10000 }] },
        { id: "r-pate", name: "Pâte africaine", desc: "Pâte de mil ou de maïs, servie avec sa sauce.", price: 1500, emoji: "🥣", sauce: true },
        { id: "r-gras", name: "Riz au gras", desc: "Riz cuisiné à la tomate et à la viande.", price: 2000, emoji: "🍛", available: false }
      ]
    },
    {
      id: "sandwichs", name: "Sandwichs", emoji: "🥪",
      items: [
        { id: "s-chawarma", name: "Chawarma viande", desc: "Galette, viande grillée, crudités, sauce blanche.", price: 2000, badge: "populaire", emoji: "🌯" },
        { id: "s-chawarma-p", name: "Chawarma poulet", desc: "Galette, poulet mariné, crudités, sauce blanche.", price: 2000, emoji: "🌯" },
        { id: "s-burger", name: "Burger Chief", desc: "Steak haché, fromage, oignons, tomate, frites.", price: 2500, badge: "nouveau", emoji: "🍔" }
      ]
    },
    {
      id: "salades", name: "Salades", emoji: "🥗",
      items: [
        { id: "sa-compo", name: "Salade composée", desc: "Laitue, tomate, concombre, œuf, maïs, vinaigrette.", price: 1500, badge: "leger", emoji: "🥗" },
        { id: "sa-poulet", name: "Salade poulet", desc: "Salade composée et lamelles de poulet grillé.", price: 2500, badge: "leger", emoji: "🥗" }
      ]
    },
    {
      id: "boissons", name: "Boissons", emoji: "🥤",
      items: [
        { id: "b-bissap", name: "Jus de bissap", desc: "Fait maison, bien frais.", price: 500, emoji: "🧃" },
        { id: "b-gingembre", name: "Jus de gingembre", desc: "Fait maison, relevé.", price: 500, badge: "epice", emoji: "🧃" },
        { id: "b-soda", name: "Soda (33 cl)", desc: "Coca, Fanta ou Sprite.", price: 500, emoji: "🥤" },
        { id: "b-eau", name: "Eau minérale", desc: "Bouteille 1,5 L.", price: 500, emoji: "💧" }
      ]
    }
  ]
};
