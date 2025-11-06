import {
  StyleSheet,
  FlatList,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BlurView } from 'expo-blur';
import React, { useState, useEffect, useCallback } from 'react';
import { useCall } from '@/contexts/call-context';
import { useFocusEffect } from '@react-navigation/native';

// Import Contact type from @/types
import type { Contact } from '@/types';
import { APIService } from '@/services/api.services';
import { NativeContactsService, NativeContact } from '@/services/native-contacts.service';
import { getFirstInitial } from '@/utils';

type DisplayContact = Contact | NativeContact;

function isNativeContact(contact: DisplayContact): contact is NativeContact {
  return 'isNativeContact' in contact && contact.isNativeContact === true;
}

export default function ContactsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const { makeCall, isDeviceReady } = useCall();

  const [backendContacts, setBackendContacts] = useState<Contact[]>([]);
  const [nativeContacts, setNativeContacts] = useState<NativeContact[]>([]);
  const [displayedContacts, setDisplayedContacts] = useState<DisplayContact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingNative, setIsLoadingNative] = useState(false);
  const [hasContactsPermission, setHasContactsPermission] = useState(false);

  // Filter options
  const [filterOption, setFilterOption] = useState<'all' | 'backend' | 'native'>('all');

  /**
   * Load contacts from backend
   */
  const loadBackendContacts = useCallback(() => {
    const contacts = APIService.getContacts();
    setBackendContacts(contacts);
  }, []);

  /**
   * Load native contacts from device
   */
  const loadNativeContacts = useCallback(async () => {
    if (Platform.OS === 'web') {
      return;
    }

    setIsLoadingNative(true);

    try {
      const contacts = await NativeContactsService.fetchContacts();
      setNativeContacts(contacts);
      setHasContactsPermission(true);

      console.log(`✅ Loaded ${contacts.length} native contacts`);
    } catch (error) {
      console.error('Failed to load native contacts:', error);

      Alert.alert(
        'Contacts Access',
        'Unable to access your contacts. Please check app permissions in Settings.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoadingNative(false);
    }
  }, []);

  /**
   * Check permission and load native contacts
   */
  const checkPermissionAndLoadNativeContacts = useCallback(async () => {
    if (Platform.OS === 'web') {
      console.log('Native contacts not available on web');
      return;
    }

    try {
      const hasPermission = await NativeContactsService.hasPermission();
      setHasContactsPermission(hasPermission);

      if (hasPermission) {
        await loadNativeContacts();
      }
    } catch (error) {
      console.error('Error checking contacts permission:', error);
    }
  }, [loadNativeContacts]);

  /**
   * Update displayed contacts based on filters
   */
  const updateDisplayedContacts = useCallback(() => {
    let contacts: DisplayContact[] = [];

    // Apply filter
    switch (filterOption) {
      case 'backend':
        contacts = backendContacts;
        break;
      case 'native':
        contacts = nativeContacts;
        break;
      case 'all':
      default:
        contacts = NativeContactsService.mergeContacts(backendContacts, nativeContacts);
        break;
    }

    // Apply search
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase().trim();
      contacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(lowerQuery) ||
        contact.phone.includes(lowerQuery)
      );
    }

    // Sort: favorites first, then alphabetically
    contacts.sort((a, b) => {
      if (a.favorite !== b.favorite) {
        return a.favorite ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    setDisplayedContacts(contacts);
  }, [backendContacts, nativeContacts, filterOption, searchQuery]);

  // Load contacts on mount
  useEffect(() => {
    loadBackendContacts();
    checkPermissionAndLoadNativeContacts();
  }, [loadBackendContacts, checkPermissionAndLoadNativeContacts]);

  // Reload on focus
  useFocusEffect(
    useCallback(() => {
      loadBackendContacts();
    }, [loadBackendContacts])
  );

  // Update displayed contacts when filters change
  useEffect(() => {
    updateDisplayedContacts();
  }, [updateDisplayedContacts]);

  /**
   * Request contacts permission
   */
  const handleRequestPermission = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Available', 'Contact access is not available on web.');
      return;
    }

    try {
      const granted = await NativeContactsService.requestPermission();

      if (granted) {
        setHasContactsPermission(true);
        await loadNativeContacts();
      } else {
        Alert.alert(
          'Permission Denied',
          'To access your contacts, please enable contacts permission in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => {
                // You can implement opening settings if needed
                // import { Linking } from 'react-native';
                // Linking.openSettings();
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      Alert.alert('Error', 'Failed to request contacts permission');
    }
  };

  /**
   * Handle contact detail navigation
   */
  const handleContactDetail = (contact: DisplayContact) => {
    if (isNativeContact(contact)) {
      // For native contacts, show quick call dialog
      Alert.alert(
        contact.name,
        contact.phone,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Call',
            onPress: () => handleMakeCall(contact),
          },
          {
            text: 'Add to FlexCalling',
            onPress: () => router.push({
              pathname: '/(modals)/add-contact',
              params: {
                name: contact.name,
                phone: contact.phone,
                email: contact.email,
              } as any
            }),
          },
        ]
      );
    } else {
      router.push({
        pathname: '/(modals)/contact-detail',
        params: { contactId: contact.id }
      });
    }
  };

  /**
   * Handle add contact
   */
  const handleAddContact = () => {
    router.push('/(modals)/add-contact');
  };

  /**
   * Handle make call
   */
  const handleMakeCall = async (contact: DisplayContact) => {
    if (!isDeviceReady) {
      Alert.alert('Not Ready', 'Device is not ready to make calls');
      return;
    }

    try {
      await makeCall(contact.phone);
      router.push('/(modals)/active-call');
    } catch (error) {
      console.error('Failed to make call:', error);
      Alert.alert('Error', 'Failed to make call');
    }
  };

  /**
   * Render contact item
   */
  const renderContactItem = ({ item }: { item: DisplayContact }) => (
    <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.contactCard}>
      <TouchableOpacity
        style={styles.contactContent}
        onPress={() => handleContactDetail(item)}
      >
        <View style={[styles.avatar, { backgroundColor: item.avatarColor }]}>
          <ThemedText style={styles.avatarText}>{getFirstInitial(item.name)}</ThemedText>
        </View>

        <View style={styles.contactInfo}>
          <View style={styles.nameRow}>
            <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
            {isNativeContact(item) && (
              <View style={styles.nativeBadge}>
                <IconSymbol name="phone.fill" size={10} color="#6B7280" />
              </View>
            )}
          </View>
          <ThemedText style={styles.phone}>{item.phone}</ThemedText>
        </View>

        {item.favorite && (
          <View style={styles.favoriteBadge}>
            <IconSymbol name="star.fill" size={16} color="#F59E0B" />
          </View>
        )}

        <TouchableOpacity
          style={styles.callIconButton}
          onPress={() => handleMakeCall(item)}
        >
          <IconSymbol name="phone.fill" size={20} color="#10B981" />
        </TouchableOpacity>
      </TouchableOpacity>
    </BlurView>
  );

  /**
   * Render permission request card
   */
  const renderPermissionCard = () => (
    <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.permissionCard}>
      <IconSymbol name="person.2.fill" size={48} color="#8B5CF6" />
      <ThemedText type="subtitle" style={styles.permissionTitle}>
        Access Your Contacts
      </ThemedText>
      <ThemedText style={styles.permissionDescription}>
        Allow FlexCalling to access your contacts to make calling easier.
      </ThemedText>
      <TouchableOpacity
        style={styles.permissionButton}
        onPress={handleRequestPermission}
      >
        <ThemedText style={styles.permissionButtonText}>
          Grant Permission
        </ThemedText>
      </TouchableOpacity>
    </BlurView>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.decorativeBlur, styles.blur1, { backgroundColor: isDark ? 'rgba(236, 72, 153, 0.15)' : 'rgba(236, 72, 153, 0.1)' }]} />

      <View style={styles.header}>
        <ThemedText type="title">Contacts</ThemedText>
        <TouchableOpacity style={styles.addButton} onPress={handleAddContact}>
          <IconSymbol name="plus.circle.fill" size={32} color="#10B981" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      {Platform.OS !== 'web' && hasContactsPermission && (
        <View style={styles.filterTabs}>
          <TouchableOpacity
            style={[styles.filterTab, filterOption === 'all' && styles.filterTabActive]}
            onPress={() => setFilterOption('all')}
          >
            <ThemedText style={[styles.filterTabText, filterOption === 'all' && styles.filterTabTextActive]}>
              All ({backendContacts.length + nativeContacts.length})
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, filterOption === 'backend' && styles.filterTabActive]}
            onPress={() => setFilterOption('backend')}
          >
            <ThemedText style={[styles.filterTabText, filterOption === 'backend' && styles.filterTabTextActive]}>
              Saved ({backendContacts.length})
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, filterOption === 'native' && styles.filterTabActive]}
            onPress={() => setFilterOption('native')}
          >
            <ThemedText style={[styles.filterTabText, filterOption === 'native' && styles.filterTabTextActive]}>
              Phone ({nativeContacts.length})
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}

      {/* Search Bar */}
      <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.searchBar}>
        <IconSymbol name="magnifyingglass" size={20} color={isDark ? '#94A3B8' : '#6B7280'} />
        <TextInput
          placeholder="Search contacts..."
          placeholderTextColor={isDark ? '#94A3B8' : '#6B7280'}
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <IconSymbol name="xmark.circle.fill" size={20} color={isDark ? '#94A3B8' : '#6B7280'} />
          </TouchableOpacity>
        )}
      </BlurView>

      {/* Loading State */}
      {isLoadingNative && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <ThemedText style={styles.loadingText}>Loading contacts...</ThemedText>
        </View>
      )}

      {/* Permission Request (if not granted) */}
      {Platform.OS !== 'web' && !hasContactsPermission && !isLoadingNative && renderPermissionCard()}

      {/* Empty State */}
      {!isLoadingNative && displayedContacts.length === 0 && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <IconSymbol name="person.2.fill" size={64} color={isDark ? '#475569' : '#94A3B8'} />
          <ThemedText style={{ opacity: 0.6, marginTop: 16 }}>
            {searchQuery ? 'No contacts found' : 'No contacts yet'}
          </ThemedText>
          {!hasContactsPermission && Platform.OS !== 'web' && (
            <TouchableOpacity
              style={styles.emptyActionButton}
              onPress={handleRequestPermission}
            >
              <ThemedText style={styles.emptyActionText}>
                Access Phone Contacts
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Contacts List */}
      {!isLoadingNative && displayedContacts.length > 0 && (
        <FlatList
          data={displayedContacts}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={renderContactItem}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  decorativeBlur: { position: 'absolute', width: 250, height: 250, borderRadius: 200, top: -80, right: -60, opacity: 0.6 },
  blur1: {},
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
  addButton: {},

  // Filter Tabs
  filterTabs: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 16, gap: 8 },
  filterTab: { flex: 1, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.05)', alignItems: 'center' },
  filterTabActive: { backgroundColor: '#10B981' },
  filterTabText: { fontSize: 13, fontWeight: '600', opacity: 0.7 },
  filterTabTextActive: { color: '#fff', opacity: 1 },

  // Search Bar
  searchBar: { marginHorizontal: 20, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  searchInput: { flex: 1, fontSize: 16 },

  // Loading
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  loadingText: { opacity: 0.6 },

  // Permission Card
  permissionCard: { marginHorizontal: 20, marginTop: 40, borderRadius: 24, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  permissionTitle: { marginTop: 16, marginBottom: 8 },
  permissionDescription: { textAlign: 'center', opacity: 0.7, marginBottom: 24 },
  permissionButton: { backgroundColor: '#8B5CF6', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 16 },
  permissionButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },

  // Empty State
  emptyActionButton: { marginTop: 24, backgroundColor: '#10B981', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16 },
  emptyActionText: { color: '#fff', fontWeight: '600' },

  // Contact Card
  contactCard: { marginHorizontal: 20, marginBottom: 12, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  contactContent: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  avatar: { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: '600' },
  contactInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  nativeBadge: { width: 18, height: 18, borderRadius: 9, backgroundColor: 'rgba(0,0,0,0.05)', justifyContent: 'center', alignItems: 'center' },
  phone: { fontSize: 14, opacity: 0.6, marginTop: 4 },
  favoriteBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(245, 158, 11, 0.1)', justifyContent: 'center', alignItems: 'center' },
  callIconButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(16, 185, 129, 0.1)', justifyContent: 'center', alignItems: 'center' },
});
