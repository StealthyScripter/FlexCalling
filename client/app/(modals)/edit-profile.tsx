import { StyleSheet, TouchableOpacity, View, TextInput, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BlurView } from 'expo-blur';

export default function EditProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  // TODO: Get from auth context
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john.doe@example.com');
  const [phone, setPhone] = useState('+254712345678');
  const [country, setCountry] = useState('Kenya');

  const avatarColors = ['#EC4899', '#3B82F6', '#F59E0B', '#8B5CF6', '#10B981', '#EF4444'];
  const [selectedColor, setSelectedColor] = useState(avatarColors[3]); // Purple

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    try {
      // TODO: Update user profile in database
      // await db.users.update(userId, {
      //   name: name.trim(),
      //   email: email.trim(),
      //   phone: phone.trim(),
      //   country: country.trim(),
      //   avatarColor: selectedColor,
      // });

      Alert.alert(
        'Success',
        'Profile updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );

      console.log('👤 Profile updated:', {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        avatarColor: selectedColor,
      });
    } catch (error) {
      console.error('❌ Failed to update profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleChangePassword = () => {
    Alert.alert('Coming Soon', 'Password change will be available soon');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Delete account
            Alert.alert('Account Deleted', 'Your account has been deleted');
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.decorativeBlur, { backgroundColor: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)' }]} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="xmark" size={24} color={isDark ? '#F1F5F9' : '#111827'} />
        </TouchableOpacity>
        <ThemedText type="title">Edit Profile</ThemedText>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <ThemedText style={styles.saveButtonText}>Save</ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Avatar Section */}
        <BlurView intensity={isDark ? 30 : 70} tint={colorScheme} style={styles.avatarSection}>
          <View style={[styles.avatarPreview, { backgroundColor: selectedColor }]}>
            <ThemedText style={styles.avatarPreviewText}>
              {name.trim() ? name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'JD'}
            </ThemedText>
          </View>

          <ThemedText style={styles.sectionLabel}>Avatar Color</ThemedText>
          <View style={styles.colorPicker}>
            {avatarColors.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  selectedColor === color && styles.colorOptionSelected,
                ]}
                onPress={() => setSelectedColor(color)}
              >
                {selectedColor === color && (
                  <IconSymbol name="checkmark" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </BlurView>

        {/* Personal Information */}
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>PERSONAL INFORMATION</ThemedText>

          <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.inputCard}>
            <ThemedText style={styles.inputLabel}>Full Name</ThemedText>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="John Doe"
              placeholderTextColor={isDark ? '#94A3B8' : '#6B7280'}
              style={[styles.input, { color: isDark ? '#F1F5F9' : '#111827' }]}
            />
          </BlurView>

          <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.inputCard}>
            <ThemedText style={styles.inputLabel}>Email</ThemedText>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="john@example.com"
              placeholderTextColor={isDark ? '#94A3B8' : '#6B7280'}
              keyboardType="email-address"
              autoCapitalize="none"
              style={[styles.input, { color: isDark ? '#F1F5F9' : '#111827' }]}
            />
          </BlurView>

          <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.inputCard}>
            <ThemedText style={styles.inputLabel}>Phone Number</ThemedText>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="+254712345678"
              placeholderTextColor={isDark ? '#94A3B8' : '#6B7280'}
              keyboardType="phone-pad"
              style={[styles.input, { color: isDark ? '#F1F5F9' : '#111827' }]}
            />
          </BlurView>

          <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.inputCard}>
            <ThemedText style={styles.inputLabel}>Country</ThemedText>
            <TextInput
              value={country}
              onChangeText={setCountry}
              placeholder="Kenya"
              placeholderTextColor={isDark ? '#94A3B8' : '#6B7280'}
              style={[styles.input, { color: isDark ? '#F1F5F9' : '#111827' }]}
            />
          </BlurView>
        </View>

        {/* Security */}
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>SECURITY</ThemedText>

          <TouchableOpacity onPress={handleChangePassword}>
            <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.menuCard}>
              <View style={styles.menuContent}>
                <View style={[styles.menuIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                  <IconSymbol name="key.fill" size={24} color="#3B82F6" />
                </View>
                <View style={styles.menuText}>
                  <ThemedText type="defaultSemiBold">Change Password</ThemedText>
                  <ThemedText style={styles.menuSubtext}>Update your password</ThemedText>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={20} color={isDark ? '#94A3B8' : '#6B7280'} />
            </BlurView>
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>DANGER ZONE</ThemedText>

          <TouchableOpacity onPress={handleDeleteAccount}>
            <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.dangerCard}>
              <View style={styles.menuContent}>
                <View style={[styles.menuIcon, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                  <IconSymbol name="trash.fill" size={24} color="#EF4444" />
                </View>
                <View style={styles.menuText}>
                  <ThemedText type="defaultSemiBold" style={{ color: '#EF4444' }}>Delete Account</ThemedText>
                  <ThemedText style={styles.menuSubtext}>Permanently delete your account</ThemedText>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={20} color="#EF4444" />
            </BlurView>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  decorativeBlur: { position: 'absolute', width: 250, height: 250, borderRadius: 200, top: -80, right: -60, opacity: 0.6 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 24 },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.05)', justifyContent: 'center', alignItems: 'center' },
  saveButton: { backgroundColor: '#10B981', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 16 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  scrollContent: { paddingHorizontal: 20 },
  avatarSection: { borderRadius: 24, padding: 24, marginBottom: 24, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  avatarPreview: { width: 80, height: 80, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarPreviewText: { color: '#fff', fontSize: 32, fontWeight: '600' },
  sectionLabel: { fontSize: 14, opacity: 0.6, marginBottom: 12 },
  colorPicker: { flexDirection: 'row', gap: 12 },
  colorOption: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  colorOptionSelected: { borderWidth: 3, borderColor: '#fff' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 12, letterSpacing: 1, opacity: 0.5, marginBottom: 12 },
  inputCard: { borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  inputLabel: { fontSize: 14, opacity: 0.6, marginBottom: 8 },
  input: { fontSize: 16, paddingVertical: 8 },
  menuCard: { borderRadius: 20, padding: 16, marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  dangerCard: { borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)', overflow: 'hidden' },
  menuContent: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  menuIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  menuText: { flex: 1 },
  menuSubtext: { fontSize: 12, opacity: 0.6, marginTop: 2 },
});
