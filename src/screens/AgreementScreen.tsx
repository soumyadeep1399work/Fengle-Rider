import React, { useState } from 'react';
import { Alert, Image, NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, status } from '../theme';
import { submitAgreement } from '../api/agreement';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../utils/actions';
import { takeSelfie } from '../utils/photo';
import Button from '../components/Button';

// TODO(client): placeholder terms — the client must supply the real legal
// text before launch (same status as the invoice issuer fields).
const AGREEMENT_TEXT = `This Rider Agreement (the "Agreement") is entered into between Fengle and the delivery rider named on this account ("Rider").

1. Scope. Rider agrees to collect and deliver orders assigned through the Fengle Rider app promptly and safely, in line with the vehicle and license details Rider maintains in the app.

2. Delivery conduct. Rider will collect orders only after confirming pickup with the restaurant, deliver them to the address shown in the app without unauthorised stops, and hand them to the customer in the condition received.

3. Cash on delivery. For COD orders, Rider must collect the exact amount shown in the app and confirm it honestly at the "Mark Delivered" step — this creates a wallet record used for settlement, so the amount confirmed must match what was actually collected.

4. Delivery confirmation. Where a delivery code is shown, Rider must confirm it with the customer in person before marking an order delivered — this protects both the customer and Rider by confirming the right person received the order.

5. Compliance. Rider confirms the vehicle and license details on file are accurate and current, and will obey all applicable traffic and road safety laws while making deliveries on Fengle's behalf.

6. Payments. Rider's earnings are settled per the rate and schedule described in the app's Earnings tab; this in-app Agreement does not itself set or guarantee a rate.

7. Acceptance. By ticking the box below and completing photo verification, the person completing this step confirms they are Rider, and that they are personally accepting this Agreement.

This in-app Agreement governs Rider's use of the Fengle Rider app.`;

type Step = 'terms' | 'selfie';

function DeniedBanner({ reason }: { reason?: string | null }) {
  if (!reason) return null;
  return (
    <View style={bannerStyles.box}>
      <Text style={bannerStyles.title}>Your photo wasn’t approved</Text>
      <Text style={bannerStyles.text}>{reason}. Please read the agreement and take a new photo.</Text>
    </View>
  );
}

const bannerStyles = StyleSheet.create({
  box: { marginTop: 12, padding: 12, borderRadius: 12, backgroundColor: '#FBE9E7' },
  title: { fontFamily: fonts.bodyExtraBold, fontSize: 13, color: status.alert },
  text: { marginTop: 3, fontFamily: fonts.body, fontSize: 12.5, lineHeight: 18, color: colors.body },
});

export default function AgreementScreen({ onAccepted, deniedReason }: { onAccepted: () => void; deniedReason?: string | null }) {
  const { logout } = useAuth();
  const [step, setStep] = useState<Step>('terms');
  const [scrolledToEnd, setScrolledToEnd] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [selfieUri, setSelfieUri] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function onScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    if (scrolledToEnd) return;
    const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
    if (contentOffset.y + layoutMeasurement.height >= contentSize.height - 24) setScrolledToEnd(true);
  }

  async function openCamera() {
    setError('');
    try {
      const uri = await takeSelfie();
      if (uri) setSelfieUri(uri);
    } catch (e) {
      Alert.alert('Couldn’t open the camera', errorMessage(e));
    }
  }

  async function submit() {
    if (!selfieUri) return;
    setBusy(true);
    setError('');
    try {
      await submitAgreement(selfieUri);
      onAccepted();
    } catch (e) {
      setError(errorMessage(e));
      setBusy(false);
    }
  }

  if (step === 'terms') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <Text style={styles.title}>Rider agreement</Text>
        <DeniedBanner reason={deniedReason} />
        <Text style={styles.subtitle}>Please read the agreement below before you start taking deliveries.</Text>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.termsBox} onScroll={onScroll} scrollEventThrottle={64}>
          <Text style={styles.termsText}>{AGREEMENT_TEXT}</Text>
          {!scrolledToEnd && <Text style={styles.scrollHint}>Scroll to the end to continue</Text>}
        </ScrollView>
        <Pressable
          onPress={() => scrolledToEnd && setConfirmed((c) => !c)}
          style={[styles.checkboxRow, !scrolledToEnd && styles.checkboxRowDisabled]}
        >
          <View style={[styles.checkbox, confirmed && styles.checkboxOn]}>{confirmed && <Text style={styles.checkboxTick}>✓</Text>}</View>
          <Text style={styles.checkboxLabel}>I am this account's rider, and I agree to these terms.</Text>
        </Pressable>
        <Button label="Continue to verification" height={52} disabled={!confirmed} onPress={() => setStep('selfie')} style={styles.cta} />
        <Text style={styles.logout} onPress={() => logout()}>
          Not the right account? Log out
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <Text style={styles.title}>Verify it’s you</Text>
      <DeniedBanner reason={deniedReason} />
      <Text style={styles.subtitle}>
        Take a live photo to confirm you personally accepted this agreement. Photos from your gallery can’t be used — the camera opens
        directly.
      </Text>
      <View style={styles.selfieArea}>
        {selfieUri ? (
          <Image source={{ uri: selfieUri }} style={styles.selfiePreview} />
        ) : (
          <Pressable onPress={openCamera} style={styles.cameraBtn}>
            <Text style={styles.cameraBtnText}>Open camera</Text>
          </Pressable>
        )}
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
      {selfieUri && (
        <View style={styles.selfieActions}>
          <Button label="Retake" variant="outline" height={50} disabled={busy} onPress={openCamera} style={styles.flex} />
          <Button label="Confirm & submit" height={52} loading={busy} onPress={submit} style={styles.flex} />
        </View>
      )}
      <Pressable onPress={() => setStep('terms')} disabled={busy}>
        <Text style={styles.back}>Back to agreement</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: colors.surface, paddingHorizontal: 22 },
  title: { marginTop: 14, fontFamily: fonts.heading, fontSize: 22, letterSpacing: -0.5, color: colors.ink },
  subtitle: { marginTop: 8, fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: colors.bodyMuted },
  scroll: { flex: 1, marginTop: 16, borderRadius: 14, borderWidth: 1, borderColor: colors.borderAlt },
  termsBox: { padding: 16 },
  termsText: { fontFamily: fonts.body, fontSize: 13, lineHeight: 20, color: colors.body },
  scrollHint: { marginTop: 16, textAlign: 'center', fontFamily: fonts.bodyBold, fontSize: 11.5, color: colors.mutedLight },
  checkboxRow: { marginTop: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  checkboxRowDisabled: { opacity: 0.4 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  checkboxOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkboxTick: { color: colors.surfaceCream, fontSize: 13, fontFamily: fonts.bodyExtraBold },
  checkboxLabel: { flex: 1, fontFamily: fonts.bodyBold, fontSize: 13, lineHeight: 19, color: colors.ink },
  cta: { marginTop: 16 },
  logout: { marginTop: 14, marginBottom: 10, textAlign: 'center', fontFamily: fonts.bodyBold, fontSize: 12.5, color: colors.mutedLight },
  selfieArea: { marginTop: 24, alignItems: 'center' },
  cameraBtn: { width: '100%', height: 220, borderRadius: 16, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0E8E2' },
  cameraBtnText: { fontFamily: fonts.bodyExtraBold, fontSize: 14, color: colors.primaryMid },
  selfiePreview: { width: '100%', height: 320, borderRadius: 16 },
  error: { marginTop: 14, fontFamily: fonts.bodyBold, fontSize: 12.5, color: status.alert, textAlign: 'center' },
  selfieActions: { marginTop: 18, flexDirection: 'row', gap: 10 },
  back: { marginTop: 18, textAlign: 'center', fontFamily: fonts.bodyBold, fontSize: 12.5, color: colors.mutedLight },
});
