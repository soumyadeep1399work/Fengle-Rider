import React, { useState } from 'react';
import { KeyboardAvoidingView, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, status } from '../theme';
import Button from './Button';
import { CheckCircleIcon } from './Icons';
import { formatMoney } from '../utils/money';
import { errorMessage } from '../utils/actions';

const CODE_LENGTH = 4;

interface Props {
  /** Cash to collect — set only for a COD order. */
  codAmount?: number;
  onConfirm: (deliveryOtp: string) => Promise<void>;
  onClose: () => void;
}

// The step between "on the way" and delivered. Every order needs the 4-digit
// code the customer reads out from their app (the backend never sends it to the
// rider); a COD order also confirms the cash here, the buffer step CLAUDE.md
// requires. A plain overlay rather than <Modal>, like the other apps' sheets,
// so the keyboard lifts it instead of covering it.
export default function DeliverySheet({ codAmount, onConfirm, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function confirm() {
    setBusy(true);
    setError('');
    try {
      await onConfirm(code);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  const isCod = codAmount != null;

  return (
    <KeyboardAvoidingView style={styles.overlay} behavior="padding">
      <Pressable style={styles.scrim} onPress={busy ? undefined : onClose} />
      <View style={[styles.sheet, { paddingBottom: 24 + insets.bottom }]}>
        <View style={styles.grabber} />
        <View style={styles.checkCircle}>
          <CheckCircleIcon />
        </View>
        <Text style={styles.title}>Confirm delivery</Text>
        <Text style={styles.body}>Ask the customer for the {CODE_LENGTH}-digit delivery code shown in their app.</Text>
        <TextInput
          value={code}
          onChangeText={(t) => {
            setCode(t.replace(/\D/g, '').slice(0, CODE_LENGTH));
            setError('');
          }}
          placeholder="0000"
          placeholderTextColor={colors.mutedLight}
          keyboardType="number-pad"
          maxLength={CODE_LENGTH}
          autoFocus
          editable={!busy}
          style={styles.input}
        />
        {isCod && (
          <Text style={styles.body}>
            Please collect <Text style={styles.bold}>{formatMoney(codAmount)}</Text> in cash from the customer before confirming.
          </Text>
        )}
        {!!error && <Text style={styles.error}>{error}</Text>}
        <Button
          label={isCod ? `Confirm ${formatMoney(codAmount)} collected` : 'Mark Delivered'}
          height={52}
          loading={busy}
          disabled={code.length !== CODE_LENGTH}
          onPress={confirm}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFill, zIndex: 1000, elevation: 24, justifyContent: 'flex-end' },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(37,28,33,0.55)' },
  sheet: { backgroundColor: colors.sheetBg, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 22, gap: 12 },
  grabber: { width: 36, height: 4, borderRadius: 99, backgroundColor: colors.border, alignSelf: 'center' },
  checkCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: status.doneBg, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.heading, fontSize: 20, letterSpacing: -0.4, color: colors.ink },
  body: { fontFamily: fonts.body, fontSize: 13.5, lineHeight: 20, color: colors.bodyMuted },
  bold: { fontFamily: fonts.bodyExtraBold, color: colors.ink },
  input: {
    height: 56, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface,
    textAlign: 'center', fontFamily: fonts.bodyExtraBold, fontSize: 24, letterSpacing: 12, color: colors.ink,
  },
  error: { fontFamily: fonts.bodyBold, fontSize: 12.5, color: status.alert },
});
