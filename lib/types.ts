// Shared domain types. Money is always integer FCFA. Coordinates are [lng, lat].
export type LngLat = [number, number];

export type PlaceCategory = "Aéroport" | "Domicile" | "Travail" | "Université" | "Quartier" | "Marché" | "Commerce" | "Monument" | "Santé" | "Sport" | "Ville" | "Plage";
export type Place = {
  id: string;
  name: string; // full name shown in search results
  shortName: string; // used in "Vers …" headers
  subtitle: string;
  category: PlaceCategory;
  lng: number;
  lat: number;
  distanceKm: number; // road distance from "Ma position"
  durationMin: number; // trip duration from "Ma position"
};

export type VehicleId = "zem" | "tricycle" | "taxi" | "comfort";
export type Vehicle = {
  id: VehicleId;
  name: string;
  emoji: string;
  description: string;
  capacity: number;
  etaMin: number; // pickup ETA
  basePrice: number; // price for the 4.8 km reference trip (airport)
  promoTag?: string;
  driverId: string;
};

export type Driver = {
  id: string;
  name: string;
  firstName: string;
  rating: number;
  trips: number;
  vehicle: string;
  plate: string;
  phone: string;
  avatar: string; // initials
};

export type MenuItem = { id: string; name: string; description: string; price: number; section: string; popular?: boolean; emoji: string };
export type FoodCategory = "Burgers" | "Pizza" | "Poulet" | "Asiatique" | "Healthy" | "Desserts" | "Local";
export type Restaurant = {
  slug: string;
  name: string;
  categories: FoodCategory[];
  cuisine: string;
  rating: number;
  reviews: number;
  timeMin: string; // "20-30 min"
  deliveryFee: number;
  distanceKm: number;
  promo?: string;
  image: string; // remote Unsplash URL (use <img>, fall back to emoji on error)
  emoji: string;
  address: string;
  sections: string[];
  menu: MenuItem[];
};

export type Promo = {
  id: string;
  title: string;
  description: string;
  code: string;
  badge: string;
  appliesTo: "ride" | "food" | "delivery" | "any";
  discountPct?: number;
  href: string;
  emoji: string;
};

export type ShoppingCategory = "Épicerie" | "Boissons" | "Hygiène" | "Maison" | "Téléphones" | "Électronique";
export type Product = { id: string; name: string; price: number; category: ShoppingCategory; unit: string; emoji: string };

export type GasSize = { id: string; label: string; refillPrice: number; newPrice: number };

export type TxCategory = "ride" | "food" | "delivery" | "transfer" | "payment" | "topup" | "withdraw" | "gas" | "shopping" | "tip" | "refund";
export type Transaction = {
  id: string;
  label: string;
  category: TxCategory;
  amount: number; // signed: negative = debit
  date: string; // ISO
  balanceAfter: number;
};

export type NotificationKind = "ride" | "order" | "gowin" | "promo" | "wallet" | "delivery" | "system";
export type AppNotification = { id: string; kind: NotificationKind; title: string; body: string; date: string; read: boolean; href?: string };

export type ActivityType = "ride" | "order" | "delivery" | "payment";
export type ActivityStatus = "completed" | "scheduled" | "cancelled" | "in_progress";
export type ActivityEntry = {
  id: string;
  type: ActivityType;
  title: string;
  subtitle: string;
  amount: number; // positive FCFA (what the user paid), 0 if none
  date: string; // ISO; for scheduled rides: the planned date
  status: ActivityStatus;
  meta?: Record<string, string | number>; // receipt lines, ids, etc.
};

export type PointsEntry = { id: string; label: string; points: number; date: string };

export type Address = { id: string; label: string; detail: string; placeId?: string; icon: "home" | "work" | "school" | "pin" };
export type PaymentMethod = "gozem_money" | "cash" | "mobile_money";
export type Contact = { id: string; name: string; phone: string };
export type Profile = { firstName: string; name: string; phone: string; email: string; tier: "Silver" | "Gold" | "Platinum"; avatar: string };
