import { StyleSheet, FlatList, TouchableOpacity, View, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BlurView } from 'expo-blur';
import { useState, useEffect } from 'react';
import { APIService, Contact } from '@/services/api.service';
import { useCall } from '@/contexts/call-context';

export default function ContactsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const { makeCall, isDeviceReady } = useCall();
  const [contacts, setContacts] = useState<Contact[]>([]);

  const fetchContacts = () => setContacts(APIService.getContacts());

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleContactDetail = (contact: Contact) => {
    router.push('/(modals)/contact-detail'); // Optionally pass contact.id as param
  };

  const handleAddContact = () => {
    router.push('/(modals)/add-contact');
  };

  const handleMakeCall = async (contact: Contact) => {
    if (!isDeviceReady) return;
    try {
      await makeCall(contact.phone);
      router.push('/(modals)/active-call');
    } catch (error) {
      console.error('Failed to make call:', error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.decorativeBlur, styles.blur1, { backgroundColor: isDark ? 'rgba(236, 72, 153, 0.15)' : 'rgba(236, 72, 153, 0.1)' }]} />

      <View style={styles.header}>
        <ThemedText type="title">Contacts</ThemedText>
        <TouchableOpacity style={styles.addButton} onPress={handleAddContact}>
          <IconSymbol name="plus.circle.fill" size={32} color="#10B981" />
        </TouchableOpacity>
      </View>

      <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.searchBar}>
        <IconSymbol name="magnifyingglass" size={20} color={isDark ? '#94A3B8' : '#6B7280'} />
        <TextInput
          placeholder="Search contacts..."
          placeholderTextColor={isDark ? '#94A3B8' : '#6B7280'}
          style={styles.searchInput}
        />
      </BlurView>

      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.contactCard}>
            <TouchableOpacity
              style={styles.contactContent}
              onPress={() => handleContactDetail(item)}
            >
              <View style={[styles.avatar, { backgroundColor: item.avatarColor }]}>
                <ThemedText style={styles.avatarText}>{item.name[0]}</ThemedText>
              </View>
              <View style={styles.contactInfo}>
                <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
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
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  decorativeBlur: { position: 'absolute', width: 250, height: 250, borderRadius: 200, top: -80, right: -60, opacity: 0.6 },
  blur1: {},
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
  addButton: {},
  searchBar: { marginHorizontal: 20, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  searchInput: { flex: 1, fontSize: 16, color: '#111827' },
  contactCard: { marginHorizontal: 20, marginBottom: 12, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  contactContent: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  avatar: { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: '600' },
  contactInfo: { flex: 1 },
  phone: { fontSize: 14, opacity: 0.6, marginTop: 4 },
  favoriteBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(245, 158, 11, 0.1)', justifyContent: 'center', alignItems: 'center' },
  callIconButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(16, 185, 129, 0.1)', justifyContent: 'center', alignItems: 'center' },
});
