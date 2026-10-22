import { useState } from 'react'
import { Pressable, Text, TextInput } from 'react-native'
import { useAuth } from '../auth/AuthProvider'
import { AdaptiveShell } from '../layout/AdaptiveShell'
import { shellStyles as styles } from '../layout/shell-styles'
import { domainProbe } from './domain-probe'
import { createNativeApiClient } from '../api/native-client'

export function ArchitectureProbe({ privateProbe = false }: { privateProbe?: boolean }) {
  const { state, logout } = useAuth()
  const [focused, setFocused] = useState(false)
  return (
    <AdaptiveShell title="Talentry architecture probe" secondary={<>
      <Text style={styles.text}>Phone and tablet layout diagnostic. These thresholds are provisional.</Text>
      <TextInput accessibilityLabel="Keyboard layout probe; do not enter private information" placeholder="Keyboard layout probe"
        style={[styles.control, styles.text, focused && styles.focused]} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
    </>}>
      <Text accessibilityLiveRegion="polite" style={styles.text}>Authentication: {state.status}</Text>
      <Text style={styles.text}>Shared domain import probe: {domainProbe() ? 'passed' : 'failed'}</Text>
      <Text style={styles.text}>API contract: {typeof createNativeApiClient === 'function' ? 'available; no requests sent' : 'unavailable'}</Text>
      <Text style={styles.text}>{privateProbe ? 'Authenticated diagnostic boundary.' : 'Public diagnostic boundary. Full authentication UX is deferred.'}</Text>
      {state.status === 'configuration-error' && <Text style={styles.text}>Public configuration is absent or invalid. No backend fallback is used.</Text>}
      {state.status === 'auth-error' && <Text style={styles.text}>Identity or secure storage could not be verified. Private navigation is closed.</Text>}
      {privateProbe && <Pressable accessibilityRole="button" accessibilityLabel="Log out" onPress={() => { void logout() }}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={[styles.control, focused && styles.focused]}>
        <Text style={styles.text}>Log out</Text>
      </Pressable>}
    </AdaptiveShell>
  )
}
