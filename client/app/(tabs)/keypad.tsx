import { StyleSheet, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BlurView } from 'expo-blur';
import { PhoneInput } from '@/components/phone-input';
import { useState, useEffect } from 'react';
import { useTwilioVoice } from '@/hooks/use-twilio-voice';

// Configuration - update with your backend URL
const BACKEND_URL = __DEV__
  ? 'http://localhost:3000' // Development
  : 'https://your-production-backend.com'; // Production

export default function KeypadScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize Twilio Voice SDK
  const {
    isInitialized,
    isInitializing: twilioInitializing,
    error: twilioError,
    callState,
    incomingCall,
    makeCall,
    hangup,
    acceptIncomingCall,
    rejectIncomingCall,
  } = useTwilioVoice({
    backendUrl: BACKEND_URL,
    userId: 'user-123', // TODO: Get from auth context
  });

  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '#'],
  ];

  // Handle initialization
  useEffect(() => {
    if (!twilioInitializing) {
      setIsInitializing(false);

      if (twilioError) {
        Alert.alert(
          'Initialization Error',
          'Failed to initialize calling service. Please restart the app.',
          [{ text: 'OK' }]
        );
      }
    }
  }, [twilioInitializing, twilioError]);

  // Handle incoming calls - show modal
  useEffect(() => {
    if (incomingCall.callInvite) {
      router.push({
        pathname: '/(modals)/incoming-call',
        params: {
          from: incomingCall.from || 'Unknown',
          callerName: incomingCall.callerName || 'Unknown Caller',
        },
      });
    }
  }, [incomingCall.callInvite]);

  // Handle active call - navigate to active call screen
  useEffect(() => {
    if (callState.isActive && callState.callState === 'connected') {
      router.push({
        pathname: '/(modals)/active-call',
        params: {
          from: callState.from || '',
          to: callState.to || '',
          callSid: callState.callSid || '',
        },
      });
    }
  }, [callState.isActive, callState.callState]);

  const handleKeyPress = (key: string) => {
    setPhoneNumber(prev => prev + key);
  };

  const handleDelete = () => {
    setPhoneNumber(prev => prev.slice(0, -1));
  };

  const handleMakeCall = async () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter a phone number');
      return;
    }

    if (!isInitialized) {
      Alert.alert('Error', 'Calling service not ready. Please wait...');
      return;
    }

    // Format phone number for Kenya
    let formattedNumber = phoneNumber.trim();

    // If number doesn't start with +, add Kenya country code
    if (!formattedNumber.startsWith('+')) {
      // Remove leading 0 if present
      if (formattedNumber.startsWith('0')) {
        formattedNumber = formattedNumber.substring(1);
      }
      // Add Kenya country code
      formattedNumber = '+254' + formattedNumber;
    }

    // Validate phone number format
    const phoneRegex = /^\+\d{10,15}$/;
    if (!phoneRegex.test(formattedNumber)) {
      Alert.alert(
        'Invalid Number',
        'Please enter a valid phone number with country code.\nExample: +254712345678'
      );
      return;
    }

    try {
      console.log('📞 Initiating call to:', formattedNumber);

      // Make the call using Twilio
      await makeCall(formattedNumber, {
        callerName: 'FlexCalling User', // TODO: Get from user profile
      });

      // The useEffect hook will automatically navigate to active-call screen
      // when callState changes to 'connected'

    } catch (error: any) {
      console.error('❌ Call failed:', error);
      Alert.alert(
        'Call Failed',
        error?.message || 'Unable to place call. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // Show loading state while initializing
  if (isInitializing) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <ThemedText style={styles.loadingText}>
            Initializing calling service...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  // Show error state if initialization failed
  if (twilioError && !isInitialized) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle.fill" size={60} color="#EF4444" />
          <ThemedText type="title" style={styles.errorTitle}>
            Service Unavailable
          </ThemedText>
          <ThemedText style={styles.errorText}>
            Unable to connect to calling service.
          </ThemedText>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setIsInitializing(true);
              // Trigger re-initialization by remounting component
              router.replace('/(tabs)/keypad');
            }}
          >
            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.decorativeBlur, styles.blur1, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)' }]} />

      {/* Connection status indicator */}
      <View style={styles.statusBar}>
        <View style={styles.statusIndicator}>
          <View style={[styles.statusDot, { backgroundColor: isInitialized ? '#10B981' : '#F59E0B' }]} />
          <ThemedText style={styles.statusText}>
            {isInitialized ? 'Ready' : 'Connecting...'}
          </ThemedText>
        </View>
      </View>

      <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.phoneNumberCard}>
        <View style={styles.locationBadge}>
          <IconSymbol name="globe" size={14} color="#10B981" />
          <ThemedText style={styles.locationText}>Kenya (+254)</ThemedText>
        </View>
        <PhoneInput
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          onDelete={handleDelete}
        />
        <ThemedText style={styles.hint}>
          Enter number or select contact
        </ThemedText>
      </BlurView>

      <View style={styles.keypadContainer}>
        {keys.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keyRow}>
            {row.map((key) => (
              <BlurView key={key} intensity={isDark ? 15 : 40} tint={colorScheme} style={styles.key}>
                <TouchableOpacity
                  style={styles.keyTouchable}
                  onPress={() => handleKeyPress(key)}
                >
                  <ThemedText type="title" style={styles.keyText}>{key}</ThemedText>
                </TouchableOpacity>
              </BlurView>
            ))}
          </View>
        ))}
      </View>

      <View style={styles.actionButtons}>
        {/* Add Contact Button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            if (phoneNumber) {
              router.push({
                pathname: '/(modals)/add-contact',
                params: { phoneNumber },
              });
            }
          }}
        >
          <IconSymbol name="person.badge.plus" size={24} color={isDark ? '#F1F5F9' : '#111827'} />
        </TouchableOpacity>

        {/* Call Button */}
        <TouchableOpacity
          style={[
            styles.callButton,
            (!phoneNumber || !isInitialized) && styles.callButtonDisabled
          ]}
          disabled={!phoneNumber || !isInitialized}
          onPress={handleMakeCall}
        >
          <IconSymbol name="phone.fill" size={28} color="#fff" />
        </TouchableOpacity>

        {/* Delete Button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleDelete}
          disabled={!phoneNumber}
        >
          <IconSymbol
            name="delete.left.fill"
            size={24}
            color={phoneNumber ? (isDark ? '#F1F5F9' : '#111827') : '#9CA3AF'}
          />
        </TouchableOpacity>
      </View>

      {/* Rate Information */}
      <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.rateCard}>
        <IconSymbol name="dollarsign.circle.fill" size={20} color="#10B981" />
        <ThemedText style={styles.rateText}>
          Calls to Kenya: $0.05/min
        </ThemedText>
      </BlurView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  decorativeBlur: { position: 'absolute', width: 300, height: 300, borderRadius: 200, top: -120, left: -100, opacity: 0.6 },
  blur1: {},
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  loadingText: { fontSize: 16, opacity: 0.6 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, gap: 16 },
  errorTitle: { marginTop: 16 },
  errorText: { fontSize: 16, opacity: 0.6, textAlign: 'center' },
  retryButton: { marginTop: 24, backgroundColor: '#10B981', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 16 },
  retryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  statusBar: { paddingHorizontal: 20, marginBottom: 16 },
  statusIndicator: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-end' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, opacity: 0.8 },
  phoneNumberCard: { marginHorizontal: 20, borderRadius: 24, padding: 16, alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  locationBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginBottom: 8 },
  locationText: { fontSize: 14, color: '#10B981', fontWeight: '600' },
  hint: { fontSize: 12, opacity: 0.5, marginTop: 8 },
  keypadContainer: { gap: 8, paddingHorizontal: 20 },
  keyRow: { flexDirection: 'row', justifyContent: 'space-around', gap: 16 },
  key: { flex: 1, aspectRatio: 1, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  keyTouchable: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  keyText: { fontSize: 28 },
  actionButtons: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: 20, marginTop: 16 },
  actionButton: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(0,0,0,0.05)', justifyContent: 'center', alignItems: 'center' },
  callButton: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center', shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  callButtonDisabled: { backgroundColor: '#9CA3AF', shadowOpacity: 0 },
  rateCard: { marginHorizontal: 20, marginTop: 16, borderRadius: 16, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  rateText: { fontSize: 14, opacity: 0.8 },
});
