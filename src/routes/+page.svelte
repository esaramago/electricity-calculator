<script lang="ts">
  import Grid from '@/components/Grid.svelte';
  import type { Reading, Proposal, CalculationMethod } from '$lib/types';
  import { calculateConsumption, calculateAllProposals, CYCLE_DAYS } from '$lib/calculator';

  interface Props {
    data: {
      readings: Reading[];
      proposals: Proposal[];
    };
  }

  let { data }: Props = $props();

  // State
  let selectedMethod = $state<CalculationMethod>('all_time');
  let manualKwh = $state<number>(150);
  let selectedPowerKva = $state<number>(3.45);

  // Available unique power kva values in proposals
  const availablePowers = $derived.by(() => {
    const set = new Set<number>();
    data.proposals.forEach((p) => set.add(p.power_kva));
    return Array.from(set).sort((a, b) => a - b);
  });

  // Calculate consumption stats based on method
  const stats = $derived.by(() => {
    return calculateConsumption(data.readings, selectedMethod, manualKwh);
  });

  // Effective kWh used for proposal simulation
  const effectiveKwh = $derived(
    selectedMethod === 'manual' ? manualKwh : stats.monthlyAverageTotal
  );

  // Calculate proposals comparison
  const calculatedProposals = $derived.by(() => {
    return calculateAllProposals(data.proposals, effectiveKwh, selectedPowerKva);
  });

  const bestProposal = $derived(calculatedProposals.find((p) => p.isBest));

  function handleMethodChange(event: Event) {
    const target = event.target as HTMLSelectElement | null;
    if (target?.value) {
      selectedMethod = target.value as CalculationMethod;
    }
  }

  function handlePowerChange(event: Event) {
    const target = event.target as HTMLSelectElement | null;
    if (target?.value) {
      selectedPowerKva = Number(target.value);
    }
  }

  function handleManualInput(event: Event) {
    const target = event.target as HTMLInputElement | null;
    if (target?.value) {
      const val = parseFloat(target.value);
      if (!isNaN(val) && val >= 0) {
        manualKwh = val;
      }
    }
  }
</script>

<div class="comparator-dashboard">
  <Grid cols="1" gap="4">
    <!-- Header title -->
    <div class="dashboard-header">
      <h2>Simulador & Comparador de Tarifários</h2>
      <p>Cálculo em tempo real com base no perfil de consumo e nas regras fiscais (IVA a 6% e 23%)</p>
    </div>

    <!-- Controls Bar -->
    <wa-card>
      <div slot="header">
        <h4>Configuração do Perfil de Consumo</h4>
      </div>

      <Grid cols="3" gap="4">
        <div>
          <label for="method-select">
            <strong>Tipo de Cálculo (Média de Consumo)</strong>
          </label>
          <select
            id="method-select"
            class="native-select"
            value={selectedMethod}
            onchange={handleMethodChange}
          >
            <option value="all_time">Todo o Histórico (2022 até hoje)</option>
            <option value="last_12_months">Últimos 12 Meses (LTM - 1 ano)</option>
            <option value="last_6_months">Últimos 6 Meses (Tendência Recente)</option>
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
            <div class="read-only-stat">
              <span>Período Considerado</span>
              <strong>{stats.days} dias ({stats.months.toFixed(1)} ciclos de {CYCLE_DAYS} dias)</strong>
            </div>
          {/if}
        </div>

        <div>
          <label for="power-select">
            <strong>Potência Contratada (kVA)</strong>
          </label>
          <select
            id="power-select"
            class="native-select"
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
        <h4>Perfil de Consumo Mensal Apurado ({effectiveKwh.toFixed(1)} kWh/mês)</h4>
      </div>

      <Grid cols="5" gap="3">
        <div class="metric-card highlight">
          <span>Consumo Total</span>
          <strong>{stats.monthlyAverageTotal.toFixed(1)} kWh</strong>
          <small>{stats.dailyAverageTotal.toFixed(2)} kWh/dia</small>
        </div>

        <div class="metric-card">
          <span>Vazio</span>
          <strong>{stats.monthlyAverageVazio.toFixed(1)} kWh</strong>
          <small>{((stats.monthlyAverageVazio / (stats.monthlyAverageTotal || 1)) * 100).toFixed(0)}% do total</small>
        </div>

        <div class="metric-card">
          <span>Ponta</span>
          <strong>{stats.monthlyAveragePonta.toFixed(1)} kWh</strong>
          <small>{((stats.monthlyAveragePonta / (stats.monthlyAverageTotal || 1)) * 100).toFixed(0)}% do total</small>
        </div>

        <div class="metric-card">
          <span>Cheia</span>
          <strong>{stats.monthlyAverageCheia.toFixed(1)} kWh</strong>
          <small>{((stats.monthlyAverageCheia / (stats.monthlyAverageTotal || 1)) * 100).toFixed(0)}% do total</small>
        </div>

        <div class="metric-card">
          <span>Fora de Vazio (P+C)</span>
          <strong>{stats.monthlyAverageForaDeVazio.toFixed(1)} kWh</strong>
          <small>{((stats.monthlyAverageForaDeVazio / (stats.monthlyAverageTotal || 1)) * 100).toFixed(0)}% do total</small>
        </div>
      </Grid>
    </wa-card>

    <!-- Best Deal Callout -->
    {#if bestProposal}
      <wa-callout variant="success">
        <wa-icon slot="icon" name="circle-check"></wa-icon>
        <strong>Melhor Oferta Atual: {bestProposal.proposal.supplier}</strong>
        com um custo mensal estimado de <strong>{bestProposal.totalMonthlyWithVat.toFixed(2)} €/mês (c/ IVA)</strong>
        para {selectedPowerKva} kVA e {effectiveKwh.toFixed(1)} kWh/mês.
      </wa-callout>
    {/if}

    <!-- Comparison Table -->
    <wa-card>
      <div slot="header">
        <h4>Ranking de Tarifários (Ordenado por Preço)</h4>
      </div>

      <div class="table-responsive">
        <table class="comparator-table">
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
            </tr>
          </thead>
          <tbody>
            {#each calculatedProposals as item, rank (item.proposal.id)}
              {@const diff = bestProposal ? item.totalMonthlyWithVat - bestProposal.totalMonthlyWithVat : 0}
              <tr class={item.isBest ? 'best-row' : ''}>
                <td>
                  {#if item.isBest}
                    <wa-badge variant="success">#1 Melhor</wa-badge>
                  {:else}
                    <span>#{rank + 1}</span>
                  {/if}
                </td>
                <td>
                  <strong>{item.proposal.supplier}</strong>
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
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </wa-card>
  </Grid>
</div>
