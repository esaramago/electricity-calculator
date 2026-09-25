import PocketBase from 'pocketbase'

export const POCKETBASE_DEFAULT_URL = 'http://127.0.0.1:8090'

/**
 * Creates a new PocketBase instance.
 */
export function createPocketBaseClient(customUrl?: string): PocketBase {
  const url =
    customUrl ||
    (typeof window !== 'undefined'
      ? window.location.origin.replace(/:\d+$/, ':8090')
      : POCKETBASE_DEFAULT_URL)
  return new PocketBase(url)
}

// Client-side singleton
let clientPb: PocketBase | null = null

export function getPocketBaseClient(): PocketBase {
  if (typeof window === 'undefined') {
    return createPocketBaseClient()
  }
  if (!clientPb) {
    clientPb = createPocketBaseClient()
    // Load cookie on client
    clientPb.authStore.loadFromCookie(document.cookie)
    clientPb.authStore.onChange(() => {
      document.cookie = clientPb!.authStore.exportToCookie({
        httpOnly: false,
        sameSite: 'lax',
        secure: window.location.protocol === 'https:',
      })
    })
  }
  return clientPb
}
