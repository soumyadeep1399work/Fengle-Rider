import { Delivery } from '../types';
import { fetchRate } from '../api/riders';
import { haversineDistanceKm } from './geo';

// This is an ESTIMATE only — real earnings are computed and paid out at
// admin-triggered settlement (settleRider()), which this app has no per-delivery
// visibility into. Flagged as an unconfirmed placeholder rate in
// fengle-open-issues memory; don't treat this number as authoritative.
// Defaults mirror settlement.service.js's fallback; loadRate() below replaces
// them with the live env-configured values via GET /riders/me/rate so this
// never silently drifts from what settlement actually pays.
let ratePerKm = 8;
let minEarningPerDelivery = 15;

/** Call once (e.g. on app start) to sync with the server's live rate. Safe to ignore failures — falls back to the defaults above. */
export async function loadRate(): Promise<void> {
  try {
    const r = await fetchRate();
    ratePerKm = Number(r.rate_per_km);
    minEarningPerDelivery = Number(r.min_earning_per_delivery);
  } catch {
    // keep defaults
  }
}

/** null when the delivery has no restaurant coordinates yet (pre-backend-fix orders). */
export function estimateEarning(d: Pick<Delivery, 'restaurantLat' | 'restaurantLng' | 'deliveryLat' | 'deliveryLng'>): number | null {
  if (d.restaurantLat == null || d.restaurantLng == null) return null;
  const km = haversineDistanceKm(d.restaurantLat, d.restaurantLng, d.deliveryLat, d.deliveryLng);
  return Math.max(minEarningPerDelivery, Math.round(km * ratePerKm * 100) / 100);
}
