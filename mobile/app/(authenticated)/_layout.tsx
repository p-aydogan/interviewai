import { Redirect, Stack } from 'expo-router'
import { useAuth } from '../../src/auth/AuthProvider'
export default function PrivateLayout() {
  const { state } = useAuth()
  if (state.status !== 'authenticated') return <Redirect href="/" />
  return <Stack key={`${state.userId}:${state.generation}`} screenOptions={{ headerShown: false }} />
}
