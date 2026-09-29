import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { fetchMyProfile, ProfileUpdate, updateMyProfile } from '../api/riders';
import { RiderProfile } from '../types';

interface RiderProfileContextValue {
  profile: RiderProfile | null;
  loading: boolean;
  /** Vehicle type is the marker for "has this rider finished onboarding". */
  needsOnboarding: boolean;
  /** False (fails open) until the backend ships `agreementRequired` on GET /riders/me. */
  needsAgreement: boolean;
  refresh: () => Promise<void>;
  update: (patch: ProfileUpdate) => Promise<void>;
}

const RiderProfileContext = createContext<RiderProfileContextValue | undefined>(undefined);

export function RiderProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<RiderProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const p = await fetchMyProfile();
      setProfile(p);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const update = useCallback(async (patch: ProfileUpdate) => {
    const p = await updateMyProfile(patch);
    setProfile(p);
  }, []);

  const value: RiderProfileContextValue = {
    profile, loading,
    needsOnboarding: !loading && profile != null && !profile.vehicleType,
    // Checked after onboarding, so a rider with no vehicle set never sees this first.
    needsAgreement: !loading && profile != null && !!profile.vehicleType && profile.agreementRequired,
    refresh, update,
  };

  return <RiderProfileContext.Provider value={value}>{children}</RiderProfileContext.Provider>;
}

export function useRiderProfile(): RiderProfileContextValue {
  const ctx = useContext(RiderProfileContext);
  if (!ctx) throw new Error('useRiderProfile must be used within a RiderProfileProvider');
  return ctx;
}
