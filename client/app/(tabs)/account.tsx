import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function AccountScreen() {
  const iconColor = useThemeColor({}, 'icon');

  const menuItems = [
    { icon: 'person.circle.fill' as const, label: 'Edit Profile', chevron: true },
    { icon: 'creditcard' as const, label: 'Payment Methods', chevron: true },
    { icon: 'clock.fill' as const, label: 'Call History', chevron: true },
    { icon: 'gearshape.fill' as const, label: 'Settings', chevron: true },
    { icon: 'questionmark.circle.fill' as const, label: 'Help & Support', chevron: true },
    { icon: 'arrow.right.square.fill' as const, label: 'Sign Out', chevron: false },
  ];

  return (
    <ScreenContainer>
      <View style={styles.profileSection}>
        <View style={styles.profileAvatar}>
          <ThemedText style={styles.profileInitial}>JD</ThemedText>
        </View>
        <ThemedText type="title" style={styles.profileName}>John Doe</ThemedText>
        <ThemedText style={styles.profilePhone}>+1 (555) 123-4567</ThemedText>
        <View style={styles.balanceCard}>
          <ThemedText style={styles.balanceLabel}>Account Balance</ThemedText>
          <ThemedText type="title" style={styles.balanceAmount}>$25.50</ThemedText>
          <TouchableOpacity style={styles.topUpButton}>
            <ThemedText style={styles.topUpText}>Top Up</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.menuSection}>
        {menuItems.map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuItem}>
            <IconSymbol name={item.icon} size={24} color={iconColor} />
            <ThemedText style={styles.menuLabel}>{item.label}</ThemedText>
            {item.chevron && (
              <IconSymbol name="chevron.right" size={20} color={iconColor} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  profileSection: { alignItems: 'center', marginBottom: 30 },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileInitial: { color: '#fff', fontSize: 32, fontWeight: '600' },
  profileName: { marginBottom: 4 },
  profilePhone: { fontSize: 16, opacity: 0.6, marginBottom: 20 },
  balanceCard: {
    backgroundColor: '#F0F0F0',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  balanceLabel: { fontSize: 14, opacity: 0.6, marginBottom: 8 },
  balanceAmount: { marginBottom: 12 },
  topUpButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
  },
  topUpText: { color: '#fff', fontWeight: '600' },
  menuSection: { gap: 4 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  menuLabel: { flex: 1, fontSize: 16 },
});
