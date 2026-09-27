import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts } from '../theme';
import { useDelivery } from '../context/DeliveryContext';
import { Delivery } from '../types';
import { formatMoney } from '../utils/money';
import { paymentLabel } from '../utils/deliveryFormat';
import { errorMessage } from '../utils/actions';
import { openMapsDirections } from '../utils/navigate';
import Button from '../components/Button';
import CodSheet from '../components/CodSheet';
import { BackIcon } from '../components/Icons';

interface Stage {
  stageLabel: string;
  locationLabel: string;
  locationName: string | null;
  locationAddress: string | null;
  lat: number | null;
  lng: number | null;
  primaryLabel: string;
}

function stageFor(d: Delivery): Stage {
  if (d.status === 'accepted') {
    return {
      stageLabel: 'To restaurant',
      locationLabel: 'Pick up from',
      locationName: d.restaurantName,
      locationAddress: d.restaurantAddress,
      lat: d.restaurantLat,
      lng: d.restaurantLng,
      primaryLabel: 'Mark Picked Up',
    };
  }
  return {
    stageLabel: 'To customer',
    locationLabel: 'Deliver to',
    // The backend never sends a customer name to the rider, only the address —
    // same gap as the Restaurant app (see project-restaurant-app-status memory).
    locationName: null,
    locationAddress: d.deliveryAddress,
    lat: d.deliveryLat,
    lng: d.deliveryLng,
    primaryLabel: d.status === 'picked_up' ? 'Mark On the Way' : d.paymentMethod === 'cod' ? 'Confirm delivery' : 'Mark Delivered',
  };
}

export default function AssignmentScreen({ delivery }: { delivery: Delivery }) {
  const { closeAssignmentView, markPickedUp, markOnTheWay, markDelivered } = useDelivery();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [codOpen, setCodOpen] = useState(false);

  const stage = stageFor(delivery);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError('');
    try {
      await action();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  function onPrimaryAction() {
    if (delivery.status === 'accepted') return run(() => markPickedUp(delivery.id));
    if (delivery.status === 'picked_up') return run(() => markOnTheWay(delivery.id));
    if (delivery.paymentMethod === 'cod') return setCodOpen(true);
    return run(() => markDelivered(delivery.id));
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={closeAssignmentView} style={styles.backBtn}>
          <BackIcon />
        </Pressable>
        <Text style={styles.headerTitle}>Order #{delivery.id}</Text>
      </View>
      <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
        <View style={styles.stageChip}>
          <Text style={styles.stageChipText}>{stage.stageLabel}</Text>
        </View>
        {delivery.isClubbed && <Text style={styles.club}>Clubbed pickup — {delivery.categoriesLabel}, one kitchen</Text>}

        <View style={styles.locationCard}>
          <Text style={styles.locationLabel}>{stage.locationLabel}</Text>
          {stage.locationName && <Text style={styles.locationName}>{stage.locationName}</Text>}
          <Text style={styles.locationAddress}>
            {stage.locationAddress ?? (stage.locationLabel === 'Pick up from' ? "Kitchen address isn't available yet — check with support if you can't find it." : '')}
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Items</Text>
        {delivery.items.map((it) => (
          <View key={it.itemId} style={styles.itemRow}>
            <Text style={styles.itemName}>{it.name}</Text>
            <Text style={styles.itemQty}>× {it.quantity}</Text>
          </View>
        ))}
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Payment</Text>
          <Text style={styles.paymentValue}>
            {paymentLabel(delivery.paymentMethod)} · {formatMoney(delivery.grandTotal)}
          </Text>
        </View>

        {!!error && <Text style={styles.error}>{error}</Text>}
      </ScrollView>
      <View style={styles.footer}>
        <Button
          label="Navigate"
          variant="outline"
          color={colors.primaryMid}
          height={48}
          disabled={stage.lat == null && !stage.locationAddress}
          onPress={() => openMapsDirections({ lat: stage.lat, lng: stage.lng, address: stage.locationAddress })}
        />
        <Button label={stage.primaryLabel} height={50} loading={busy} onPress={onPrimaryAction} />
      </View>
      {codOpen && (
        <CodSheet
          amount={delivery.grandTotal}
          onClose={() => setCodOpen(false)}
          onConfirm={() => markDelivered(delivery.id, delivery.grandTotal)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: colors.surfaceAlt },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingTop: 18, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.borderAlt },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(37,28,33,0.06)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: fonts.heading, fontSize: 19, color: colors.ink },
  content: { padding: 20, paddingBottom: 24, gap: 4 },
  stageChip: { alignSelf: 'flex-start', paddingHorizontal: 11, paddingVertical: 5, borderRadius: 99, backgroundColor: colors.primaryTint },
  stageChipText: { fontFamily: fonts.bodyExtraBold, fontSize: 11, color: colors.primaryMid },
  club: { marginTop: 8, fontFamily: fonts.bodyBold, fontSize: 11.5, color: colors.primaryMid },
  locationCard: { marginTop: 16, padding: 15, borderRadius: 14, borderWidth: 1, borderColor: colors.borderAlt },
  locationLabel: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: colors.mutedLight },
  locationName: { marginTop: 5, fontFamily: fonts.bodyExtraBold, fontSize: 15, color: colors.ink },
  locationAddress: { marginTop: 3, fontFamily: fonts.body, fontSize: 12.5, lineHeight: 18, color: colors.bodyMuted },
  sectionLabel: { marginTop: 16, fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: colors.mutedLight },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  itemName: { fontFamily: fonts.body, fontSize: 13.5, color: colors.ink },
  itemQty: { fontFamily: fonts.body, fontSize: 13.5, color: colors.bodyMuted },
  paymentRow: { marginTop: 14, flexDirection: 'row', justifyContent: 'space-between' },
  paymentLabel: { fontFamily: fonts.bodyExtraBold, fontSize: 13.5, color: colors.ink },
  paymentValue: { fontFamily: fonts.bodyExtraBold, fontSize: 13.5, color: colors.ink },
  error: { marginTop: 14, fontFamily: fonts.bodyBold, fontSize: 12.5, color: '#C0524A' },
  footer: { flexDirection: 'column', gap: 10, padding: 14, paddingHorizontal: 18, borderTopWidth: 1, borderTopColor: colors.borderAlt, backgroundColor: colors.surface },
});
