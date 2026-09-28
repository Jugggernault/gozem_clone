import type { GasSize, Product, ShoppingCategory } from "@/lib/types";

export const SHOPPING_CATEGORIES: ShoppingCategory[] = ["Épicerie", "Boissons", "Hygiène", "Maison", "Téléphones", "Électronique"];
export const SHOPPING_DELIVERY_FEE = 1000;

export const PRODUCTS: Product[] = [
  { id: "riz-5kg", name: "Riz 5kg", price: 4500, category: "Épicerie", unit: "Sac 5 kg", emoji: "🍚" },
  { id: "huile-1l", name: "Huile 1L", price: 1800, category: "Épicerie", unit: "Bouteille 1 L", emoji: "🫒" },
  { id: "lait", name: "Lait", price: 1200, category: "Épicerie", unit: "Boîte 400 g", emoji: "🥛" },
  { id: "sucre-1kg", name: "Sucre 1kg", price: 800, category: "Épicerie", unit: "Paquet 1 kg", emoji: "🧂" },
  { id: "gari", name: "Gari 2kg", price: 1500, category: "Épicerie", unit: "Sachet 2 kg", emoji: "🌾" },
  { id: "eau-possotome", name: "Eau Possotomè 1,5L", price: 400, category: "Boissons", unit: "Bouteille", emoji: "💧" },
  { id: "coca-15", name: "Coca-Cola 1,5L", price: 900, category: "Boissons", unit: "Bouteille", emoji: "🥤" },
  { id: "jus-bissap", name: "Jus de bissap 1L", price: 1000, category: "Boissons", unit: "Bouteille", emoji: "🧃" },
  { id: "savon", name: "Savon de Marseille", price: 500, category: "Hygiène", unit: "Pain 200 g", emoji: "🧼" },
  { id: "dentifrice", name: "Dentifrice", price: 900, category: "Hygiène", unit: "Tube 75 ml", emoji: "🪥" },
  { id: "detergent", name: "Détergent 1kg", price: 2000, category: "Maison", unit: "Paquet", emoji: "🧺" },
  { id: "balai", name: "Balai", price: 1500, category: "Maison", unit: "Pièce", emoji: "🧹" },
  { id: "itel-a70", name: "Itel A70", price: 55000, category: "Téléphones", unit: "64 Go", emoji: "📱" },
  { id: "tecno-spark", name: "Tecno Spark 20", price: 89000, category: "Téléphones", unit: "128 Go", emoji: "📱" },
  { id: "ecouteurs", name: "Écouteurs Bluetooth", price: 5000, category: "Électronique", unit: "Pièce", emoji: "🎧" },
  { id: "chargeur", name: "Chargeur USB-C", price: 3000, category: "Électronique", unit: "Pièce", emoji: "🔌" },
];
export const getProduct = (id: string) => PRODUCTS.find((p) => p.id === id);

// Gas (F15): "Votre bouteille est vide ?"
export const GAS_SIZES: GasSize[] = [
  { id: "6kg", label: "6 kg", refillPrice: 4500, newPrice: 18000 },
  { id: "12kg", label: "12,5 kg", refillPrice: 9000, newPrice: 32000 },
  { id: "petite", label: "Petite bouteille", refillPrice: 2000, newPrice: 9500 },
];
export const GAS_DELIVERY_FEE = 500;
export const GAS_ETA = "30-45 min";
export const ERRAND_STEPS = ["Commande confirmée", "Préparation", "En livraison", "Livré"];

// QR pay (F15)
export const QR_MERCHANT = { name: "Burger House", amount: 8500 };
