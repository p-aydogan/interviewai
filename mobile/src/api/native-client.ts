import { fetch } from 'expo/fetch'
import { createApiClient } from './client'
/** Deliberately no live connectivity action in this bootstrap. */
export const createNativeApiClient = (baseUrl: string) => createApiClient(baseUrl, (url, init) => fetch(url, init))
