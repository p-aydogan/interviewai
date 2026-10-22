import { Stack } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AuthProvider, useAuth } from '../src/auth/AuthProvider'

function Routes() {
  const { state } = useAuth()
  const authenticated = state.status === 'authenticated'
  return <Stack screenOptions={{ headerShown: false }}>
    <Stack.Screen name="index" />
    <Stack.Protected guard={!authenticated}><Stack.Screen name="(public)" /></Stack.Protected>
    <Stack.Protected guard={authenticated}><Stack.Screen name="(authenticated)" /></Stack.Protected>
  </Stack>
}
export default function RootLayout() {
  return <SafeAreaProvider><AuthProvider><Routes /></AuthProvider></SafeAreaProvider>
}
