import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, status } from '../theme';
import { useDelivery } from '../context/DeliveryContext';
import Button from '../components/Button';
import { OfflineIcon } from '../components/Icons';
import { itemsSummary } from '../utils/deliveryFormat';

export default function HomeScreen() {
  const { online, togglingOnline, toggleOnline, activeDelivery, assignmentViewOpen, openAssignmentView, loadError, locationError } = useDelivery();

  if (!online) {
    return (
      <ScrollView contentContainerStyle={styles.centerFill}>
        <View style={styles.offlineIconWrap}>
          <OfflineIcon />
        </View>
        <Text style={styles.title}>You're offline</Text>
        <Text style={styles.subtitle}>Go online to start receiving delivery requests near you.</Text>
        <Button label="Go online" variant="gold" height={48} style={styles.goOnlineBtn} loading={togglingOnline} onPress={toggleOnline} />
        {!!locationError && <Text style={styles.error}>{locationError}</Text>}
      </ScrollView>
    );
  }

  if (activeDelivery && !assignmentViewOpen) {
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={openAssignmentView} style={styles.activeCard}>
          <Text style={styles.activeCardEyebrow}>Active delivery — Order #{activeDelivery.id}</Text>
          <Text style={styles.activeCardTitle}>{activeDelivery.restaurantName ?? 'Restaurant'}</Text>
          <Text style={styles.activeCardSummary}>{itemsSummary(activeDelivery.items)}</Text>
          <Text style={styles.activeCardTap}>Tap to continue →</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.centerFill}>
      <View style={styles.dot} />
      <Text style={styles.title}>Looking for orders near you…</Text>
      <Text style={styles.subtitle}>We'll alert you the moment a delivery comes in.</Text>
      {!!loadError && <Text style={styles.error}>{loadError}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 100 },
  centerFill: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 30, paddingTop: 60, paddingBottom: 100 },
  offlineIconWrap: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.greyChipBg, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: status.online },
  title: { fontFamily: fonts.bodyExtraBold, fontSize: 16, color: colors.ink, textAlign: 'center' },
  subtitle: { fontFamily: fonts.body, fontSize: 13, color: colors.bodyMuted, textAlign: 'center', maxWidth: 240 },
  goOnlineBtn: { marginTop: 8, paddingHorizontal: 26, alignSelf: 'center', minWidth: 160 },
  error: { marginTop: 8, fontFamily: fonts.bodyBold, fontSize: 12.5, color: status.alert, textAlign: 'center' },
  activeCard: { padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.borderAlt, backgroundColor: colors.surface, gap: 4 },
  activeCardEyebrow: { fontFamily: fonts.bodyExtraBold, fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.primaryMid },
  activeCardTitle: { fontFamily: fonts.heading, fontSize: 18, color: colors.ink },
  activeCardSummary: { fontFamily: fonts.body, fontSize: 13, color: colors.bodyMuted },
  activeCardTap: { marginTop: 6, fontFamily: fonts.bodyBold, fontSize: 12.5, color: colors.primaryMid },
});
