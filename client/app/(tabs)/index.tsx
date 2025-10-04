import { ThemedText } from '@/components/themed-text';
import { ScreenContainer } from '@/components/screen-container';

export default function RecentsScreen() {
  return (
    <ScreenContainer>
        <ThemedText type="title">Recents</ThemedText>
        <ThemedText>Your recent calls will appear here!</ThemedText>
    </ScreenContainer>

  );
}

