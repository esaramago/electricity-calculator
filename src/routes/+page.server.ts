import { fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import type { Reading, Proposal } from '$lib/types'

export const load: PageServerLoad = async ({ locals }) => {
  const [readingsRes, proposalsRes] = await Promise.all([
    locals.pb.collection('readings').getFullList({
      sort: 'date',
    }),
    locals.pb.collection('proposals').getFullList({
      sort: '-date',
    }),
  ])

  const readings: Reading[] = readingsRes.map((r) => ({
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

  const proposals: Proposal[] = proposalsRes.map((p) => ({
    id: p.id,
    date: p.date,
    supplier: p.supplier,
    power_kva: Number(p.power_kva),
    power_tar: Number(p.power_tar),
    power_com: Number(p.power_com),
    energy_tar: Number(p.energy_tar),
    energy_com: Number(p.energy_com),
    is_indexed: Boolean(p.is_indexed),
    is_active: p.is_active !== undefined ? Boolean(p.is_active) : true,
    notes: p.notes || '',
  }))

  return { readings, proposals }
}

export const actions: Actions = {
  create: async ({ request, locals }) => {
    const data = await request.formData()
    const dateStr = data.get('date')?.toString()
    const supplier = data.get('supplier')?.toString()?.trim()
    const power_kva = Number(data.get('power_kva') || 3.45)
    const power_tar = Number(data.get('power_tar') || 0)
    const power_com = Number(data.get('power_com') || 0)
    const energy_tar = Number(data.get('energy_tar') || 0)
    const energy_com = Number(data.get('energy_com') || 0)
    const is_indexed =
      data.get('is_indexed') === 'on' || data.get('is_indexed') === 'true'
    const notes = data.get('notes')?.toString() || ''

    if (!dateStr || !supplier) {
      return fail(400, { error: 'Data e Comercializadora são obrigatórios.' })
    }

    try {
      await locals.pb.collection('proposals').create({
        date: new Date(dateStr).toISOString(),
        supplier,
        power_kva,
        power_tar,
        power_com,
        energy_tar,
        energy_com,
        is_indexed,
        is_active: true,
        notes,
      })
      return { success: true }
    } catch (err: any) {
      return fail(400, { error: err?.message || 'Erro ao guardar proposta.' })
    }
  },

  update: async ({ request, locals }) => {
    const data = await request.formData()
    const id = data.get('id')?.toString()
    const dateStr = data.get('date')?.toString()
    const supplier = data.get('supplier')?.toString()?.trim()
    const power_kva = Number(data.get('power_kva') || 3.45)
    const power_tar = Number(data.get('power_tar') || 0)
    const power_com = Number(data.get('power_com') || 0)
    const energy_tar = Number(data.get('energy_tar') || 0)
    const energy_com = Number(data.get('energy_com') || 0)
    const is_indexed =
      data.get('is_indexed') === 'on' || data.get('is_indexed') === 'true'
    const is_active =
      data.get('is_active') === 'on' || data.get('is_active') === 'true'
    const notes = data.get('notes')?.toString() || ''

    if (!id) return fail(400, { error: 'ID não fornecido.' })
    if (!dateStr || !supplier) {
      return fail(400, { error: 'Data e Comercializadora são obrigatórios.' })
    }

    try {
      await locals.pb.collection('proposals').update(id, {
        date: new Date(dateStr).toISOString(),
        supplier,
        power_kva,
        power_tar,
        power_com,
        energy_tar,
        energy_com,
        is_indexed,
        is_active,
        notes,
      })
      return { success: true }
    } catch (err: any) {
      return fail(400, { error: err?.message || 'Erro ao atualizar proposta.' })
    }
  },

  toggleActive: async ({ request, locals }) => {
    const data = await request.formData()
    const id = data.get('id')?.toString()
    const currentActive = data.get('currentActive') === 'true'

    if (!id) return fail(400, { error: 'ID não fornecido.' })

    try {
      await locals.pb.collection('proposals').update(id, {
        is_active: !currentActive,
      })
      return { success: true }
    } catch (err: any) {
      return fail(400, {
        error: err?.message || 'Erro ao alterar estado da proposta.',
      })
    }
  },

  delete: async ({ request, locals }) => {
    const data = await request.formData()
    const id = data.get('id')?.toString()
    if (!id) return fail(400, { error: 'ID não fornecido.' })

    try {
      await locals.pb.collection('proposals').delete(id)
      return { success: true }
    } catch (err: any) {
      return fail(400, { error: err?.message || 'Erro ao eliminar proposta.' })
    }
  },
}
