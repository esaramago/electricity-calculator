<script lang="ts">
  import Grid from '@/components/Grid.svelte'
  import type { Reading, Proposal, CalculationMethod } from '$lib/types'
  import {
    calculateConsumption,
    calculateAllProposals,
    CYCLE_DAYS,
  } from '$lib/calculator'

  interface Props {
    data: {
      readings: Reading[]
      proposals: Proposal[]
    }
  }

  let { data }: Props = $props()

  // State
  let selectedMethod = $state<CalculationMethod>('all_time')
  let manualKwh = $state<number>(150)
  let selectedPowerKva = $state<number>(3.45)
  let showArchived = $state<boolean>(false)
  let createDialogOpen = $state<boolean>(false)
  let editDialogOpen = $state<boolean>(false)
  let editingProposal = $state<Proposal | null>(null)

  function openEdit(p: Proposal) {
    editingProposal = p
    editDialogOpen = true
  }

  // Available unique power kva values in proposals
  const availablePowers = $derived.by(() => {
    const set = new Set<number>()
    data.proposals.forEach((p) => {
      if (showArchived || p.is_active) {
        set.add(p.power_kva)
      }
    })
    return Array.from(set).sort((a, b) => a - b)
  })

  // Calculate consumption stats based on method
  const stats = $derived.by(() => {
    return calculateConsumption(data.readings, selectedMethod, manualKwh)
  })

  // Effective kWh used for proposal simulation
  const effectiveKwh = $derived(
    selectedMethod === 'manual' ? manualKwh : stats.monthlyAverageTotal,
  )

  // Calculate proposals comparison
  const calculatedProposals = $derived.by(() => {
    return calculateAllProposals(
      data.proposals,
      effectiveKwh,
      selectedPowerKva,
      showArchived,
    )
  })

  const bestProposal = $derived(calculatedProposals.find((p) => p.isBest))

  function handleMethodChange(event: Event) {
    const target = event.target as HTMLSelectElement | null
    if (target?.value) {
      selectedMethod = target.value as CalculationMethod
    }
  }

  function handlePowerChange(event: Event) {
    const target = event.target as HTMLSelectElement | null
    if (target?.value) {
      selectedPowerKva = Number(target.value)
    }
  }

  function handleManualInput(event: Event) {
    const target = event.target as HTMLInputElement | null
    if (target?.value) {
      const val = parseFloat(target.value)
      if (!isNaN(val) && val >= 0) {
        manualKwh = val
      }
    }
  }
</script>

<div>
  <h2>Simulador & Comparador de Tarifários</h2>
  <p>
    Cálculo em tempo real com base no perfil de consumo e nas regras fiscais
    (IVA a 6% e 23%)
  </p>
</div>

<Grid gap="s">
  <!-- Controls Bar -->
  <wa-card>
    <div slot="header">
      <h4>Configuração do Perfil de Consumo</h4>
    </div>

    <Grid>
      <div>
        <label for="method-select">
          <strong>Tipo de Cálculo (Média de Consumo)</strong>
        </label>
        <select
          id="method-select"
          value={selectedMethod}
          onchange={handleMethodChange}
        >
          <option value="all_time">Todo o Histórico (2022 até hoje)</option>
          <option value="last_12_months"
            >Últimos 12 Meses (LTM - 1 ano)</option
          >
          <option value="last_6_months"
            >Últimos 6 Meses (Tendência Recente)</option
          >
          <option value="ytd">Ano Corrente (YTD)</option>
          <option value="manual">Simulação Manual Personalizada</option>
        </select>
      </div>

      <div>
        {#if selectedMethod === 'manual'}
          <wa-input
            label="Consumo Simulado (kWh/mês)"
            type="number"
            min="0"
            step="5"
            value={String(manualKwh)}
            oninput={handleManualInput}
          ></wa-input>
        {:else}
          <div>
            <span>Período Considerado</span>
            <strong
              >{stats.days} dias ({stats.months.toFixed(1)} ciclos de {CYCLE_DAYS}
              dias)</strong
            >
          </div>
        {/if}
      </div>

      <div>
        <label for="power-select">
          <strong>Potência Contratada (kVA)</strong>
        </label>
        <select
          id="power-select"
          value={selectedPowerKva}
          onchange={handlePowerChange}
        >
          {#each availablePowers as p}
            <option value={p}>{p} kVA</option>
          {/each}
        </select>
      </div>
    </Grid>
  </wa-card>

  <!-- Consumption Breakdown Cards -->
  <wa-card>
    <div slot="header">
      <h4>
        Perfil de Consumo Mensal Apurado ({effectiveKwh.toFixed(1)} kWh/mês)
      </h4>
    </div>

    <Grid gap="s">
      <div>
        <span>Consumo Total</span>
        <strong>{stats.monthlyAverageTotal.toFixed(1)} kWh</strong>
        <small>{stats.dailyAverageTotal.toFixed(2)} kWh/dia</small>
      </div>

      <div>
        <span>Vazio</span>
        <strong>{stats.monthlyAverageVazio.toFixed(1)} kWh</strong>
        <small
          >{(
            (stats.monthlyAverageVazio / (stats.monthlyAverageTotal || 1)) *
            100
          ).toFixed(0)}% do total</small
        >
      </div>

      <div>
        <span>Ponta</span>
        <strong>{stats.monthlyAveragePonta.toFixed(1)} kWh</strong>
        <small
          >{(
            (stats.monthlyAveragePonta / (stats.monthlyAverageTotal || 1)) *
            100
          ).toFixed(0)}% do total</small
        >
      </div>

      <div>
        <span>Cheia</span>
        <strong>{stats.monthlyAverageCheia.toFixed(1)} kWh</strong>
        <small
          >{(
            (stats.monthlyAverageCheia / (stats.monthlyAverageTotal || 1)) *
            100
          ).toFixed(0)}% do total</small
        >
      </div>

      <div>
        <span>Fora de Vazio (P+C)</span>
        <strong>{stats.monthlyAverageForaDeVazio.toFixed(1)} kWh</strong>
        <small
          >{(
            (stats.monthlyAverageForaDeVazio /
              (stats.monthlyAverageTotal || 1)) *
            100
          ).toFixed(0)}% do total</small
        >
      </div>
    </Grid>
  </wa-card>
</Grid>

<!-- Best Deal Callout -->
{#if bestProposal}
  <wa-callout variant="success">
    <wa-icon slot="icon" name="circle-check"></wa-icon>
    <strong>Melhor Oferta Atual: {bestProposal.proposal.supplier}</strong>
    com um custo mensal estimado de
    <strong
      >{bestProposal.totalMonthlyWithVat.toFixed(2)} €/mês (c/ IVA)</strong
    >
    para {selectedPowerKva} kVA e {effectiveKwh.toFixed(1)} kWh/mês.
  </wa-callout>
{/if}

<!-- Comparison Table -->
<wa-card>
  <div slot="header">
    <Grid align="center" justify="space-between">
      <h4>Ranking de Tarifários (Ordenado por Preço)</h4>
      <Grid gap="s" align="center">
        <wa-checkbox
          checked={showArchived ? true : undefined}
          onwa-change={(e: any) => (showArchived = e.target.checked)}
        >
          Mostrar arquivadas
        </wa-checkbox>
        <wa-button
          role="button"
          tabindex="0"
          variant="brand"
          size="small"
          onclick={() => (createDialogOpen = true)}
        >
          <wa-icon slot="prefix" name="plus"></wa-icon>
          Nova Proposta
        </wa-button>
      </Grid>
    </Grid>
  </div>

  <div>
    <table>
      <thead>
        <tr>
          <th>Posição</th>
          <th>Comercializadora</th>
          <th>Tipo</th>
          <th>Potência (€/dia)</th>
          <th>Energia (€/kWh)</th>
          <th>Custo Potência (mês)</th>
          <th>Custo Energia (mês)</th>
          <th>Total c/ IVA (mês)</th>
          <th>Diferença</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        {#each calculatedProposals as item, rank (item.proposal.id)}
          {@const diff = bestProposal
            ? item.totalMonthlyWithVat - bestProposal.totalMonthlyWithVat
            : 0}
          <tr>
            <td>
              {#if item.isBest}
                <wa-badge variant="success">#1 Melhor</wa-badge>
              {:else}
                <span>#{rank + 1}</span>
              {/if}
            </td>
            <td>
              <Grid gap="xs" align="center">
                <strong>{item.proposal.supplier}</strong>
                {#if !item.proposal.is_active}
                  <wa-badge variant="neutral">Arquivada</wa-badge>
                {/if}
              </Grid>
              {#if item.proposal.notes}
                <small>({item.proposal.notes})</small>
              {/if}
            </td>
            <td>
              {#if item.proposal.is_indexed}
                <wa-badge variant="warning">Indexado</wa-badge>
              {:else}
                <wa-badge variant="neutral">Fixo</wa-badge>
              {/if}
            </td>
            <td>{item.powerDailyTotal.toFixed(4)} €</td>
            <td>{item.energyKwhTotal.toFixed(4)} €</td>
            <td>{item.powerMonthlyWithVat.toFixed(2)} €</td>
            <td>{item.energyMonthlyWithVat.toFixed(2)} €</td>
            <td>
              <strong>{item.totalMonthlyWithVat.toFixed(2)} €</strong>
            </td>
            <td>
              {#if item.isBest}
                <wa-tag variant="success">Melhor Preço</wa-tag>
              {:else}
                <wa-tag variant="neutral">+{diff.toFixed(2)} €/mês</wa-tag>
              {/if}
            </td>
            <td>
              <Grid gap="xs" align="center">
                <wa-button
                  role="button"
                  tabindex="0"
                  variant="neutral"
                  size="small"
                  onclick={() => openEdit(item.proposal)}
                >
                  <wa-icon slot="prefix" name="pencil"></wa-icon>
                  Editar
                </wa-button>

                <form method="POST" action="?/toggleActive">
                  <input type="hidden" name="id" value={item.proposal.id} />
                  <input
                    type="hidden"
                    name="currentActive"
                    value={String(item.proposal.is_active)}
                  />
                  <wa-button type="submit" variant="text" size="small">
                    {item.proposal.is_active ? 'Arquivar' : 'Reativar'}
                  </wa-button>
                </form>
              </Grid>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</wa-card>

<!-- Dialog for New Proposal -->
<wa-dialog
  label="Adicionar Nova Proposta"
  open={createDialogOpen}
  onwa-after-hide={() => (createDialogOpen = false)}
>
  <form method="POST" action="?/create">
    <Grid direction="column">
      <Grid direction="column">
        <wa-input
          label="Data"
          type="date"
          name="date"
          value={new Date().toISOString().split('T')[0]}
          required
        ></wa-input>

        <wa-input
          label="Comercializadora"
          type="text"
          name="supplier"
          placeholder="Ex: EDP, Galp, Coopérnico"
          required
        ></wa-input>
        <wa-input
          label="Potência (kVA)"
          type="number"
          name="power_kva"
          value={String(selectedPowerKva || 3.45)}
          step="0.01"
          min="0"
          required
        ></wa-input>

        <wa-input
          label="Potência TAR (€/dia)"
          type="number"
          name="power_tar"
          value="0.1718"
          step="0.0001"
          required
        ></wa-input>

        <wa-input
          label="Potência Comerc. (€/dia)"
          type="number"
          name="power_com"
          step="0.0001"
          required
          placeholder="0.0500"
        ></wa-input>
        
        <wa-input
          label="Energia TAR (€/kWh)"
          type="number"
          name="energy_tar"
          value="0.0607"
          step="0.0001"
          required
        ></wa-input>

        <wa-input
          label="Energia Comerc. (€/kWh)"
          type="number"
          name="energy_com"
          step="0.0001"
          required
          placeholder="0.0750"
        ></wa-input>

        <wa-checkbox name="is_indexed">
          Tarifário Indexado (OMIE)
        </wa-checkbox>

        <wa-input
          label="Notas adicionais"
          type="text"
          name="notes"
          placeholder="Ex: Campanha de adesão com desconto"
        ></wa-input>
      </Grid>

      <Grid gap="s">
        <wa-button
          role="button"
          tabindex="0"
          variant="neutral"
          onclick={() => (createDialogOpen = false)}
        >
          Cancelar
        </wa-button>
        <wa-button type="submit" variant="brand">
          Criar Proposta
        </wa-button>
      </Grid>
    </Grid>
  </form>
</wa-dialog>

<!-- Dialog for Editing Proposal -->
<wa-dialog
  label="Editar Proposta"
  open={editDialogOpen}
  onwa-after-hide={() => {
    editDialogOpen = false
    editingProposal = null
  }}
>
  {#if editingProposal}
    <Grid>
      <form method="POST" action="?/update">
        <input type="hidden" name="id" value={editingProposal.id} />
        <Grid>
          <Grid gap="s">
            <wa-input
              label="Data"
              type="date"
              name="date"
              value={editingProposal.date ? editingProposal.date.split('T')[0] : ''}
              required
            ></wa-input>

            <wa-input
              label="Comercializadora"
              type="text"
              name="supplier"
              value={editingProposal.supplier}
              required
            ></wa-input>
          </Grid>

          <Grid gap="s">
            <wa-input
              label="Potência (kVA)"
              type="number"
              name="power_kva"
              value={String(editingProposal.power_kva)}
              step="0.01"
              min="0"
              required
            ></wa-input>

            <wa-input
              label="Potência TAR (€/dia)"
              type="number"
              name="power_tar"
              value={String(editingProposal.power_tar)}
              step="0.0001"
              required
            ></wa-input>

            <wa-input
              label="Potência Comerc. (€/dia)"
              type="number"
              name="power_com"
              value={String(editingProposal.power_com)}
              step="0.0001"
              required
            ></wa-input>
          </Grid>

          <Grid gap="s">
            <wa-input
              label="Energia TAR (€/kWh)"
              type="number"
              name="energy_tar"
              value={String(editingProposal.energy_tar)}
              step="0.0001"
              required
            ></wa-input>

            <wa-input
              label="Energia Comerc. (€/kWh)"
              type="number"
              name="energy_com"
              value={String(editingProposal.energy_com)}
              step="0.0001"
              required
            ></wa-input>
          </Grid>

          <wa-checkbox
            name="is_indexed"
            checked={editingProposal.is_indexed ? true : undefined}
          >
            Tarifário Indexado (OMIE)
          </wa-checkbox>

          <wa-checkbox
            name="is_active"
            checked={editingProposal.is_active ? true : undefined}
          >
            Proposta Ativa
          </wa-checkbox>

          <wa-input
            label="Notas adicionais"
            type="text"
            name="notes"
            value={editingProposal.notes || ''}
            placeholder="Ex: Campanha de adesão com desconto"
          ></wa-input>

          <Grid gap="s" justify="space-between">
            <wa-button
              role="button"
              tabindex="0"
              variant="neutral"
              onclick={() => {
                editDialogOpen = false
                editingProposal = null
              }}
            >
              Cancelar
            </wa-button>
            <wa-button type="submit" variant="brand">
              Guardar Alterações
            </wa-button>
          </Grid>
        </Grid>
      </form>

      <form
        method="POST"
        action="?/delete"
        onsubmit={(e) => {
          if (!confirm('Eliminar esta proposta permanentemente?')) {
            e.preventDefault()
          }
        }}
      >
        <input type="hidden" name="id" value={editingProposal.id} />
        <wa-button type="submit" variant="danger">
          Eliminar Proposta
        </wa-button>
      </form>
    </Grid>
  {/if}
</wa-dialog>