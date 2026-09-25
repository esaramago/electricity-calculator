/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const readings = new Collection({
      name: 'readings',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'date', type: 'date', required: true },
        { name: 'vazio', type: 'number', required: true },
        { name: 'ponta', type: 'number', required: true },
        { name: 'cheia', type: 'number', required: true },
        { name: 'total', type: 'number' },
        { name: 'notes', type: 'text' },
      ],
    })
    app.save(readings)

    const proposals = new Collection({
      name: 'proposals',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'date', type: 'date', required: true },
        { name: 'supplier', type: 'text', required: true },
        { name: 'power_kva', type: 'number', required: true },
        { name: 'power_tar', type: 'number', required: true },
        { name: 'power_com', type: 'number', required: true },
        { name: 'energy_tar', type: 'number', required: true },
        { name: 'energy_com', type: 'number', required: true },
        { name: 'is_indexed', type: 'bool' },
        { name: 'is_active', type: 'bool' },
        { name: 'notes', type: 'text' },
      ],
    })
    app.save(proposals)
  },
  (app) => {
    try {
      const readings = app.findCollectionByNameOrId('readings')
      if (readings) app.delete(readings)
    } catch (e) {}

    try {
      const proposals = app.findCollectionByNameOrId('proposals')
      if (proposals) app.delete(proposals)
    } catch (e) {}
  },
)
