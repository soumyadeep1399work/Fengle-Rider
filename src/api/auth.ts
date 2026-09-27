import { apiFetch } from './client';

export interface AuthUser {
  id: number;
  phone: string;
  name: string | null;
  type: 'rider';
}

// Riders are self-serve (unlike restaurants): the first successful OTP verify
// for an unknown phone creates the account.
const PURPOSE = 'rider_login';

export function requestOtp(phone: string) {
  return apiFetch<{ message: string; expires_in_minutes: number }>('/auth/otp/request', {
    method: 'POST',
    auth: false,
    body: { phone, purpose: PURPOSE },
  });
}

// `name` only takes effect on first-time signup (the backend ignores it for
// a returning rider) — see profile.ts for why name/vehicle can't be edited later.
export function verifyOtp(phone: string, otp: string, name?: string) {
  return apiFetch<{ token: string; user: AuthUser }>('/auth/otp/verify', {
    method: 'POST',
    auth: false,
    body: { phone, otp, purpose: PURPOSE, name: name || undefined },
  });
}

export function fetchSession(timeoutMs?: number) {
  return apiFetch<{ user: AuthUser }>('/auth/session', { timeoutMs });
}

// Sending the push token lets the backend stop notifying this device.
export function logoutRequest(deviceToken?: string | null) {
  return apiFetch<unknown>('/auth/logout', { method: 'POST', body: deviceToken ? { device_token: deviceToken } : {} });
}
