import { Stack } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ModalsLayout() {
  const headerWithBack = (navigation: any, title: string) => ({
    title,
    headerShown: true,
    headerTintColor: '#10B981',
    headerTitleStyle: { fontWeight: '700' as '700', fontSize: 18 },
    headerStyle: { backgroundColor: 'transparent', elevation: 0, shadowOpacity: 0 },
    headerLeft: () => (
      <TouchableOpacity
        onPress={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.replace('/(tabs)');
          }
        }}
        style={{ marginLeft: 16 }}
      >
        <IconSymbol name="chevron.left" size={24} color="#10B981" />
      </TouchableOpacity>
    ),
  });


  return (
    <Stack
      screenOptions={{
        presentation: 'modal',
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="active-call"
        options={{
          presentation: 'fullScreenModal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="incoming-call"
        options={{
          presentation: 'fullScreenModal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="contact-detail"
        options={({ navigation }) => headerWithBack(navigation, 'Contact Details')}
      />
      <Stack.Screen
        name="add-contact"
        options={({ navigation }) => headerWithBack(navigation, 'Add Contact')}
      />
      <Stack.Screen
        name="edit-contact"
        options={({ navigation }) => headerWithBack(navigation, 'Edit Contact')}
      />
      <Stack.Screen
        name="call-detail"
        options={({ navigation }) => headerWithBack(navigation, 'Call Details')}
      />
      <Stack.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
