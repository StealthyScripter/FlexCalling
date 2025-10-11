import { StyleSheet, TouchableOpacity, View, TextInput, Alert, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BlurView } from 'expo-blur';

export default function EditContactScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  // Get contact data from params
  const contactId = params.contactId as string;
  const [name, setName] = useState((params.name as string) || '');
  const [phone, setPhone] = useState((params.phone as string) || '');
  const [email, setEmail] = useState((params.email as string) || '');
  const [company, setCompany] = useState((params.company as string) || '');
  const [notes, setNotes] = useState((params.notes as string) || '');
  const [isFavorite, setIsFavorite] = useState(params.favorite === 'true');

  const avatarColors = ['#EC4899', '#3B82F6', '#F59E0B', '#8B5CF6', '#10B981', '#EF4444'];
  const [selectedColor, setSelectedColor] = useState((params.avatarColor as string) || avatarColors[0]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    if (!phone.trim()) {
      Alert.alert('Error', 'Please enter a phone number');
      return;
    }

    try {
      // TODO: Update in database
      // await db.contacts.update(contactId, {
      //   name: name.trim(),
      //   phone: phone.trim(),
      //   email: email.trim(),
      //   company: company.trim(),
      //   notes: notes.trim(),
      //   favorite: isFavorite,
      //   avatarColor: selectedColor,
      // });

      Alert.alert(
        'Success',
        'Contact updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );

      console.log('📇 Contact updated:', {
        id: contactId,
        name: name.trim(),
        phone: phone.trim(),
        favorite: isFavorite,
      });
    } catch (error) {
      console.error('❌ Failed to update contact:', error);
      Alert.alert('Error', 'Failed to update contact');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Contact',
      `Delete ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // TODO: Delete from database
            // await db.contacts.delete(contactId);
            Alert.alert('Deleted', 'Contact deleted successfully', [
              { text: 'OK', onPress: () => router.back() },
            ]);
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
          <IconSymbol name="xmark" size={24} color={isDark ? '#F1F5F9' : '#111827'} />
        </TouchableOpacity>
        <ThemedText type="title">Edit Contact</ThemedText>
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
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="+254712345678"
            placeholderTextColor={isDark ? '#94A3B8' : '#6B7280'}
            keyboardType="phone-pad"
            style={[styles.input, { color: isDark ? '#F1F5F9' : '#111827' }]}
          />
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
                <ThemedText type="defaultSemiBold">Favorite Contact</ThemedText>
                <ThemedText style={styles.favoriteSubtext}>Quick access to this contact</ThemedText>
              </View>
            </View>
            <View style={[styles.toggle, isFavorite && styles.toggleActive]}>
              <View style={[styles.toggleThumb, isFavorite && styles.toggleThumbActive]} />
            </View>
          </BlurView>
        </TouchableOpacity>

        {/* Delete Button */}
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <IconSymbol name="trash.fill" size={20} color="#EF4444" />
          <ThemedText style={styles.deleteButtonText}>Delete Contact</ThemedText>
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
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  favoriteCard: { borderRadius: 20, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  favoriteContent: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  favoriteIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(245, 158, 11, 0.1)', justifyContent: 'center', alignItems: 'center' },
  favoriteText: { flex: 1 },
  favoriteSubtext: { fontSize: 12, opacity: 0.6, marginTop: 2 },
  toggle: { width: 56, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.1)', padding: 2 },
  toggleActive: { backgroundColor: '#10B981' },
  toggleThumb: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  toggleThumbActive: { transform: [{ translateX: 24 }] },
  deleteButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingVertical: 16, borderRadius: 16, marginTop: 8 },
  deleteButtonText: { color: '#EF4444', fontSize: 16, fontWeight: '600' },
});
