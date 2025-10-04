// components/phone-input.tsx
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';

interface PhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onDelete: () => void;
}

export function PhoneInput({ value, onChangeText, onDelete }: PhoneInputProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const textColor = String(useThemeColor({}, 'text'));

  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, { color: textColor }]}
        value={value}
        onChangeText={onChangeText}
        placeholder="Enter number"
        placeholderTextColor={isDark ? '#64748B' : '#9CA3AF'}
        keyboardType="phone-pad"
        showSoftInputOnFocus={false}
        cursorColor={isDark ? '#F1F5F9' : '#111827'}
      />
      {value.length > 0 && (
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <IconSymbol name="delete.left.fill" size={24} color={isDark ? '#F1F5F9' : '#111827'} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  input: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    minWidth: 200,
    letterSpacing: 1,
  },
  deleteButton: {
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
