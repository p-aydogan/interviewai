import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react'
import { readEnvironment } from '../config/environment'
import { createNativeAuth } from './client'
import { createBootstrap, type BootstrapState } from './bootstrap'

const Context = createContext<{ state: BootstrapState; logout: () => Promise<void> }>({
  state: { status: 'checking', generation: 0 }, logout: async () => {},
})
export function AuthProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<BootstrapState>({ status: 'checking', generation: 0 })
  const [logout, setLogout] = useState<() => Promise<void>>(() => async () => {})
  useEffect(() => {
    const config = readEnvironment()
    if (!config.ok) { setState({ status: 'configuration-error', generation: 0 }); return }
    try {
      const native = createNativeAuth(config.value)
      const bootstrap = createBootstrap(native.client.auth, native.clear, setState)
      native.start()
      setLogout(() => bootstrap.logout)
      return () => { bootstrap.dispose(); native.stop() }
    } catch { setState({ status: 'auth-error', generation: 0 }) }
  }, [])
  return <Context.Provider value={{ state, logout }}>{children}</Context.Provider>
}
export const useAuth = () => useContext(Context)
