// Parcel delivery (F12)
export const PARCEL_PRICE = 1500;
export const PARCEL_ID = "GZ-2841";
export const PARCEL_STEPS = ["Commande créée", "Coursier assigné", "Colis récupéré", "En livraison", "Livré"];
export const PARCEL_VEHICLES = [
  { id: "moto", label: "Moto", description: "Petits colis jusqu'à 10 kg" },
  { id: "voiture", label: "Voiture", description: "Colis volumineux" },
] as const;
