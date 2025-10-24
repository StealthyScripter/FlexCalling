import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';

interface PhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onDelete: () => void;
  country?: { name: string; code: string };
}

const DEFAULT_COUNTRY = { name: 'Kenya', code: '+254' };

export function PhoneInput({
  value,
  onChangeText,
  onDelete,
  country = DEFAULT_COUNTRY,
}: PhoneInputProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const textColor = String(useThemeColor({}, 'text'));

  return (
    <BlurView
      intensity={isDark ? 20 : 60}
      tint={colorScheme}
      style={styles.phoneNumberCard}
    >
      {/* Country Badge */}
      <View style={styles.locationBadge}>
        <IconSymbol name="globe" size={14} color="#10B981" />
        <ThemedText style={styles.locationText}>
          {country.name} ({country.code})
        </ThemedText>
      </View>

      {/* Phone Number Display + Delete */}
      <View style={styles.phoneInputContainer}>
        <View style={styles.phoneInputWrapper}>
          <ThemedText
            style={[
              styles.phoneNumberText,
              { color: value ? textColor : isDark ? '#64748B' : '#9CA3AF' },
            ]}
          >
            {value || 'Enter number'}
          </ThemedText>
        </View>

        {value.length > 0 && (
          <TouchableOpacity
            style={styles.deleteButtonInline}
            onPress={onDelete}
          >
            <IconSymbol
              name="delete.left.fill"
              size={24}
              color={isDark ? '#F1F5F9' : '#111827'}
            />
          </TouchableOpacity>
        )}
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  phoneNumberCard: {
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(248, 81, 15, 0.05)',
    overflow: 'hidden',
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(14, 133, 83, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 6,
  },
  locationText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  phoneInputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 50,
  },
  phoneInputWrapper: {
    margin: 0,
    padding: 0,
    minHeight: 50,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneNumberText: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  deleteButtonInline: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
