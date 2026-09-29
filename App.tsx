import React, { useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import {
  BricolageGrotesque_700Bold,
  BricolageGrotesque_800ExtraBold,
} from '@expo-google-fonts/bricolage-grotesque';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { RiderProfileProvider, useRiderProfile } from './src/context/RiderProfileContext';
import { DeliveryProvider, useDelivery } from './src/context/DeliveryContext';
import BottomNav, { Tab } from './src/components/BottomNav';
import LoginScreen from './src/screens/LoginScreen';
import OnboardingProfileScreen from './src/screens/OnboardingProfileScreen';
import AgreementScreen from './src/screens/AgreementScreen';
import HomeScreen from './src/screens/HomeScreen';
import EarningsScreen from './src/screens/EarningsScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import TakeoverScreen from './src/screens/TakeoverScreen';
import AssignmentScreen from './src/screens/AssignmentScreen';
import { colors, fonts, status } from './src/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

const TITLES: Record<Tab, string> = {
  home: 'Fengle for Riders',
  earnings: 'Earnings',
  history: 'Delivery history',
  profile: 'Profile',
};

function OnlineToggle() {
  const { online, togglingOnline, toggleOnline } = useDelivery();
  return (
    <Pressable onPress={togglingOnline ? undefined : toggleOnline} style={[styles.togglePill, { backgroundColor: online ? status.onlineBg : status.offlineBg }]}>
      {togglingOnline ? (
        <ActivityIndicator size="small" color={online ? status.online : colors.bodyMuted} />
      ) : (
        <Text style={[styles.toggleLabel, { color: online ? status.online : colors.bodyMuted }]}>{online ? 'Online' : 'Offline'}</Text>
      )}
      <View style={[styles.toggleTrack, { backgroundColor: online ? status.online : status.trackOff }]}>
        <View style={[styles.toggleThumb, online && styles.toggleThumbOn]} />
      </View>
    </Pressable>
  );
}

function Shell() {
  const [tab, setTab] = useState<Tab>('home');
  const { newAssignment, activeDelivery, assignmentViewOpen, closeAssignmentView } = useDelivery();

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (newAssignment) return true; // no decline — an unanswered assignment can't be dismissed
      if (activeDelivery && assignmentViewOpen) {
        closeAssignmentView();
        return true;
      }
      if (tab !== 'home') {
        setTab('home');
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [newAssignment, activeDelivery, assignmentViewOpen, closeAssignmentView, tab]);

  if (newAssignment) {
    return (
      <>
        <StatusBar style="light" />
        <TakeoverScreen key={newAssignment.id} delivery={newAssignment} />
      </>
    );
  }

  if (activeDelivery && assignmentViewOpen) {
    return (
      <>
        <StatusBar style="dark" />
        <AssignmentScreen key={activeDelivery.id} delivery={activeDelivery} />
      </>
    );
  }

  return (
    <View style={styles.flex}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.flex} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>{TITLES[tab]}</Text>
          {tab === 'home' && <OnlineToggle />}
        </View>
        {tab === 'home' && <HomeScreen />}
        {tab === 'earnings' && <EarningsScreen />}
        {tab === 'history' && <HistoryScreen />}
        {tab === 'profile' && <ProfileScreen />}
      </SafeAreaView>
      <BottomNav tab={tab} onChange={setTab} homeAlert={!!activeDelivery && !assignmentViewOpen} />
    </View>
  );
}

function ProfileGate() {
  const { loading, needsOnboarding, needsAgreement, refresh } = useRiderProfile();
  if (loading) return null;
  if (needsOnboarding) {
    return (
      <View style={styles.root}>
        <StatusBar style="dark" />
        <OnboardingProfileScreen />
      </View>
    );
  }
  // Checked after onboarding, before deliveries — has no effect until the
  // backend ships `agreementRequired` (see RiderProfileContext).
  if (needsAgreement) {
    return (
      <View style={styles.root}>
        <StatusBar style="dark" />
        <AgreementScreen onAccepted={refresh} />
      </View>
    );
  }
  return (
    <DeliveryProvider>
      <Shell />
    </DeliveryProvider>
  );
}

function Main() {
  const [fontsLoaded, fontError] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
    BricolageGrotesque_700Bold,
    BricolageGrotesque_800ExtraBold,
  });
  const { isLoading: authLoading, isLoggedIn } = useAuth();
  const ready = (fontsLoaded || fontError) && !authLoading;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  if (!isLoggedIn) {
    return (
      <View style={styles.root}>
        <StatusBar style="dark" />
        <LoginScreen />
      </View>
    );
  }

  // Profile (and deliveries/polling within it) only exist while signed in;
  // remounting on login/logout gives every session a clean slate.
  return (
    <View style={styles.root}>
      <RiderProfileProvider>
        <ProfileGate />
      </RiderProfileProvider>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Main />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: { flex: 1, backgroundColor: colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 14 },
  title: { fontFamily: fonts.heading, fontSize: 20, letterSpacing: -0.5, color: colors.ink },
  togglePill: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 32, paddingLeft: 12, paddingRight: 4, borderRadius: 99 },
  toggleLabel: { fontFamily: fonts.bodyExtraBold, fontSize: 12 },
  toggleTrack: { width: 26, height: 24, borderRadius: 99, alignItems: 'flex-start', justifyContent: 'center', padding: 2 },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.white },
  toggleThumbOn: { alignSelf: 'flex-end' },
});
