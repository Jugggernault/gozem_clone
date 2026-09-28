import type { Driver, Vehicle, VehicleId } from "@/lib/types";

// basePrice = price for the 4.8 km airport trip (see lib/pricing.ts).
export const VEHICLES: Vehicle[] = [
  { id: "zem", name: "Zem", emoji: "🏍️", description: "Moto-taxi rapide", capacity: 1, etaMin: 4, basePrice: 1500, promoTag: "Le plus rapide", driverId: "koffi" },
  { id: "tricycle", name: "Tricycle", emoji: "🛺", description: "Économique et abrité", capacity: 3, etaMin: 7, basePrice: 2000, driverId: "rachidi" },
  { id: "taxi", name: "Taxi", emoji: "🚕", description: "Voiture partagée climatisée", capacity: 4, etaMin: 9, basePrice: 3000, driverId: "senou" },
  { id: "comfort", name: "Gozem Comfort", emoji: "🚙", description: "Berline premium, chauffeur 5★", capacity: 4, etaMin: 10, basePrice: 4500, promoTag: "Premium", driverId: "mathieu" },
];

export const DRIVERS: Driver[] = [
  { id: "koffi", name: "Koffi A.", firstName: "Koffi", rating: 4.9, trips: 1284, vehicle: "Honda Wave", plate: "AB 1234 RB", phone: "+229 96 11 22 33", avatar: "KA" },
  { id: "rachidi", name: "Rachidi B.", firstName: "Rachidi", rating: 4.8, trips: 862, vehicle: "TVS King", plate: "BC 5678 RB", phone: "+229 97 88 21 40", avatar: "RB" },
  { id: "senou", name: "Sènou G.", firstName: "Sènou", rating: 4.7, trips: 2031, vehicle: "Toyota Corolla", plate: "CD 9012 RB", phone: "+229 95 12 76 03", avatar: "SG" },
  { id: "mathieu", name: "Mathieu H.", firstName: "Mathieu", rating: 5.0, trips: 548, vehicle: "Toyota RAV4", plate: "EF 3456 RB", phone: "+229 66 40 58 17", avatar: "MH" },
];

/** Parcel courier (F12). */
export const COURIER: Driver = { id: "jean", name: "Jean T.", firstName: "Jean", rating: 4.9, trips: 3120, vehicle: "Bajaj Boxer", plate: "GH 7788 RB", phone: "+229 97 66 55 44", avatar: "JT" };

export const getVehicle = (id: VehicleId) => VEHICLES.find((v) => v.id === id)!;
export const getDriver = (id: string) => DRIVERS.find((d) => d.id === id) ?? COURIER;
export const driverForVehicle = (id: VehicleId) => getDriver(getVehicle(id).driverId);

/** Canned driver chat replies (F04 Message sheet). */
export const DRIVER_REPLIES = ["D'accord, j'arrive 👍", "Je suis à 2 minutes.", "Je porte un casque vert Gozem.", "Pas de souci, je vous attends."];
