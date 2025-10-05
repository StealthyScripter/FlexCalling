import { StyleSheet, TextInput, TouchableOpacity, View, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BlurView } from 'expo-blur';
import { useState } from 'react';

export default function AddContactScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const [isFavorite, setIsFavorite] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');

  const handleSave = () => {
    if (!firstName || !phoneNumber) {
      Alert.alert('Error', 'Please enter at least a name and phone number');
      return;
    }

    // TODO: Save contact to database
    Alert.alert('Success', 'Contact saved successfully', [
      {
        text: 'OK',
        onPress: () => router.back()
      }
    ]);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.decorativeBlur, { backgroundColor: isDark ? 'rgba(236, 72, 153, 0.15)' : 'rgba(236, 72, 153, 0.1)' }]} />

      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={isDark ? '#F1F5F9' : '#111827'} />
        </TouchableOpacity>
        <ThemedText type="title">Add Contact</ThemedText>
        <View style={styles.spacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <BlurView intensity={isDark ? 30 : 70} tint={colorScheme} style={styles.avatarCard}>
          <TouchableOpacity style={[styles.avatarPlaceholder, { backgroundColor: '#EC4899' }]}>
            <IconSymbol name="camera.fill" size={32} color="#fff" />
          </TouchableOpacity>
          <ThemedText style={styles.avatarText}>Add Photo</ThemedText>
        </BlurView>

        <View style={styles.form}>
          <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.inputCard}>
            <IconSymbol name="person.fill" size={20} color={isDark ? '#94A3B8' : '#6B7280'} />
            <TextInput
              style={styles.input}
              placeholder="First Name"
              placeholderTextColor={isDark ? '#94A3B8' : '#6B7280'}
              value={firstName}
              onChangeText={setFirstName}
            />
          </BlurView>

          <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.inputCard}>
            <IconSymbol name="person.fill" size={20} color={isDark ? '#94A3B8' : '#6B7280'} />
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              placeholderTextColor={isDark ? '#94A3B8' : '#6B7280'}
              value={lastName}
              onChangeText={setLastName}
            />
          </BlurView>

          <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.inputCard}>
            <IconSymbol name="phone.fill" size={20} color={isDark ? '#94A3B8' : '#6B7280'} />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor={isDark ? '#94A3B8' : '#6B7280'}
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
          </BlurView>

          <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.inputCard}>
            <IconSymbol name="envelope.fill" size={20} color={isDark ? '#94A3B8' : '#6B7280'} />
            <TextInput
              style={styles.input}
              placeholder="Email (optional)"
              placeholderTextColor={isDark ? '#94A3B8' : '#6B7280'}
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </BlurView>

          <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.inputCard}>
            <IconSymbol name="mappin.circle.fill" size={20} color={isDark ? '#94A3B8' : '#6B7280'} />
            <TextInput
              style={styles.input}
              placeholder="Location (e.g., Nairobi, Kenya)"
              placeholderTextColor={isDark ? '#94A3B8' : '#6B7280'}
              value={location}
              onChangeText={setLocation}
            />
          </BlurView>

          <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.favoriteCard}>
            <View style={styles.favoriteLabel}>
              <IconSymbol name="star.fill" size={20} color="#F59E0B" />
              <ThemedText type="defaultSemiBold">Add to Favorites</ThemedText>
            </View>
            <TouchableOpacity
              style={[styles.toggle, isFavorite && styles.toggleActive]}
              onPress={() => setIsFavorite(!isFavorite)}
            >
              <View style={[styles.toggleThumb, isFavorite && styles.toggleThumbActive]} />
            </TouchableOpacity>
          </BlurView>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <ThemedText style={styles.cancelText}>Cancel</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <ThemedText style={styles.saveText}>Save Contact</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  decorativeBlur: { position: 'absolute', width: 280, height: 280, borderRadius: 200, top: -120, right: -100, opacity: 0.6 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 24 },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.05)', justifyContent: 'center', alignItems: 'center' },
  spacer: { width: 44 },
  avatarCard: { marginHorizontal: 20, borderRadius: 24, padding: 24, alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 14, opacity: 0.6 },
  form: { gap: 16, paddingHorizontal: 20, marginBottom: 24 },
  inputCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  input: { flex: 1, fontSize: 16 },
  favoriteCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  favoriteLabel: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggle: { width: 50, height: 30, borderRadius: 15, backgroundColor: 'rgba(0,0,0,0.1)', padding: 2, justifyContent: 'center' },
  toggleActive: { backgroundColor: '#10B981' },
  toggleThumb: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#fff' },
  toggleThumbActive: { alignSelf: 'flex-end' },
  actions: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 40 },
  cancelButton: { flex: 1, padding: 18, borderRadius: 16, borderWidth: 2, borderColor: 'rgba(0,0,0,0.1)', alignItems: 'center' },
  cancelText: { fontSize: 16, fontWeight: '600' },
  saveButton: { flex: 1, padding: 18, borderRadius: 16, backgroundColor: '#10B981', alignItems: 'center', shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
