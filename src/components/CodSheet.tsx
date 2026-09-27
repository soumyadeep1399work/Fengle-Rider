import React, { useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, status } from '../theme';
import Button from './Button';
import { CheckCircleIcon } from './Icons';
import { formatMoney } from '../utils/money';
import { errorMessage } from '../utils/actions';

interface Props {
  amount: number;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

// The buffer step CLAUDE.md requires between "on the way" and "Mark Delivered"
// for a COD order — the flatboard didn't originally show it (see
// fengle-open-issues memory), but the decoded flatboard for this rider portal
// already includes it, so it's built to match exactly.
export default function CodSheet({ amount, onConfirm, onClose }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function confirm() {
    setBusy(true);
    setError('');
    try {
      await onConfirm();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal transparent animationType="fade" onRequestClose={busy ? undefined : onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.grabber} />
          <View style={styles.checkCircle}>
            <CheckCircleIcon />
          </View>
          <Text style={styles.title}>Confirm cash collected</Text>
          <Text style={styles.body}>
            Please collect <Text style={styles.bold}>{formatMoney(amount)}</Text> in cash from the customer before confirming.
          </Text>
          {!!error && <Text style={styles.error}>{error}</Text>}
          <Button label={`Confirm ${formatMoney(amount)} collected`} height={52} loading={busy} onPress={confirm} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(37,28,33,0.55)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.sheetBg, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 22, paddingBottom: 30, gap: 12 },
  grabber: { width: 36, height: 4, borderRadius: 99, backgroundColor: colors.border, alignSelf: 'center' },
  checkCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: status.doneBg, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.heading, fontSize: 20, letterSpacing: -0.4, color: colors.ink },
  body: { fontFamily: fonts.body, fontSize: 13.5, lineHeight: 20, color: colors.bodyMuted },
  bold: { fontFamily: fonts.bodyExtraBold, color: colors.ink },
  error: { fontFamily: fonts.bodyBold, fontSize: 12.5, color: status.alert },
});
