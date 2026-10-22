import { Redirect } from 'expo-router'
import { useAuth } from '../src/auth/AuthProvider'
import { ArchitectureProbe } from '../src/diagnostics/ArchitectureProbe'
export default function BootstrapRoute() {
  const { state } = useAuth()
  if (state.status === 'checking') return <ArchitectureProbe />
  return <Redirect href={state.status === 'authenticated' ? '/(authenticated)/probe' : '/(public)/probe'} />
}
