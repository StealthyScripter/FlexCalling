import { StyleSheet, TouchableOpacity, View, TextInput, Alert, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BlurView } from 'expo-blur';

export default function AddContactScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState((params.phoneNumber as string) || '');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [notes, setNotes] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  const avatarColors = ['#EC4899', '#3B82F6', '#F59E0B', '#8B5CF6', '#10B981', '#EF4444'];
  const [selectedColor, setSelectedColor] = useState(avatarColors[0]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    if (!phone.trim()) {
      Alert.alert('Error', 'Please enter a phone number');
      return;
    }

    // Format phone number
    let formattedPhone = phone.trim();
    if (!formattedPhone.startsWith('+')) {
      if (formattedPhone.startsWith('0')) {
        formattedPhone = formattedPhone.substring(1);
      }
      formattedPhone = '+254' + formattedPhone;
    }

    // Validate phone format
    const phoneRegex = /^\+\d{10,15}$/;
    if (!phoneRegex.test(formattedPhone)) {
      Alert.alert('Invalid Number', 'Please enter a valid phone number');
      return;
    }

    try {
      // TODO: Save to database
      // const newContact = {
      //   name: name.trim(),
      //   phone: formattedPhone,
      //   email: email.trim(),
      //   company: company.trim(),
      //   notes: notes.trim(),
      //   favorite: isFavorite,
      //   avatarColor: selectedColor,
      // };
      // await db.contacts.create(newContact);

      Alert.alert(
        'Success',
        `Contact "${name}" saved successfully!`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );

      console.log('📇 Contact saved:', {
        name: name.trim(),
        phone: formattedPhone,
        email: email.trim(),
        company: company.trim(),
        favorite: isFavorite,
        color: selectedColor,
      });
    } catch (error) {
      console.error('❌ Failed to save contact:', error);
      Alert.alert('Error', 'Failed to save contact');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.decorativeBlur, { backgroundColor: isDark ? 'rgba(236, 72, 153, 0.15)' : 'rgba(236, 72, 153, 0.1)' }]} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="xmark" size={24} color={isDark ? '#F1F5F9' : '#111827'} />
        </TouchableOpacity>
        <ThemedText type="title">Add Contact</ThemedText>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <ThemedText style={styles.saveButtonText}>Save</ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Avatar Preview */}
        <BlurView intensity={isDark ? 30 : 70} tint={colorScheme} style={styles.avatarSection}>
          <View style={[styles.avatarPreview, { backgroundColor: selectedColor }]}>
            <ThemedText style={styles.avatarPreviewText}>
              {name.trim() ? name.trim()[0].toUpperCase() : '?'}
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

        {/* Name Input */}
        <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.inputCard}>
          <ThemedText style={styles.inputLabel}>Name *</ThemedText>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="John Doe"
            placeholderTextColor={isDark ? '#94A3B8' : '#6B7280'}
            style={[styles.input, { color: isDark ? '#F1F5F9' : '#111827' }]}
          />
        </BlurView>

        {/* Phone Input */}
        <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.inputCard}>
          <ThemedText style={styles.inputLabel}>Phone Number *</ThemedText>
          <View style={styles.phoneInputContainer}>
            <View style={styles.countryCode}>
              <IconSymbol name="globe" size={16} color="#10B981" />
              <ThemedText style={styles.countryCodeText}>+254</ThemedText>
            </View>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="712345678"
              placeholderTextColor={isDark ? '#94A3B8' : '#6B7280'}
              keyboardType="phone-pad"
              style={[styles.input, styles.phoneInput, { color: isDark ? '#F1F5F9' : '#111827' }]}
            />
          </View>
        </BlurView>

        {/* Email Input */}
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

        {/* Company Input */}
        <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.inputCard}>
          <ThemedText style={styles.inputLabel}>Company</ThemedText>
          <TextInput
            value={company}
            onChangeText={setCompany}
            placeholder="Acme Inc."
            placeholderTextColor={isDark ? '#94A3B8' : '#6B7280'}
            style={[styles.input, { color: isDark ? '#F1F5F9' : '#111827' }]}
          />
        </BlurView>

        {/* Notes Input */}
        <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.inputCard}>
          <ThemedText style={styles.inputLabel}>Notes</ThemedText>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Add notes..."
            placeholderTextColor={isDark ? '#94A3B8' : '#6B7280'}
            multiline
            numberOfLines={4}
            style={[styles.input, styles.textArea, { color: isDark ? '#F1F5F9' : '#111827' }]}
          />
        </BlurView>

        {/* Favorite Toggle */}
        <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)}>
          <BlurView intensity={isDark ? 20 : 60} tint={colorScheme} style={styles.favoriteCard}>
            <View style={styles.favoriteContent}>
              <View style={styles.favoriteIcon}>
                <IconSymbol name="star.fill" size={24} color={isFavorite ? '#F59E0B' : '#94A3B8'} />
              </View>
              <View style={styles.favoriteText}>
                <ThemedText type="defaultSemiBold">Add to Favorites</ThemedText>
                <ThemedText style={styles.favoriteSubtext}>Quick access to this contact</ThemedText>
              </View>
            </View>
            <View style={[styles.toggle, isFavorite && styles.toggleActive]}>
              <View style={[styles.toggleThumb, isFavorite && styles.toggleThumbActive]} />
            </View>
          </BlurView>
        </TouchableOpacity>

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
  avatarSection: { borderRadius: 24, padding: 24, marginBottom: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  avatarPreview: { width: 80, height: 80, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarPreviewText: { color: '#fff', fontSize: 32, fontWeight: '600' },
  sectionLabel: { fontSize: 14, opacity: 0.6, marginBottom: 12 },
  colorPicker: { flexDirection: 'row', gap: 12 },
  colorOption: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  colorOptionSelected: { borderWidth: 3, borderColor: '#fff' },
  inputCard: { borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  inputLabel: { fontSize: 14, opacity: 0.6, marginBottom: 8 },
  input: { fontSize: 16, paddingVertical: 8 },
  phoneInputContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  countryCode: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  countryCodeText: { fontSize: 16, color: '#10B981', fontWeight: '600' },
  phoneInput: { flex: 1 },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  favoriteCard: { borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  favoriteContent: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  favoriteIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(245, 158, 11, 0.1)', justifyContent: 'center', alignItems: 'center' },
  favoriteText: { flex: 1 },
  favoriteSubtext: { fontSize: 12, opacity: 0.6, marginTop: 2 },
  toggle: { width: 56, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.1)', padding: 2 },
  toggleActive: { backgroundColor: '#10B981' },
  toggleThumb: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  toggleThumbActive: { transform: [{ translateX: 24 }] },
});
