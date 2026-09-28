import type { FoodCategory, MenuItem, Restaurant } from "@/lib/types";

export const FOOD_CATEGORIES: FoodCategory[] = ["Burgers", "Pizza", "Poulet", "Asiatique", "Healthy", "Desserts"];
export const FOOD_DELIVERY_FEE = 1000;
const SECTIONS = ["Populaire", "Burgers", "Menus", "Boissons", "Desserts"];
const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=70`;

// Burger House: Classic Burger ×2 + Coca ×2 = 8 000 FCFA subtotal (+1 000 delivery = 9 000).
const BURGER_HOUSE_MENU: MenuItem[] = [
  { id: "classic-burger", name: "Classic Burger", description: "Bœuf 150 g, cheddar, salade, tomate, sauce maison", price: 3000, section: "Burgers", popular: true, emoji: "🍔" },
  { id: "double-cheese", name: "Double Cheese", description: "Double bœuf, double cheddar, oignons caramélisés", price: 4500, section: "Burgers", popular: true, emoji: "🍔" },
  { id: "chicken-burger", name: "Chicken Burger", description: "Poulet croustillant, sauce piment doux", price: 3500, section: "Burgers", emoji: "🍗" },
  { id: "veggie-burger", name: "Veggie Burger", description: "Galette de haricots, avocat, crudités", price: 3200, section: "Burgers", emoji: "🥬" },
  { id: "menu-classic", name: "Menu Classic", description: "Classic Burger + frites + boisson", price: 4500, section: "Menus", popular: true, emoji: "🍟" },
  { id: "menu-duo", name: "Menu Duo", description: "2 burgers au choix + 2 frites + 2 boissons", price: 8500, section: "Menus", emoji: "🍟" },
  { id: "frites", name: "Frites maison", description: "Pommes de terre fraîches, sel de mer", price: 1000, section: "Menus", emoji: "🍟" },
  { id: "coca", name: "Coca-Cola 33 cl", description: "Bien frais", price: 1000, section: "Boissons", popular: true, emoji: "🥤" },
  { id: "bissap", name: "Jus de bissap", description: "Fait maison, 50 cl", price: 800, section: "Boissons", emoji: "🧃" },
  { id: "eau", name: "Eau Possotomè 50 cl", description: "Eau minérale du Bénin", price: 500, section: "Boissons", emoji: "💧" },
  { id: "brownie", name: "Brownie chocolat", description: "Chocolat noir, noix de cajou", price: 1500, section: "Desserts", emoji: "🍫" },
  { id: "glace", name: "Glace vanille", description: "2 boules", price: 1200, section: "Desserts", emoji: "🍨" },
];

const simpleMenu = (items: [string, string, number, string, string][]): MenuItem[] =>
  items.map(([name, description, price, section, emoji], i) => ({
    id: name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-"),
    name, description, price, section, emoji, popular: i < 2,
  }));

export const RESTAURANTS: Restaurant[] = [
  {
    slug: "burger-house", name: "Burger House", categories: ["Burgers"], cuisine: "Burgers · Américain", rating: 4.7, reviews: 1240,
    timeMin: "20-30 min", deliveryFee: FOOD_DELIVERY_FEE, distanceKm: 2.1, promo: "-10% dès 10 000 FCFA", image: img("photo-1568901346375-23c9450c58cd"), emoji: "🍔",
    address: "Haie Vive, Cotonou", sections: SECTIONS, menu: BURGER_HOUSE_MENU,
  },
  {
    slug: "chez-maman-benin", name: "Chez Maman Bénin", categories: ["Local", "Poulet"], cuisine: "Cuisine béninoise", rating: 4.8, reviews: 2310,
    timeMin: "25-35 min", deliveryFee: FOOD_DELIVERY_FEE, distanceKm: 1.8, promo: "Livraison offerte", image: img("photo-1604329760661-e71dc83f8f26"), emoji: "🍲",
    address: "Jéricho, Cotonou", sections: ["Populaire", "Plats", "Boissons"],
    menu: simpleMenu([
      ["Amiwo au poulet", "Pâte de maïs rouge, poulet bicyclette", 3500, "Plats", "🍗"],
      ["Pâte rouge & sauce arachide", "Sauce arachide maison, viande de bœuf", 2500, "Plats", "🥘"],
      ["Atassi", "Riz et haricots, piment, friture", 1500, "Plats", "🍛"],
      ["Poisson braisé & aloco", "Dorade braisée, bananes plantain frites", 4500, "Plats", "🐟"],
      ["Jus de bissap", "Fait maison, 50 cl", 800, "Boissons", "🧃"],
      ["Sodabi cocktail (sans alcool)", "Gingembre, citron vert", 1200, "Boissons", "🍹"],
    ]),
  },
  {
    slug: "pizza-napoli", name: "Pizza Napoli Cotonou", categories: ["Pizza"], cuisine: "Pizza · Italien", rating: 4.6, reviews: 980,
    timeMin: "30-40 min", deliveryFee: FOOD_DELIVERY_FEE, distanceKm: 3.4, image: img("photo-1513104890138-7c749659a591"), emoji: "🍕",
    address: "Cadjehoun, Cotonou", sections: ["Populaire", "Pizzas", "Boissons"],
    menu: simpleMenu([
      ["Margherita", "Tomate, mozzarella, basilic", 5000, "Pizzas", "🍕"],
      ["Reine", "Jambon de dinde, champignons", 6000, "Pizzas", "🍕"],
      ["Pizza Béninoise", "Poulet fumé, piment, oignons", 6500, "Pizzas", "🌶️"],
      ["Coca-Cola 33 cl", "Bien frais", 1000, "Boissons", "🥤"],
    ]),
  },
  {
    slug: "poulet-braise-carrefour", name: "Poulet Braisé du Carrefour", categories: ["Poulet"], cuisine: "Grillades", rating: 4.5, reviews: 1575,
    timeMin: "20-30 min", deliveryFee: FOOD_DELIVERY_FEE, distanceKm: 1.2, promo: "2 achetés = 1 Coca offert", image: img("photo-1598515214211-89d3c73ae83b"), emoji: "🍗",
    address: "Étoile Rouge, Cotonou", sections: ["Populaire", "Grillades", "Boissons"],
    menu: simpleMenu([
      ["Demi-poulet braisé", "Mariné aux épices, attiéké", 3500, "Grillades", "🍗"],
      ["Poulet entier braisé", "Avec alloco et piment", 6500, "Grillades", "🍗"],
      ["Brochettes de bœuf", "3 brochettes, oignons", 2000, "Grillades", "🍢"],
      ["Coca-Cola 33 cl", "Bien frais", 1000, "Boissons", "🥤"],
    ]),
  },
  {
    slug: "wok-asia", name: "Wok Asia Haie Vive", categories: ["Asiatique"], cuisine: "Asiatique · Wok", rating: 4.4, reviews: 610,
    timeMin: "25-35 min", deliveryFee: FOOD_DELIVERY_FEE, distanceKm: 3.9, image: img("photo-1512058564366-18510be2db19"), emoji: "🥡",
    address: "Haie Vive, Cotonou", sections: ["Populaire", "Woks", "Boissons"],
    menu: simpleMenu([
      ["Riz cantonais", "Œuf, crevettes, petits pois", 3500, "Woks", "🍚"],
      ["Nouilles sautées au poulet", "Légumes croquants, sauce soja", 4000, "Woks", "🍜"],
      ["Nems (4 pièces)", "Porc ou légumes", 2000, "Woks", "🥟"],
      ["Thé glacé", "Citron, 50 cl", 800, "Boissons", "🧋"],
    ]),
  },
  {
    slug: "green-bowl", name: "Green Bowl", categories: ["Healthy"], cuisine: "Healthy · Salades", rating: 4.6, reviews: 430,
    timeMin: "15-25 min", deliveryFee: FOOD_DELIVERY_FEE, distanceKm: 2.7, promo: "-15% sur les bowls", image: img("photo-1512621776951-a57141f2eefd"), emoji: "🥗",
    address: "Cadjehoun, Cotonou", sections: ["Populaire", "Bowls", "Jus"],
    menu: simpleMenu([
      ["Bowl avocat & quinoa", "Avocat, quinoa, légumes grillés", 4500, "Bowls", "🥑"],
      ["Salade César poulet", "Poulet grillé, parmesan, croûtons", 4000, "Bowls", "🥗"],
      ["Jus ananas-gingembre", "Pressé minute", 1200, "Jus", "🍍"],
    ]),
  },
  {
    slug: "douceurs-fidjrosse", name: "Les Douceurs de Fidjrossè", categories: ["Desserts"], cuisine: "Pâtisserie · Glaces", rating: 4.8, reviews: 720,
    timeMin: "20-30 min", deliveryFee: FOOD_DELIVERY_FEE, distanceKm: 4.6, image: img("photo-1551024601-bec78aea704b"), emoji: "🍩",
    address: "Fidjrossè, Cotonou", sections: ["Populaire", "Pâtisseries", "Glaces"],
    menu: simpleMenu([
      ["Beignets (6 pièces)", "Sucre glace", 1000, "Pâtisseries", "🍩"],
      ["Gâteau coco", "Part généreuse", 1500, "Pâtisseries", "🥥"],
      ["Coupe glacée mangue", "3 boules, coulis mangue", 2500, "Glaces", "🍨"],
    ]),
  },
  {
    slug: "maquis-le-belier", name: "Maquis Le Bélier", categories: ["Local", "Poulet"], cuisine: "Maquis · Grillades", rating: 4.3, reviews: 890,
    timeMin: "30-45 min", deliveryFee: FOOD_DELIVERY_FEE, distanceKm: 5.2, image: img("photo-1529692236671-f1f6cf9683ba"), emoji: "🥘",
    address: "Akpakpa, Cotonou", sections: ["Populaire", "Plats", "Boissons"],
    menu: simpleMenu([
      ["Agouti braisé", "Sauce tomate pimentée, igname pilée", 6000, "Plats", "🥘"],
      ["Wagassi frit", "Fromage peul, piment", 2000, "Plats", "🧀"],
      ["Tchoukoutou (sans alcool)", "Boisson de mil", 700, "Boissons", "🥛"],
    ]),
  },
  {
    slug: "tacos-street", name: "Tacos Street", categories: ["Burgers"], cuisine: "Tacos · Street food", rating: 4.2, reviews: 350,
    timeMin: "20-30 min", deliveryFee: FOOD_DELIVERY_FEE, distanceKm: 2.9, image: img("photo-1565299585323-38d6b0865b47"), emoji: "🌮",
    address: "Ganhi, Cotonou", sections: ["Populaire", "Tacos", "Boissons"],
    menu: simpleMenu([
      ["Tacos poulet", "Frites, sauce fromagère", 3000, "Tacos", "🌮"],
      ["Tacos mixte XL", "Poulet + bœuf haché", 4500, "Tacos", "🌮"],
      ["Coca-Cola 33 cl", "Bien frais", 1000, "Boissons", "🥤"],
    ]),
  },
];

export const getRestaurant = (slug: string) => RESTAURANTS.find((r) => r.slug === slug);
export const findMenuItem = (slug: string, itemId: string) => getRestaurant(slug)?.menu.find((m) => m.id === itemId);

/** Group order (F08). Link gozem.app/group/X92K; guests join automatically. */
export const GROUP_CODE = "X92K";
export const GROUP_GUESTS = [
  { id: "aicha", name: "Aïcha", items: [{ itemId: "chicken-burger", qty: 1 }, { itemId: "bissap", qty: 1 }] },
  { id: "rodrigue", name: "Rodrigue", items: [{ itemId: "double-cheese", qty: 1 }, { itemId: "coca", qty: 1 }] },
];

export const ORDER_STEPS = ["Restaurant confirme", "Préparation", "Coursier assigné", "En livraison", "Livré"];
