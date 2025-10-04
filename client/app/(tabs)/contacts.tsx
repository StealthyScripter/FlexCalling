import { StyleSheet, FlatList, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function ContactsScreen() {
  const iconColor = useThemeColor({}, 'icon');

  const contacts = [
    { id: '1', name: 'Alice Johnson', phone: '+254 712 345 678', favorite: true },
    { id: '2', name: 'Bob Williams', phone: '+254 723 456 789', favorite: false },
    { id: '3', name: 'Carol Davis', phone: '+254 734 567 890', favorite: true },
  ];

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <ThemedText type="title">Contacts</ThemedText>
        <TouchableOpacity>
          <IconSymbol name="plus.circle.fill" size={28} color={iconColor} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.contactItem}>
            <View style={styles.avatar}>
              <ThemedText style={styles.avatarText}>{item.name[0]}</ThemedText>
            </View>
            <View style={styles.contactInfo}>
              <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
              <ThemedText style={styles.phone}>{item.phone}</ThemedText>
            </View>
            {item.favorite && (
              <IconSymbol name="star.fill" size={20} color="#FFD700" />
            )}
          </TouchableOpacity>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 16,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  contactInfo: { flex: 1 },
  phone: { fontSize: 14, opacity: 0.6, marginTop: 4 },
});
