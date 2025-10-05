import { StyleSheet, TextInput, TouchableOpacity, View, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BlurView } from 'expo-blur';
import { useState } from 'react';

export default function EditContactScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  // TODO: Get actual contact data from route params
  const [firstName, setFirstName] = useState('John');
  const [lastName, setLastName] = useState('Doe');
  const [phoneNumber, setPhoneNumber] = useState('+254712345678');
  const [email, setEmail] = useState('john.doe@email.com');
  const [location, setLocation] = useState('Nairobi, Kenya');
  const [isFavorite, setIsFavorite] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);

  const handleSave = () => {
    // TODO: Implement save logic
    Alert.alert('Success', 'Contact updated successfully');
    router.back();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to delete this contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement delete logic
            router.back();
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.decorativeBlur, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)' }]} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={isDark ? '#F1F5F9' : '#111827'} />
        </TouchableOpacity>
        <ThemedText type="title">Edit Contact</ThemedText>
        <View style={styles.spacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <BlurView intensity={isDark ? 30 : 70} tint={colorScheme} style={styles.avatarCard}>
          <TouchableOpacity style={[styles.avatarPlaceholder, { backgroundColor: '#3B82F6' }]}>
            <ThemedText style={styles.avatarInitial}>JD</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.changePhotoButton}>
            <IconSymbol name="camera.fill" size={16} color="#10B981" />
            <ThemedText style={styles.changePhotoText}>Change Photo</ThemedText>
          </TouchableOpacity>
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
              placeholder="Email"
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
              placeholder="Location"
              placeholderTextColor={isDark ? '#94A3B8' : '#6B7280'}
              value={location}
              onChangeText={setLocation}
            />
          </BlurView>

          <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.toggleCard}>
            <View style={styles.toggleLabel}>
              <IconSymbol name="star.fill" size={20} color="#F59E0B" />
              <ThemedText type="defaultSemiBold">Favorite Contact</ThemedText>
            </View>
            <TouchableOpacity
              style={[styles.toggle, isFavorite && styles.toggleActive]}
              onPress={() => setIsFavorite(!isFavorite)}
            >
              <View style={[styles.toggleThumb, isFavorite && styles.toggleThumbActive]} />
            </TouchableOpacity>
          </BlurView>

          <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.toggleCard}>
            <View style={styles.toggleLabel}>
              <IconSymbol name="hand.raised.fill" size={20} color="#EF4444" />
              <ThemedText type="defaultSemiBold">Block Contact</ThemedText>
            </View>
            <TouchableOpacity
              style={[styles.toggle, isBlocked && styles.toggleActiveBlock]}
              onPress={() => setIsBlocked(!isBlocked)}
            >
              <View style={[styles.toggleThumb, isBlocked && styles.toggleThumbActive]} />
            </TouchableOpacity>
          </BlurView>
        </View>

        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>QUICK ACTIONS</ThemedText>

        <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.actionsCard}>
          <TouchableOpacity style={[styles.actionItem, styles.actionBorder]}>
            <IconSymbol name="message.fill" size={20} color="#3B82F6" />
            <ThemedText style={styles.actionText}>Send Message</ThemedText>
            <IconSymbol name="chevron.right" size={20} color={isDark ? '#94A3B8' : '#6B7280'} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionItem, styles.actionBorder]}>
            <IconSymbol name="clock.fill" size={20} color="#10B981" />
            <ThemedText style={styles.actionText}>View Call History</ThemedText>
            <IconSymbol name="chevron.right" size={20} color={isDark ? '#94A3B8' : '#6B7280'} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <IconSymbol name="square.and.arrow.up.fill" size={20} color="#8B5CF6" />
            <ThemedText style={styles.actionText}>Share Contact</ThemedText>
            <IconSymbol name="chevron.right" size={20} color={isDark ? '#94A3B8' : '#6B7280'} />
          </TouchableOpacity>
        </BlurView>

        <View style={styles.buttons}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <ThemedText style={styles.saveText}>Save Changes</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <IconSymbol name="trash.fill" size={20} color="#EF4444" />
            <ThemedText style={styles.deleteText}>Delete Contact</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  decorativeBlur: { position: 'absolute', width: 280, height: 280, borderRadius: 200, top: -100, right: -80, opacity: 0.6 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 24 },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.05)', justifyContent: 'center', alignItems: 'center' },
  spacer: { width: 44 },
  avatarCard: { marginHorizontal: 20, borderRadius: 24, padding: 24, alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarInitial: { color: '#fff', fontSize: 40, fontWeight: '600' },
  changePhotoButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  changePhotoText: { color: '#10B981', fontSize: 14, fontWeight: '600' },
  form: { gap: 16, paddingHorizontal: 20, marginBottom: 24 },
  inputCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  input: { flex: 1, fontSize: 16 },
  toggleCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  toggleLabel: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggle: { width: 50, height: 30, borderRadius: 15, backgroundColor: 'rgba(0,0,0,0.1)', padding: 2, justifyContent: 'center' },
  toggleActive: { backgroundColor: '#10B981' },
  toggleActiveBlock: { backgroundColor: '#EF4444' },
  toggleThumb: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#fff' },
  toggleThumbActive: { alignSelf: 'flex-end' },
  sectionTitle: { fontSize: 12, letterSpacing: 1, opacity: 0.5, marginBottom: 12, marginTop: 8, paddingHorizontal: 20 },
  actionsCard: { marginHorizontal: 20, borderRadius: 24, padding: 8, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  actionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 12, gap: 12 },
  actionBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  actionText: { flex: 1, fontSize: 16 },
  buttons: { gap: 12, paddingHorizontal: 20 },
  saveButton: { backgroundColor: '#10B981', padding: 18, borderRadius: 16, alignItems: 'center', shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  deleteButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 18, borderRadius: 16, backgroundColor: 'rgba(239, 68, 68, 0.1)' },
  deleteText: { color: '#EF4444', fontSize: 16, fontWeight: '600' },
});