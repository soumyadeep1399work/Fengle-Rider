import { Linking } from 'react-native';

// CLAUDE.md: no in-app map/turn-by-turn — a "Navigate" button deep-links to
// Google Maps. Prefer lat/lng (exact) over the address string (geocoded).
export function openMapsDirections(opts: { lat?: number | null; lng?: number | null; address?: string | null }) {
  const destination =
    opts.lat != null && opts.lng != null ? `${opts.lat},${opts.lng}` : opts.address ? opts.address : null;
  if (!destination) return;
  const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
  Linking.openURL(url).catch(() => {});
}
