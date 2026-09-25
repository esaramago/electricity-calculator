import { fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.user) {
    throw redirect(303, '/')
  }
  return {}
}

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const data = await request.formData()
    const email = data.get('email')?.toString() || ''
    const password = data.get('password')?.toString() || ''

    if (!email || !password) {
      return fail(400, {
        email,
        error: 'Por favor preencha o email e a palavra-passe.',
      })
    }

    try {
      await locals.pb.collection('users').authWithPassword(email, password)
    } catch {
      return fail(400, {
        email,
        error: 'Email ou palavra-passe incorretos.',
      })
    }

    throw redirect(303, '/')
  },
}
