import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function KeypadScreen() {
  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '#'],
  ];

  return (
    <ScreenContainer>
      <View style={styles.phoneNumberContainer}>
        <ThemedText type="title" style={styles.phoneNumber}>+1 234 567 8900</ThemedText>
        <ThemedText style={styles.location}>Kenya (+254)</ThemedText>
      </View>

      <View style={styles.keypadContainer}>
        {keys.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keyRow}>
            {row.map((key) => (
              <TouchableOpacity key={key} style={styles.key}>
                <ThemedText type="title" style={styles.keyText}>{key}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.callButton}>
          <IconSymbol name="phone.fill" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  phoneNumberContainer: { alignItems: 'center', marginTop: 20, marginBottom: 40 },
  phoneNumber: { fontSize: 28 },
  location: { fontSize: 16, opacity: 0.6, marginTop: 8 },
  keypadContainer: { flex: 1, justifyContent: 'center', gap: 20 },
  keyRow: { flexDirection: 'row', justifyContent: 'space-around' },
  key: {
    width: 75,
    height: 75,
    borderRadius: 40,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyText: { fontSize: 28 },
  actionButtons: { alignItems: 'center', marginBottom: 40 },
  callButton: {
    width: 65,
    height: 65,
    borderRadius: 33,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
