import { apiFetch } from './client';
import { RiderProfile, RiderStatus, VehicleType } from '../types';

function mapProfile(r: any): RiderProfile {
  return {
    id: Number(r.id),
    name: r.name ?? null,
    phone: String(r.phone),
    vehicleType: r.vehicle_type ?? null,
    vehicleNumber: r.vehicle_number ?? null,
    status: r.status,
    walletBalance: Number(r.wallet_balance ?? 0),
  };
}

export async function fetchMyProfile(): Promise<RiderProfile> {
  const { rider } = await apiFetch<{ rider: any }>('/riders/me');
  return mapProfile(rider);
}

export interface ProfileUpdate {
  name?: string;
  vehicleType?: VehicleType | null;
  vehicleNumber?: string | null;
}

export async function updateMyProfile(update: ProfileUpdate): Promise<RiderProfile> {
  const { rider } = await apiFetch<{ rider: any }>('/riders/me', {
    method: 'PATCH',
    body: {
      ...(update.name !== undefined ? { name: update.name } : {}),
      ...(update.vehicleType !== undefined ? { vehicle_type: update.vehicleType } : {}),
      ...(update.vehicleNumber !== undefined ? { vehicle_number: update.vehicleNumber } : {}),
    },
  });
  return mapProfile(rider);
}

/** Same numbers settleRider() actually pays with — see utils/earnings.ts. */
export function fetchRate() {
  return apiFetch<{ rate_per_km: number; min_earning_per_delivery: number }>('/riders/me/rate');
}

export function setAvailability(status: RiderStatus) {
  return apiFetch<{ message: string }>('/riders/me/availability', { method: 'PATCH', body: { status } });
}

// Foreground-only ping (no background GPS in Phase 1 — CLAUDE.md). A rider
// needs at least one successful ping before they're eligible for auto-assignment
// (autoAssignRider filters on last_known_lat/lng being non-null).
export function updateLocation(lat: number, lng: number) {
  return apiFetch<{ message: string }>('/riders/me/location', { method: 'PATCH', body: { lat, lng } });
}
