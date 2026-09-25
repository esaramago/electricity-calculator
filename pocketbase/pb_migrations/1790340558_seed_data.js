/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const readingsCol = app.findCollectionByNameOrId('readings')
    const proposalsCol = app.findCollectionByNameOrId('proposals')

    const readingsData = [
      {
        date: '2026-09-25 12:00:00.000Z',
        vazio: 4911,
        ponta: 3345,
        cheia: 7500,
        total: 15756,
        notes: '',
      },
      {
        date: '2026-09-07 12:00:00.000Z',
        vazio: 4887,
        ponta: 3322,
        cheia: 7450,
        total: 15659,
        notes: '',
      },
      {
        date: '2026-07-04 12:00:00.000Z',
        vazio: 4805,
        ponta: 3247,
        cheia: 7296,
        total: 15348,
        notes: '',
      },
      {
        date: '2025-11-27 12:00:00.000Z',
        vazio: 4493,
        ponta: 2964,
        cheia: 6647,
        total: 14104,
        notes: '',
      },
      {
        date: '2025-06-25 12:00:00.000Z',
        vazio: 4289,
        ponta: 2794,
        cheia: 6279,
        total: 13362,
        notes: '',
      },
      {
        date: '2025-04-02 12:00:00.000Z',
        vazio: 4180,
        ponta: 2722,
        cheia: 6119,
        total: 13021,
        notes: '',
      },
      {
        date: '2025-03-06 12:00:00.000Z',
        vazio: 4143,
        ponta: 2690,
        cheia: 6060,
        total: 12893,
        notes: '',
      },
      {
        date: '2025-02-27 12:00:00.000Z',
        vazio: 4135,
        ponta: 2684,
        cheia: 6047,
        total: 12866,
        notes: '',
      },
      {
        date: '2025-02-26 12:00:00.000Z',
        vazio: 4135,
        ponta: 2682,
        cheia: 6045,
        total: 12862,
        notes: '',
      },
      {
        date: '2025-02-11 12:00:00.000Z',
        vazio: 4117,
        ponta: 2666,
        cheia: 6001,
        total: 12784,
        notes: '',
      },
      {
        date: '2025-01-15 12:00:00.000Z',
        vazio: 4070,
        ponta: 2634,
        cheia: 5920,
        total: 12624,
        notes: '',
      },
      {
        date: '2024-10-29 12:00:00.000Z',
        vazio: 3953,
        ponta: 2549,
        cheia: 5698,
        total: 12200,
        notes: '',
      },
      {
        date: '2024-10-09 12:00:00.000Z',
        vazio: 3924,
        ponta: 2520,
        cheia: 5653,
        total: 12097,
        notes: '',
      },
      {
        date: '2024-04-08 12:00:00.000Z',
        vazio: 3672,
        ponta: 2364,
        cheia: 5293,
        total: 11329,
        notes: '',
      },
      {
        date: '2022-12-22 12:00:00.000Z',
        vazio: 2888,
        ponta: 1869,
        cheia: 4114,
        total: 8871,
        notes: '',
      },
    ]

    for (const item of readingsData) {
      const record = new Record(readingsCol)
      record.set('date', item.date)
      record.set('vazio', item.vazio)
      record.set('ponta', item.ponta)
      record.set('cheia', item.cheia)
      record.set('total', item.total)
      record.set('notes', item.notes)
      app.save(record)
    }

    const proposalsData = [
      {
        date: '2026-09-25 12:00:00.000Z',
        supplier: 'EDP',
        power_kva: 3.45,
        power_tar: 0.1718,
        power_com: 0.0595,
        energy_tar: 0.0607,
        energy_com: 0.073,
        is_indexed: false,
        is_active: true,
        notes: '',
      },
      {
        date: '2026-09-25 12:00:00.000Z',
        supplier: 'Coopérnico',
        power_kva: 3.45,
        power_tar: 0.1718,
        power_com: 0.0225,
        energy_tar: 0.0607,
        energy_com: 0.132732,
        is_indexed: true,
        is_active: true,
        notes: 'Indexado',
      },
      {
        date: '2026-06-30 12:00:00.000Z',
        supplier: 'G9',
        power_kva: 3.45,
        power_tar: 0.1718,
        power_com: 0.0526,
        energy_tar: 0.0607,
        energy_com: 0.0741,
        is_indexed: false,
        is_active: true,
        notes: '',
      },
      {
        date: '2026-02-09 12:00:00.000Z',
        supplier: 'G9',
        power_kva: 3.45,
        power_tar: 0.1718,
        power_com: 0.0526,
        energy_tar: 0.0607,
        energy_com: 0.0741,
        is_indexed: false,
        is_active: true,
        notes: '',
      },
      {
        date: '2026-02-04 12:00:00.000Z',
        supplier: 'EDP',
        power_kva: 3.45,
        power_tar: 0.1718,
        power_com: 0.0306,
        energy_tar: 0.0607,
        energy_com: 0.1064,
        is_indexed: false,
        is_active: true,
        notes: '',
      },
      {
        date: '2026-01-01 12:00:00.000Z',
        supplier: 'Galp',
        power_kva: 3.45,
        power_tar: 0.1718,
        power_com: 0.1098,
        energy_tar: 0.0607,
        energy_com: 0.0964,
        is_indexed: false,
        is_active: true,
        notes: '',
      },
      {
        date: '2025-12-31 12:00:00.000Z',
        supplier: 'Galp',
        power_kva: 3.45,
        power_tar: 0.1587,
        power_com: 0.1109,
        energy_tar: 0.06,
        energy_com: 0.0965,
        is_indexed: false,
        is_active: true,
        notes: '',
      },
    ]

    for (const item of proposalsData) {
      const record = new Record(proposalsCol)
      record.set('date', item.date)
      record.set('supplier', item.supplier)
      record.set('power_kva', item.power_kva)
      record.set('power_tar', item.power_tar)
      record.set('power_com', item.power_com)
      record.set('energy_tar', item.energy_tar)
      record.set('energy_com', item.energy_com)
      record.set('is_indexed', item.is_indexed)
      record.set('is_active', item.is_active)
      record.set('notes', item.notes)
      app.save(record)
    }
  },
  (app) => {
    // rollback
  },
)
