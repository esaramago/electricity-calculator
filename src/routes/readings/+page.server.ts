import { fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import type { Reading } from '$lib/types'

export const load: PageServerLoad = async ({ locals }) => {
  const records = await locals.pb.collection('readings').getFullList({
    sort: '-date',
  })

  const readings: Reading[] = records.map((r) => ({
    id: r.id,
    date: r.date,
    vazio: Number(r.vazio),
    ponta: Number(r.ponta),
    cheia: Number(r.cheia),
    total: Number(
      r.total || Number(r.vazio) + Number(r.ponta) + Number(r.cheia),
    ),
    notes: r.notes || '',
  }))

  return { readings }
}

export const actions: Actions = {
  create: async ({ request, locals }) => {
    const data = await request.formData()
    const dateStr = data.get('date')?.toString()
    const vazio = Number(data.get('vazio') || 0)
    const ponta = Number(data.get('ponta') || 0)
    const cheia = Number(data.get('cheia') || 0)
    const notes = data.get('notes')?.toString() || ''

    if (!dateStr) {
      return fail(400, { error: 'A data é obrigatória.' })
    }

    const total = vazio + ponta + cheia
    const isoDate = new Date(dateStr).toISOString()

    try {
      await locals.pb.collection('readings').create({
        date: isoDate,
        vazio,
        ponta,
        cheia,
        total,
        notes,
      })
      return { success: true }
    } catch (err: any) {
      return fail(400, { error: err?.message || 'Erro ao guardar leitura.' })
    }
  },

  delete: async ({ request, locals }) => {
    const data = await request.formData()
    const id = data.get('id')?.toString()
    if (!id) return fail(400, { error: 'ID não fornecido.' })

    try {
      await locals.pb.collection('readings').delete(id)
      return { success: true }
    } catch (err: any) {
      return fail(400, { error: err?.message || 'Erro ao eliminar leitura.' })
    }
  },
}
