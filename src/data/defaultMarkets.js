export const DEFAULT_MARKETS = [
  {
    id: 'vestimentaire',
    nom: 'Mode & Vestimentaire',
    slug: 'vestimentaire',
    icone: '🛍️',
    couleurPrimaire: '#0066FF',
    couleurPrimaireHover: '#0052cc',
    couleurAccent: '#FFB800',
    couleurHeroBg: 'linear-gradient(135deg, #ffffff 0%, #f4f8ff 50%, #fffbf0 100%)',
    heroTitre: 'Le style pur.\nBlanc, Bleu & Jaune.',
    heroSousTitre: "Découvrez l'univers 7 Shop : sous-vêtements (boxers, chaussettes, débardeurs), tapettes, pull-overs, ceintures, pantalons, coupes oversize et casquettes. Des matières sélectionnées pour une tenue impeccable au quotidien.",
    heroImageUrl: '/images/hero-model.png?v=5',
    heroImageAlt: 'Modèle 7 Shop - Collection Mode Urbaine',
    heroImageWidth: '480px',
    heroImageHeight: '500px',
    heroImageObjectFit: 'contain',
    categories: [
      "Boxers",
      "Chaussettes",
      "Débardeurs",
      "Tapettes",
      "Pull-overs",
      "Ceintures",
      "Pantalons",
      "Oversizes",
      "Casquettes"
    ],
    products: []
  },
  {
    id: 'alimentation-generale',
    nom: 'Alimentation Générale',
    slug: 'alimentation-generale',
    icone: '🌾',
    couleurPrimaire: '#EAB308', // 🟡 Jaune dynamique / Solaire
    couleurPrimaireHover: '#CA8A04',
    couleurAccent: '#0066FF',
    couleurHeroBg: 'linear-gradient(135deg, #ffffff 0%, #fffbeb 50%, #fef3c7 100%)',
    heroTitre: 'Le Goût & La Fraîcheur.\nVos Essentiels au Quotidien.',
    heroSousTitre: "Épicerie de qualité, riz parfumé de premier choix, huiles végétales pures, boissons rafraîchissantes, condiments et produits du terroir sélectionnés pour nourrir et régaler toute la famille.",
    heroImageUrl: '/images/hero-food.png',
    heroImageAlt: 'Panier Alimentation Générale 7 Shop - Épicerie Fine & Terroir',
    heroImageWidth: '480px',
    heroImageHeight: '500px',
    heroImageObjectFit: 'contain',
    categories: [
      "Épicerie & Riz",
      "Huiles & Condiments",
      "Boissons & Jus",
      "Produits Frais & Épices",
      "Petit Déjeuner",
      "Snacks & Biscuits"
    ],
    products: []
  }
];
