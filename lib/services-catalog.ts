// Home services grid + Explorer "Services" results. No href → "Bientôt disponible" sheet.
export type Service = { id: string; name: string; description: string; emoji: string; href?: string; keywords: string };

export const SERVICES: Service[] = [
  { id: "ride", name: "Se déplacer", description: "Zem, taxi, tricycle", emoji: "🏍️", href: "/ride/search", keywords: "trajet course zem taxi moto deplacer" },
  { id: "food", name: "Manger", description: "Restaurants livrés", emoji: "🍔", href: "/food", keywords: "repas restaurant burger pizza manger livraison" },
  { id: "shopping", name: "Courses", description: "Supermarché", emoji: "🛒", keywords: "courses supermarche epicerie produits" },
  { id: "delivery", name: "Envoyer", description: "Colis et plis", emoji: "📦", href: "/delivery", keywords: "colis envoyer livraison paquet" },
  { id: "gas", name: "Gaz", description: "Bouteille livrée", emoji: "🔥", keywords: "gaz bouteille recharge" },
  { id: "money", name: "Gozem Money", description: "Payer, envoyer", emoji: "💸", href: "/wallet", keywords: "wallet argent paiement transfert money" },
  { id: "tickets", name: "Billetterie", description: "Événements", emoji: "🎟️", keywords: "billet ticket evenement concert" },
  { id: "credit", name: "Crédit", description: "Financement", emoji: "🏦", keywords: "credit pret financement" },
];
