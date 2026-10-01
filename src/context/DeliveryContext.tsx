import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import * as Location from 'expo-location';
import { fetchMyDeliveries, markDelivered as apiMarkDelivered, markOnTheWay as apiMarkOnTheWay, markPickedUp as apiMarkPickedUp } from '../api/orders';
import { setAvailability, updateLocation } from '../api/riders';
import { Delivery, RiderStatus } from '../types';
import { loadRate } from '../utils/earnings';

// No push notifications yet (needs FCM + a real build), so a new assignment is
// found by polling while the app is open — same pattern as the Restaurant app.
const POLL_MS = 8000;
// Keeps last_known_lat/lng fresh while online: autoAssignRider only considers
// riders with a non-null last_known_lat/lng, so a stale ping means no new work.
const LOCATION_PING_MS = 60000;

const ACTIVE_STATUSES = ['accepted', 'picked_up', 'on_the_way'] as const;

interface DeliveryContextValue {
  loading: boolean;
  loadError: string | null;
  online: boolean;
  togglingOnline: boolean;
  locationError: string | null;
  toggleOnline: () => Promise<void>;
  activeDelivery: Delivery | null;
  historyDeliveries: Delivery[];
  /** A just-arrived assignment waiting for the full-screen alert to be dismissed. */
  newAssignment: Delivery | null;
  acknowledgeAssignment: () => void;
  /** Whether the full assignment detail screen is open (vs. collapsed to a Home card). */
  assignmentViewOpen: boolean;
  openAssignmentView: () => void;
  closeAssignmentView: () => void;
  refresh: () => Promise<void>;
  markPickedUp: (id: number) => Promise<void>;
  markOnTheWay: (id: number) => Promise<void>;
  markDelivered: (id: number, deliveryOtp: string, codAmountCollected?: number) => Promise<void>;
}

const DeliveryContext = createContext<DeliveryContextValue | undefined>(undefined);

export function DeliveryProvider({ children }: { children: React.ReactNode }) {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [online, setOnline] = useState(false);
  const [togglingOnline, setTogglingOnline] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const inFlight = useRef(false);

  const [alertedIds, setAlertedIds] = useState<Set<number>>(new Set());
  const [assignmentViewOpen, setAssignmentViewOpen] = useState(false);

  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      const next = await fetchMyDeliveries();
      setDeliveries(next);
      setLoadError(null);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Could not load deliveries.');
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    loadRate();
    const timer = setInterval(() => {
      if (AppState.currentState === 'active') refresh();
    }, POLL_MS);
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') refresh();
    });
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, [refresh]);

  const activeDelivery = useMemo(
    () => deliveries.find((d) => (ACTIVE_STATUSES as readonly string[]).includes(d.status)) ?? null,
    [deliveries]
  );
  const historyDeliveries = useMemo(
    () => deliveries.filter((d) => d.status === 'delivered' || d.status === 'cancelled'),
    [deliveries]
  );

  // A freshly-assigned delivery (status still 'accepted', not yet picked up) that
  // this session hasn't alerted for yet gets the full-screen takeover. One already
  // in progress when the app (re)opens (picked_up/on_the_way) resumes silently
  // straight into the assignment view instead of re-alerting.
  const newAssignment = activeDelivery && activeDelivery.status === 'accepted' && !alertedIds.has(activeDelivery.id) ? activeDelivery : null;

  useEffect(() => {
    if (!activeDelivery) return;
    if (activeDelivery.status !== 'accepted' && !alertedIds.has(activeDelivery.id)) {
      setAlertedIds((s) => new Set(s).add(activeDelivery.id));
      setAssignmentViewOpen(true);
    }
  }, [activeDelivery, alertedIds]);

  useEffect(() => {
    if (!activeDelivery) setAssignmentViewOpen(false);
  }, [activeDelivery]);

  const acknowledgeAssignment = useCallback(() => {
    if (!activeDelivery) return;
    setAlertedIds((s) => new Set(s).add(activeDelivery.id));
    setAssignmentViewOpen(true);
  }, [activeDelivery]);

  const pingLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Location permission is needed to receive nearby deliveries.');
        return false;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      await updateLocation(pos.coords.latitude, pos.coords.longitude);
      setLocationError(null);
      return true;
    } catch {
      setLocationError('Could not get your location.');
      return false;
    }
  }, []);

  const toggleOnline = useCallback(async () => {
    setTogglingOnline(true);
    try {
      const next: RiderStatus = online ? 'inactive' : 'active';
      if (next === 'active') {
        const ok = await pingLocation();
        if (!ok) return;
      }
      await setAvailability(next);
      setOnline(next === 'active');
    } catch (e) {
      setLocationError(e instanceof Error ? e.message : 'Could not update your status.');
    } finally {
      setTogglingOnline(false);
    }
  }, [online, pingLocation]);

  useEffect(() => {
    if (!online) return;
    const id = setInterval(() => {
      if (AppState.currentState === 'active') pingLocation();
    }, LOCATION_PING_MS);
    return () => clearInterval(id);
  }, [online, pingLocation]);

  const markPickedUp = useCallback(
    async (id: number) => {
      await apiMarkPickedUp(id);
      await refresh();
    },
    [refresh]
  );

  const markOnTheWay = useCallback(
    async (id: number) => {
      await apiMarkOnTheWay(id);
      await refresh();
    },
    [refresh]
  );

  const markDelivered = useCallback(
    async (id: number, deliveryOtp: string, codAmountCollected?: number) => {
      await apiMarkDelivered(id, deliveryOtp, codAmountCollected);
      setAssignmentViewOpen(false);
      await refresh();
    },
    [refresh]
  );

  const value: DeliveryContextValue = {
    loading, loadError, online, togglingOnline, locationError, toggleOnline,
    activeDelivery, historyDeliveries, newAssignment, acknowledgeAssignment,
    assignmentViewOpen, openAssignmentView: () => setAssignmentViewOpen(true), closeAssignmentView: () => setAssignmentViewOpen(false),
    refresh, markPickedUp, markOnTheWay, markDelivered,
  };

  return <DeliveryContext.Provider value={value}>{children}</DeliveryContext.Provider>;
}

export function useDelivery(): DeliveryContextValue {
  const ctx = useContext(DeliveryContext);
  if (!ctx) throw new Error('useDelivery must be used within a DeliveryProvider');
  return ctx;
}
