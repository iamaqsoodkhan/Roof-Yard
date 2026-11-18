import { KarachiArea } from '../types';

// Roof Yard Coordinates: Plot No. SF-9, Block E, North Nazimabad Town, Karachi
export const ROOF_YARD_COORDS = {
  lat: 24.9378,
  lng: 67.0422,
};

// Backend-only fuel-indexed delivery configuration (never displayed on frontend UI)
const BACKEND_PK_PETROL_PKR_PER_LITER = 400;
const RIDER_AVG_KM_PER_LITER = 38;
const BASE_DISPATCH_PKR = 60;
const RIDER_OPERATION_FACTOR = 2.6;

export function formatPKR(amount: number): string {
  const rounded = Math.round(amount);
  return `Rs. ${rounded.toLocaleString('en-PK')}`;
}

export function calculateHaversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  // Multiply straight-line distance by 1.28 Karachi urban road factor
  return Math.max(0.8, Number((R * c * 1.28).toFixed(1)));
}

export function calculateAreaDeliveryQuote(
  area: KarachiArea | null,
  customCoords?: { lat: number; lng: number } | null,
): {
  distanceKm: number;
  deliveryFee: number;
} {
  const target =
    customCoords || (area ? { lat: area.lat, lng: area.lng } : ROOF_YARD_COORDS);
  const distanceKm = calculateHaversineKm(
    ROOF_YARD_COORDS.lat,
    ROOF_YARD_COORDS.lng,
    target.lat,
    target.lng,
  );

  // Fuel-indexed per-km rate derived from backend Rs. 400/Ltr petrol configuration
  const fuelCostPerKm = BACKEND_PK_PETROL_PKR_PER_LITER / RIDER_AVG_KM_PER_LITER;
  const perKmCharge = fuelCostPerKm * RIDER_OPERATION_FACTOR;

  const rawFee = BASE_DISPATCH_PKR + distanceKm * perKmCharge;
  const deliveryFee = Math.min(850, Math.max(90, Math.round(rawFee / 10) * 10));

  return { distanceKm, deliveryFee };
}

export function findNearestKarachiArea(
  lat: number,
  lng: number,
  areas: KarachiArea[],
): KarachiArea {
  let nearest = areas[0];
  let minDistance = Infinity;
  for (const area of areas) {
    const d = calculateHaversineKm(lat, lng, area.lat, area.lng);
    if (d < minDistance) {
      minDistance = d;
      nearest = area;
    }
  }
  return nearest;
}
