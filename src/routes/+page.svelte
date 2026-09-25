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
  let proposalDialogOpen = $state<boolean>(false)
  let editingProposal = $state<Proposal | null>(null)
  let archiveDialogOpen = $state<boolean>(false)
  let proposalToArchive = $state<Proposal | null>(null)

  function openCreate() {
    editingProposal = null
    proposalDialogOpen = true
  }

  function openEdit(p: Proposal) {
    editingProposal = p
    proposalDialogOpen = true
  }

  function closeProposalDialog() {
    proposalDialogOpen = false
    editingProposal = null
  }

  function openArchiveConfirm(p: Proposal) {
    proposalToArchive = p
    archiveDialogOpen = true
  }

  function closeArchiveDialog() {
    archiveDialogOpen = false
    proposalToArchive = null
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

<Grid gap="s" fullWidth>
  <!-- Controls Bar -->
  <wa-card>
    <div slot="header">
      <h3 data-appearance="h4">Configuração do Perfil de Consumo</h3>
    </div>

    <Grid>
      <wa-select
        id="method-select"
        value={selectedMethod}
        waOnchange={handleMethodChange}
        label="Tipo de Cálculo (Média de Consumo)"
      >
        <wa-option value="all_time">Todo o Histórico (2022 até hoje)</wa-option>
        <wa-option value="last_12_months"
          >Últimos 12 Meses (LTM - 1 ano)</wa-option
        >
        <wa-option value="last_6_months"
          >Últimos 6 Meses (Tendência Recente)</wa-option
        >
        <wa-option value="ytd">Ano Corrente (YTD)</wa-option>
        <wa-option value="manual">Simulação Manual Personalizada</wa-option>
      </wa-select>

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
            <h3 data-appearance="p">Período Considerado</h3>
            <strong
              >{stats.days} dias ({stats.months.toFixed(1)} ciclos de {CYCLE_DAYS}
              dias)</strong
            >
          </div>
        {/if}
      </div>
    </Grid>
  </wa-card>

  <!-- Consumption Breakdown Cards -->
  <wa-card>
    <div slot="header">
      <h3 data-appearance="h4">
        Perfil de Consumo Mensal Apurado ({effectiveKwh.toFixed(1)} kWh/mês)
      </h3>
    </div>

    <Grid gap="s">
      <div>
        <h4 data-appearance="p">Consumo Total</h4>
        <strong>{stats.monthlyAverageTotal.toFixed(1)} kWh</strong><br>
        <small>{stats.dailyAverageTotal.toFixed(2)} kWh/dia</small>
      </div>

      <div>
        <h4 data-appearance="p">Vazio</h4>
        <strong>{stats.monthlyAverageVazio.toFixed(1)} kWh</strong><br>
        <small
          >{(
            (stats.monthlyAverageVazio / (stats.monthlyAverageTotal || 1)) *
            100
          ).toFixed(0)}% do total</small
        >
      </div>

      <div>
        <h4 data-appearance="p">Ponta</h4>
        <strong>{stats.monthlyAveragePonta.toFixed(1)} kWh</strong><br>
        <small
          >{(
            (stats.monthlyAveragePonta / (stats.monthlyAverageTotal || 1)) *
            100
          ).toFixed(0)}% do total</small
        >
      </div>

      <div>
        <h4 data-appearance="p">Cheia</h4>
        <strong>{stats.monthlyAverageCheia.toFixed(1)} kWh</strong><br>
        <small
          >{(
            (stats.monthlyAverageCheia / (stats.monthlyAverageTotal || 1)) *
            100
          ).toFixed(0)}% do total</small
        >
      </div>

      <div>
        <h4 data-appearance="p">Fora de Vazio (P+C)</h4>
        <strong>{stats.monthlyAverageForaDeVazio.toFixed(1)} kWh</strong><br>
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
          checked={showArchived}
          onchange={(e: any) => (showArchived = e.currentTarget.checked)}
        >
          Mostrar arquivadas
        </wa-checkbox>
        <wa-button
          role="button"
          tabindex="0"
          variant="brand"
          size="small"
          onclick={openCreate}
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
                  type="button"
                  variant="neutral"
                  size="s"
                  onclick={() => openEdit(item.proposal)}
                >
                  <wa-icon name="pencil" label="Editar"></wa-icon>
                </wa-button>

                {#if item.proposal.is_active}
                  <wa-button
                    role="button"
                    tabindex="0"
                    variant="danger"
                    size="small"
                    onclick={() => openArchiveConfirm(item.proposal)}
                  >
                    Arquivar
                  </wa-button>
                {:else}
                  <form method="POST" action="?/toggleActive">
                    <input type="hidden" name="id" value={item.proposal.id} />
                    <input
                      type="hidden"
                      name="currentActive"
                      value={String(item.proposal.is_active)}
                    />
                    <wa-button type="submit" variant="success" size="small">
                      Reativar
                    </wa-button>
                  </form>
                {/if}
              </Grid>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</wa-card>

<!-- Dialog for Creating / Editing Proposal -->
<wa-dialog
  label={editingProposal ? 'Editar Proposta' : 'Adicionar Nova Proposta'}
  open={proposalDialogOpen}
  onwa-after-hide={closeProposalDialog}
>
  {#key editingProposal?.id ?? 'new'}
    <Grid direction="column" gap="m">
      <form method="POST" action={editingProposal ? '?/update' : '?/create'}>
        {#if editingProposal}
          <input type="hidden" name="id" value={editingProposal.id} />
        {/if}

        <Grid direction="column" gap="m">
            <wa-input
              label="Data"
              type="date"
              name="date"
              value={editingProposal?.date
                ? editingProposal.date.split('T')[0]
                : new Date().toISOString().split('T')[0]}
              required
            ></wa-input>

            <wa-input
              label="Comercializadora"
              type="text"
              name="supplier"
              value={editingProposal?.supplier ?? ''}
              placeholder="Ex: EDP, Galp, Coopérnico"
              required
            ></wa-input>
            <wa-input
              label="Potência (kVA)"
              type="number"
              name="power_kva"
              value={editingProposal
                ? String(editingProposal.power_kva)
                : String(selectedPowerKva || 3.45)}
              step="0.01"
              min="0"
              required
            ></wa-input>

            <wa-input
              label="Potência TAR (€/dia)"
              type="number"
              name="power_tar"
              value={editingProposal
                ? String(editingProposal.power_tar)
                : '0.1718'}
              step="0.0001"
              required
            ></wa-input>

            <wa-input
              label="Potência Comerc. (€/dia)"
              type="number"
              name="power_com"
              value={editingProposal ? String(editingProposal.power_com) : ''}
              step="0.0001"
              required
              placeholder="0.0500"
            ></wa-input>
            <wa-input
              label="Energia TAR (€/kWh)"
              type="number"
              name="energy_tar"
              value={editingProposal
                ? String(editingProposal.energy_tar)
                : '0.0607'}
              step="0.0001"
              required
            ></wa-input>

            <wa-input
              label="Energia Comerc. (€/kWh)"
              type="number"
              name="energy_com"
              value={editingProposal ? String(editingProposal.energy_com) : ''}
              step="0.0001"
              required
              placeholder="0.0750"
            ></wa-input>

          <wa-checkbox
            name="is_indexed"
            checked={editingProposal?.is_indexed ? true : undefined}
          >
            Tarifário Indexado (OMIE)
          </wa-checkbox>

          {#if editingProposal}
            <wa-checkbox
              name="is_active"
              checked={editingProposal.is_active ? true : undefined}
            >
              Proposta Ativa
            </wa-checkbox>
          {/if}

          <wa-input
            label="Notas adicionais"
            type="text"
            name="notes"
            value={editingProposal?.notes ?? ''}
            placeholder="Ex: Campanha de adesão com desconto"
          ></wa-input>

            <wa-button
              role="button"
              tabindex="0"
              variant="neutral"
              onclick={closeProposalDialog}
            >
              Cancelar
            </wa-button>
            <wa-button type="submit" variant="brand">
              {editingProposal ? 'Guardar Alterações' : 'Criar Proposta'}
            </wa-button>
        </Grid>
      </form>

      {#if editingProposal}
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
      {/if}
    </Grid>
  {/key}
</wa-dialog>

<!-- Confirmation Dialog for Archiving Proposal -->
<wa-dialog
  label="Confirmar Arquivo"
  open={archiveDialogOpen}
  onwa-after-hide={closeArchiveDialog}
>
  {#if proposalToArchive}
    <Grid direction="column" gap="m">
      <p>
        Tens a certeza de que pretendes arquivar a proposta de <strong>{proposalToArchive.supplier}</strong> ({proposalToArchive.power_kva} kVA)?
      </p>
      <p>
        Esta proposta deixará de ser apresentada no comparador de tarifários ativos. Podes consultá-la ou reativá-la a qualquer momento selecionando "Mostrar arquivadas".
      </p>

      <Grid gap="s" justify="end">
        <wa-button
          role="button"
          tabindex="0"
          variant="neutral"
          onclick={closeArchiveDialog}
        >
          Cancelar
        </wa-button>

        <form method="POST" action="?/toggleActive">
          <input type="hidden" name="id" value={proposalToArchive.id} />
          <input type="hidden" name="currentActive" value="true" />
          <wa-button type="submit" variant="danger">
            Arquivar Proposta
          </wa-button>
        </form>
      </Grid>
    </Grid>
  {/if}
</wa-dialog>