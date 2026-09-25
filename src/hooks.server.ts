import { redirect, type Handle } from '@sveltejs/kit'
import PocketBase from 'pocketbase'
import { POCKETBASE_DEFAULT_URL } from '$lib/pocketbase'

export const handle: Handle = async ({ event, resolve }) => {
  const pbUrl = process.env.POCKETBASE_URL || POCKETBASE_DEFAULT_URL
  event.locals.pb = new PocketBase(pbUrl)

  // Load auth state from cookie
  event.locals.pb.authStore.loadFromCookie(
    event.request.headers.get('cookie') || '',
  )

  try {
    if (event.locals.pb.authStore.isValid) {
      await event.locals.pb.collection('users').authRefresh()
      event.locals.user = event.locals.pb.authStore.record
    } else {
      event.locals.user = null
    }
  } catch {
    event.locals.pb.authStore.clear()
    event.locals.user = null
  }

  const isLoginPage = event.url.pathname.startsWith('/login')

  // Protect all non-login routes
  if (!event.locals.user && !isLoginPage) {
    throw redirect(303, '/login')
  }

  // Redirect to home if logged in user visits /login
  if (event.locals.user && isLoginPage) {
    throw redirect(303, '/')
  }

  const response = await resolve(event)

  // Send back updated auth cookie
  response.headers.append(
    'set-cookie',
    event.locals.pb.authStore.exportToCookie({
      httpOnly: false,
      sameSite: 'lax',
      secure: false,
    }),
  )

  return response
}
