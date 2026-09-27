import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';
import { useDelivery } from '../context/DeliveryContext';
import { formatMoney } from '../utils/money';
import { estimateEarning } from '../utils/earnings';
import { formatDay } from '../utils/time';
import { statusStyle } from '../utils/deliveryFormat';

export default function HistoryScreen() {
  const { historyDeliveries, loading } = useDelivery();

  if (!loading && historyDeliveries.length === 0) {
    return (
      <ScrollView contentContainerStyle={styles.empty}>
        <Text style={styles.emptyText}>No deliveries yet.</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {historyDeliveries.map((d) => {
        const badge = statusStyle(d.status);
        const earning = d.status === 'delivered' ? estimateEarning(d) : null;
        return (
          <View key={d.id} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.restaurant}>{d.restaurantName ?? `Order #${d.id}`}</Text>
              <Text style={styles.date}>{formatDay(d.deliveredAt ?? d.createdAt)}</Text>
            </View>
            <Text style={styles.address}>To {d.deliveryAddress}</Text>
            <View style={styles.rowBottom}>
              <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
              </View>
              {earning != null && <Text style={styles.amount}>+{formatMoney(earning)}</Text>}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 100 },
  empty: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 100 },
  emptyText: { fontFamily: fonts.body, fontSize: 13.5, color: colors.bodyMuted },
  card: { borderRadius: 14, borderWidth: 1, borderColor: colors.borderAlt, padding: 14, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  restaurant: { fontFamily: fonts.bodyExtraBold, fontSize: 13.5, color: colors.ink },
  date: { fontFamily: fonts.body, fontSize: 11.5, color: colors.mutedLight },
  address: { marginTop: 4, fontFamily: fonts.body, fontSize: 12.5, color: colors.bodyMuted },
  rowBottom: { marginTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 99 },
  badgeText: { fontFamily: fonts.bodyExtraBold, fontSize: 10.5 },
  amount: { fontFamily: fonts.bodyExtraBold, fontSize: 13.5, color: colors.veg },
});
