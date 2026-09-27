import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';
import { useAuth } from '../context/AuthContext';
import { useRiderProfile } from '../context/RiderProfileContext';
import OnboardingProfileScreen from './OnboardingProfileScreen';

const VEHICLE_LABEL: Record<string, string> = { bike: 'Bike', scooter: 'Scooter', bicycle: 'Cycle', car: 'Car' };

export default function ProfileScreen() {
  const { logout } = useAuth();
  const { profile } = useRiderProfile();
  const [editing, setEditing] = useState(false);

  if (editing) return <OnboardingProfileScreen onDone={() => setEditing(false)} />;

  const initial = (profile?.name || profile?.phone || '?').charAt(0).toUpperCase();
  const vehicleSummary = profile
    ? [VEHICLE_LABEL[profile.vehicleType ?? ''] ?? profile.vehicleType, profile.vehicleNumber].filter(Boolean).join(' · ')
    : '';

  const rows: { label: string; color?: string; onPress: () => void }[] = [
    { label: 'Edit profile', onPress: () => setEditing(true) },
    { label: 'Bank details', onPress: () => Alert.alert('Bank details', 'Coming soon — contact support to update your payout account.') },
    { label: 'Support', onPress: () => Alert.alert('Support', 'Contact your onboarding admin for help.') },
    { label: 'Log out', color: '#8E3A62', onPress: () => Alert.alert('Log out?', undefined, [{ text: 'Cancel', style: 'cancel' }, { text: 'Log out', style: 'destructive', onPress: logout }]) },
  ];

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View>
          <Text style={styles.name}>{profile?.name || 'Rider'}</Text>
          <Text style={styles.vehicle}>{vehicleSummary || 'Vehicle not set'}</Text>
        </View>
      </View>
      {rows.map((r) => (
        <Pressable key={r.label} onPress={r.onPress} style={styles.row}>
          <Text style={[styles.rowLabel, r.color ? { color: r.color } : null]}>{r.label}</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 100 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingBottom: 18 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#F4E3EB', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.bodyExtraBold, fontSize: 19, color: '#8E3A62' },
  name: { fontFamily: fonts.bodyExtraBold, fontSize: 15.5, color: colors.ink },
  vehicle: { marginTop: 2, fontFamily: fonts.body, fontSize: 12, color: colors.mutedLight },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15, paddingHorizontal: 2, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  rowLabel: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink },
  chevron: { fontSize: 17, color: '#B9ABB1' },
});
