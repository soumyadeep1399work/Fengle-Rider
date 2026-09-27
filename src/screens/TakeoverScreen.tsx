import React, { useEffect } from 'react';
import { StyleSheet, Text, Vibration, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, status } from '../theme';
import { useDelivery } from '../context/DeliveryContext';
import { Delivery } from '../types';
import { formatMoney } from '../utils/money';
import { itemsSummary } from '../utils/deliveryFormat';
import { estimateEarning } from '../utils/earnings';
import { formatDistance, haversineDistanceKm } from '../utils/geo';
import Button from '../components/Button';

// Full-screen "respond now" alert. There's no push yet, so it appears when the
// poll finds a new assignment while the app is open; it buzzes until answered.
// The flatboard has a "Decline" button here, but there's no rider-decline/
// reassign endpoint in the backend (auto-assignment picks exactly one rider
// per order), so this screen only offers a single way forward.
export default function TakeoverScreen({ delivery }: { delivery: Delivery }) {
  const { acknowledgeAssignment } = useDelivery();

  useEffect(() => {
    Vibration.vibrate([0, 700, 500], true);
    return () => Vibration.cancel();
  }, []);

  const distanceKm =
    delivery.restaurantLat != null && delivery.restaurantLng != null
      ? haversineDistanceKm(delivery.restaurantLat, delivery.restaurantLng, delivery.deliveryLat, delivery.deliveryLng)
      : null;
  const earning = estimateEarning(delivery);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.center}>
        <Text style={styles.eyebrow}>New delivery request</Text>
        <Text style={styles.title}>{delivery.restaurantName ?? `Order #${delivery.id}`}</Text>
        <Text style={styles.summary}>{itemsSummary(delivery.items)}</Text>
        {delivery.isClubbed && <Text style={styles.club}>Clubbed pickup — {delivery.categoriesLabel}</Text>}
        <View style={styles.statsRow}>
          {earning != null && (
            <View>
              <Text style={styles.statValue}>{formatMoney(earning)}</Text>
              <Text style={styles.statLabel}>est. payout</Text>
            </View>
          )}
          {distanceKm != null && (
            <View>
              <Text style={styles.statValue}>{formatDistance(distanceKm)}</Text>
              <Text style={styles.statLabel}>distance</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.actions}>
        <Button label="View assignment" variant="gold" height={54} onPress={acknowledgeAssignment} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: status.takeoverBg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: 30 },
  eyebrow: { fontFamily: fonts.bodyExtraBold, fontSize: 11.5, letterSpacing: 1.6, textTransform: 'uppercase', color: colors.gold },
  title: { fontFamily: fonts.heading, fontSize: 26, letterSpacing: -0.6, color: colors.surfaceCream, textAlign: 'center' },
  summary: { fontFamily: fonts.body, fontSize: 13.5, color: 'rgba(255,248,244,0.8)', textAlign: 'center' },
  club: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.gold, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 18, marginTop: 6 },
  statValue: { fontFamily: fonts.bodyExtraBold, fontSize: 20, color: colors.surfaceCream, textAlign: 'center' },
  statLabel: { fontFamily: fonts.body, fontSize: 11, color: 'rgba(255,248,244,0.65)', textAlign: 'center' },
  actions: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16 },
});
