import { Stack } from 'expo-router';

export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        presentation: 'modal',
        headerShown: true,
      }}>
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
        options={{
          title: 'Contact Details',
        }}
      />
      <Stack.Screen
        name="add-contact"
        options={{
          title: 'Add Contact',
        }}
      />
      <Stack.Screen
        name="edit-contact"
        options={{
          title: 'Edit Contact',
        }}
      />
      <Stack.Screen
        name="call-detail"
        options={{
          title: 'Call Details',
        }}
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