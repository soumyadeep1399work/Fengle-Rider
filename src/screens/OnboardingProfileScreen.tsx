import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, status } from '../theme';
import Button from '../components/Button';
import { useRiderProfile } from '../context/RiderProfileContext';
import { VehicleType } from '../types';
import { errorMessage } from '../utils/actions';

const VEHICLES: { value: VehicleType; label: string }[] = [
  { value: 'bike', label: 'Bike' },
  { value: 'scooter', label: 'Scooter' },
  { value: 'bicycle', label: 'Cycle' },
];

interface Props {
  onDone?: () => void;
}

export default function OnboardingProfileScreen({ onDone }: Props) {
  const { profile, update } = useRiderProfile();
  const [name, setName] = useState(profile?.name ?? '');
  const [vehicleType, setVehicleType] = useState<VehicleType>(profile?.vehicleType ?? 'bike');
  const [vehicleNumber, setVehicleNumber] = useState(profile?.vehicleNumber ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function save() {
    setBusy(true);
    setError('');
    try {
      await update({ name: name.trim() || undefined, vehicleType, vehicleNumber: vehicleNumber.trim() || null });
      onDone?.();
    } catch (e) {
      setError(errorMessage(e));
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.form}>
        <Text style={styles.title}>Set up your rider profile</Text>
        <Text style={styles.subtitle}>This helps kitchens and customers recognise you.</Text>

        <Text style={styles.label}>Full name</Text>
        <TextInput value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={colors.faint} style={styles.input} />

        <Text style={styles.label}>Vehicle</Text>
        <View style={styles.chipRow}>
          {VEHICLES.map((v) => {
            const on = v.value === vehicleType;
            return (
              <Pressable
                key={v.value}
                onPress={() => setVehicleType(v.value)}
                style={[styles.chip, { borderColor: on ? colors.primary : colors.border, backgroundColor: on ? colors.primaryTint : 'transparent' }]}
              >
                <Text style={[styles.chipLabel, { color: on ? colors.primary : colors.ink }]}>{v.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Vehicle number</Text>
        <TextInput
          value={vehicleNumber}
          onChangeText={setVehicleNumber}
          placeholder="WB 06 AB 1234"
          placeholderTextColor={colors.faint}
          autoCapitalize="characters"
          style={styles.input}
        />

        {!!error && <Text style={styles.error}>{error}</Text>}
      </View>
      <View style={styles.footer}>
        <Button label="Start riding" height={52} loading={busy} onPress={save} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  form: { flex: 1, paddingTop: 30, paddingHorizontal: 26 },
  title: { fontFamily: fonts.heading, fontSize: 24, letterSpacing: -0.6, color: colors.ink },
  subtitle: { marginTop: 8, fontFamily: fonts.body, fontSize: 13.5, lineHeight: 20, color: colors.bodyMuted },
  label: { marginTop: 22, fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: colors.mutedLight },
  input: {
    marginTop: 6, height: 50, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: 14,
    fontFamily: fonts.bodyBold, fontSize: 14.5, color: colors.ink,
  },
  chipRow: { marginTop: 6, flexDirection: 'row', gap: 8 },
  chip: { flex: 1, height: 44, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  chipLabel: { fontFamily: fonts.bodyExtraBold, fontSize: 13 },
  error: { marginTop: 14, fontFamily: fonts.bodyBold, fontSize: 12.5, color: status.alert },
  footer: { paddingHorizontal: 26, paddingBottom: 26 },
});
