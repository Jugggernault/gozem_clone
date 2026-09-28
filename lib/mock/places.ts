import type { LngLat, Place } from "@/lib/types";

/** "Ma position" (Jéricho, Cotonou). */
export const USER_POSITION: LngLat = [2.4225, 6.376];
export const USER_POSITION_LABEL = "Ma position";
export const COTONOU_CENTER: LngLat = [2.405, 6.37];

// distanceKm / durationMin are measured from USER_POSITION and drive lib/pricing.ts.
export const PLACES: Place[] = [
  { id: "aeroport", name: "Aéroport International de Cotonou", shortName: "Aéroport de Cotonou", subtitle: "Cadjehoun", category: "Aéroport", lng: 2.3844, lat: 6.3573, distanceKm: 4.8, durationMin: 12 },
  { id: "maison", name: "Maison", shortName: "Maison", subtitle: "Abomey-Calavi", category: "Domicile", lng: 2.344, lat: 6.4485, distanceKm: 16.5, durationMin: 35 },
  { id: "travail", name: "Travail", shortName: "Travail", subtitle: "Ganhi, Cotonou", category: "Travail", lng: 2.426, lat: 6.356, distanceKm: 2.6, durationMin: 8 },
  { id: "universite", name: "Université d'Abomey-Calavi", shortName: "Université (UAC)", subtitle: "Abomey-Calavi", category: "Université", lng: 2.3405, lat: 6.418, distanceKm: 12.8, durationMin: 28 },
  { id: "fidjrosse", name: "Fidjrossè", shortName: "Fidjrossè", subtitle: "Cotonou, 12e arrondissement", category: "Quartier", lng: 2.357, lat: 6.369, distanceKm: 7.8, durationMin: 18 },
  { id: "erevan", name: "Erevan", shortName: "Erevan", subtitle: "Supermarché, Haie Vive", category: "Commerce", lng: 2.395, lat: 6.362, distanceKm: 3.6, durationMin: 10 },
  { id: "ganhi", name: "Ganhi", shortName: "Ganhi", subtitle: "Quartier des affaires, Cotonou", category: "Quartier", lng: 2.4275, lat: 6.3545, distanceKm: 2.8, durationMin: 8 },
  { id: "akpakpa", name: "Akpakpa", shortName: "Akpakpa", subtitle: "Cotonou, rive est", category: "Quartier", lng: 2.456, lat: 6.37, distanceKm: 6.4, durationMin: 16 },
  { id: "calavi", name: "Calavi", shortName: "Calavi", subtitle: "Abomey-Calavi centre", category: "Ville", lng: 2.355, lat: 6.448, distanceKm: 15.9, durationMin: 33 },
  { id: "etoile-rouge", name: "Place de l'Étoile Rouge", shortName: "Étoile Rouge", subtitle: "Carrefour, Cotonou", category: "Monument", lng: 2.413, lat: 6.374, distanceKm: 1.4, durationMin: 5 },
  { id: "dantokpa", name: "Marché Dantokpa", shortName: "Dantokpa", subtitle: "Grand marché, Cotonou", category: "Marché", lng: 2.431, lat: 6.37, distanceKm: 1.6, durationMin: 6 },
  { id: "haie-vive", name: "Haie Vive", shortName: "Haie Vive", subtitle: "Restaurants & bars, Cotonou", category: "Quartier", lng: 2.392, lat: 6.358, distanceKm: 3.9, durationMin: 11 },
  { id: "stade-amitie", name: "Stade de l'Amitié Général Mathieu Kérékou", shortName: "Stade de l'Amitié", subtitle: "Kouhounou, Cotonou", category: "Sport", lng: 2.39, lat: 6.385, distanceKm: 4.2, durationMin: 12 },
  { id: "cathedrale", name: "Cathédrale Notre-Dame de Cotonou", shortName: "Cathédrale", subtitle: "Ganhi, Cotonou", category: "Monument", lng: 2.429, lat: 6.354, distanceKm: 2.5, durationMin: 7 },
  { id: "cnhu", name: "CNHU Hubert Koutoukou Maga", shortName: "CNHU", subtitle: "Hôpital, Cotonou", category: "Santé", lng: 2.407, lat: 6.362, distanceKm: 2.2, durationMin: 7 },
  { id: "saint-michel", name: "Marché Saint-Michel", shortName: "Saint-Michel", subtitle: "Cotonou", category: "Marché", lng: 2.422, lat: 6.368, distanceKm: 1.0, durationMin: 4 },
  { id: "plage-fidjrosse", name: "Plage de Fidjrossè", shortName: "Plage de Fidjrossè", subtitle: "Route des pêches, Cotonou", category: "Plage", lng: 2.35, lat: 6.362, distanceKm: 8.3, durationMin: 20 },
  { id: "porto-novo", name: "Porto-Novo", shortName: "Porto-Novo", subtitle: "Capitale, Ouémé", category: "Ville", lng: 2.628, lat: 6.497, distanceKm: 29.5, durationMin: 55 },
];

export const getPlace = (id: string) => PLACES.find((p) => p.id === id);
export const placeLngLat = (p: Place): LngLat => [p.lng, p.lat];
export const RECENT_PLACE_IDS = ["aeroport", "erevan", "fidjrosse"];

/** Lowercase + strip accents, for accent-insensitive search ("aeroport" matches "Aéroport"). */
export const normalize = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

/** Accent-insensitive place search; name-prefix matches rank first. */
export function searchPlaces(q: string): Place[] {
  const n = normalize(q);
  if (!n) return [];
  const scored = PLACES.map((p) => {
    const name = normalize(p.name);
    const hay = `${name} ${normalize(p.shortName)} ${normalize(p.subtitle)} ${normalize(p.category)}`;
    const score = name.startsWith(n) ? 0 : name.split(/\s+/).some((w) => w.startsWith(n)) ? 1 : hay.includes(n) ? 2 : -1;
    return { p, score };
  }).filter((x) => x.score >= 0);
  return scored.sort((a, b) => a.score - b.score).map((x) => x.p);
}
