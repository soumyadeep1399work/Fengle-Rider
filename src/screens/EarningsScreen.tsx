import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, status } from '../theme';
import { useDelivery } from '../context/DeliveryContext';
import { fetchBalance, fetchLedger } from '../api/wallet';
import { WalletLedgerEntry } from '../types';
import { formatMoney } from '../utils/money';
import { estimateEarning } from '../utils/earnings';
import { daysAgoStart, formatDay, formatWeekday } from '../utils/time';
import { errorMessage } from '../utils/actions';

const LEDGER_LABEL: Record<WalletLedgerEntry['reason'], string> = {
  cod_collected: 'Cash collected (COD)',
  settlement_payout: 'Settlement payout',
  settlement_deduction: 'Settlement deduction',
  order_refund: 'Order refund',
  order_payment: 'Order payment',
  manual_adjustment: 'Manual adjustment',
};

export default function EarningsScreen() {
  const { historyDeliveries } = useDelivery();
  const [balance, setBalance] = useState<number | null>(null);
  const [ledger, setLedger] = useState<WalletLedgerEntry[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [{ balance: b }, entries] = await Promise.all([fetchBalance(), fetchLedger(10)]);
        if (!cancelled) {
          setBalance(Number(b));
          setLedger(entries);
        }
      } catch (e) {
        if (!cancelled) setError(errorMessage(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const delivered = useMemo(() => historyDeliveries.filter((d) => d.status === 'delivered' && d.deliveredAt), [historyDeliveries]);

  const todayStart = daysAgoStart(0);
  const todayDeliveries = delivered.filter((d) => Date.parse(d.deliveredAt as string) >= todayStart);
  const todayEarnings = todayDeliveries.reduce((sum, d) => sum + (estimateEarning(d) ?? 0), 0);

  const weekStart = daysAgoStart(6);
  const weekDeliveries = delivered.filter((d) => Date.parse(d.deliveredAt as string) >= weekStart);
  const weekByDay = useMemo(() => {
    const map = new Map<string, { day: string; count: number; amount: number }>();
    for (const d of weekDeliveries) {
      const key = formatDay(d.deliveredAt);
      const day = key === 'Today' ? 'Today' : formatWeekday(d.deliveredAt as string);
      const entry = map.get(day) ?? { day, count: 0, amount: 0 };
      entry.count += 1;
      entry.amount += estimateEarning(d) ?? 0;
      map.set(day, entry);
    }
    return [...map.values()];
  }, [weekDeliveries]);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <LinearGradient colors={['#6423C9', '#4B18A6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <Text style={styles.heroLabel}>Today's earnings (estimate)</Text>
        <Text style={styles.heroValue}>{formatMoney(todayEarnings)}</Text>
        <Text style={styles.heroSub}>{todayDeliveries.length} deliveries completed</Text>
      </LinearGradient>

      {balance != null && (
        <View style={[styles.banner, balance >= 0 ? styles.bannerDue : styles.bannerOwed]}>
          {balance >= 0 ? (
            <>
              <Text style={styles.bannerTitleDue}>{formatMoney(balance)} ready for payout</Text>
              <Text style={styles.bannerBodyDue}>Settled amounts arrive in your linked bank account. Estimates above are unsettled.</Text>
            </>
          ) : (
            <>
              <Text style={styles.bannerTitleOwed}>{formatMoney(Math.abs(balance))} balance owed from COD collections</Text>
              <Text style={styles.bannerBodyOwed}>This is adjusted automatically at your next settlement — no action needed.</Text>
            </>
          )}
        </View>
      )}

      {!!error && <Text style={styles.error}>{error}</Text>}

      <Text style={styles.sectionLabel}>This week (estimate)</Text>
      {weekByDay.length === 0 ? (
        <Text style={styles.empty}>No deliveries yet this week.</Text>
      ) : (
        weekByDay.map((w) => (
          <View key={w.day} style={styles.row}>
            <View>
              <Text style={styles.rowTitle}>{w.day}</Text>
              <Text style={styles.rowSub}>{w.count} {w.count === 1 ? 'delivery' : 'deliveries'}</Text>
            </View>
            <Text style={styles.rowAmount}>{formatMoney(w.amount)}</Text>
          </View>
        ))
      )}

      <Text style={styles.sectionLabel}>Wallet activity</Text>
      {ledger.length === 0 ? (
        <Text style={styles.empty}>Nothing yet.</Text>
      ) : (
        ledger.map((e) => (
          <View key={e.id} style={styles.row}>
            <View>
              <Text style={styles.rowTitle}>{LEDGER_LABEL[e.reason] ?? e.reason}</Text>
              <Text style={styles.rowSub}>{formatDay(e.createdAt)}</Text>
            </View>
            <Text style={[styles.rowAmount, { color: e.entryType === 'credit' ? status.doneText : status.alert }]}>
              {e.entryType === 'credit' ? '+' : '−'}{formatMoney(e.amount)}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 100 },
  hero: { borderRadius: 16, padding: 20 },
  heroLabel: { fontFamily: fonts.bodyBold, fontSize: 11.5, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,248,244,0.75)' },
  heroValue: { marginTop: 6, fontFamily: fonts.heading, fontSize: 30, letterSpacing: -0.8, color: colors.surfaceCream },
  heroSub: { marginTop: 6, fontFamily: fonts.body, fontSize: 11.5, color: 'rgba(255,248,244,0.75)' },
  banner: { marginTop: 16, padding: 15, borderRadius: 14, borderWidth: 1 },
  bannerDue: { backgroundColor: status.doneBg, borderColor: '#CFE6D8' },
  bannerOwed: { backgroundColor: status.goldBannerBg, borderColor: status.goldBannerBorder },
  bannerTitleDue: { fontFamily: fonts.bodyExtraBold, fontSize: 13.5, color: status.doneText },
  bannerBodyDue: { marginTop: 4, fontFamily: fonts.body, fontSize: 12, lineHeight: 18, color: '#4A6B57' },
  bannerTitleOwed: { fontFamily: fonts.bodyExtraBold, fontSize: 13.5, color: status.goldBannerText },
  bannerBodyOwed: { marginTop: 4, fontFamily: fonts.body, fontSize: 12, lineHeight: 18, color: colors.bodyMuted },
  sectionLabel: { marginTop: 20, fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: colors.mutedLight },
  empty: { marginTop: 10, fontFamily: fonts.body, fontSize: 13, color: colors.bodyMuted },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  rowTitle: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.ink },
  rowSub: { marginTop: 2, fontFamily: fonts.body, fontSize: 11, color: colors.mutedLight },
  rowAmount: { fontFamily: fonts.bodyExtraBold, fontSize: 13.5, color: colors.ink },
  error: { marginTop: 12, fontFamily: fonts.bodyBold, fontSize: 12.5, color: status.alert },
});
