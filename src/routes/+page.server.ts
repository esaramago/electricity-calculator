import type { PageServerLoad } from './$types'
import type { Reading, Proposal } from '$lib/types'

export const load: PageServerLoad = async ({ locals }) => {
  const [readingsRes, proposalsRes] = await Promise.all([
    locals.pb.collection('readings').getFullList({
      sort: 'date',
    }),
    locals.pb.collection('proposals').getFullList({
      filter: 'is_active = true',
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
    is_active: Boolean(p.is_active),
    notes: p.notes || '',
  }))

  return { readings, proposals }
}
