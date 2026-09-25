<script lang="ts">
  import Grid from '@/components/Grid.svelte'
  import type { Reading } from '$lib/types'
  import { calculateConsumption } from '$lib/calculator'

  interface Props {
    data: {
      readings: Reading[]
    }
  }

  let { data }: Props = $props()

  let dialogOpen = $state(false)

  // Compute stats across all readings
  const stats = $derived(calculateConsumption(data.readings, 'all_time'))

  // Calculate delta between adjacent readings (sorted chronologically descending)
  function getDelta(index: number): number | null {
    if (index >= data.readings.length - 1) return null
    const current = data.readings[index]
    const prev = data.readings[index + 1]
    return current.total - prev.total
  }

  function formatDate(iso: string): string {
    const d = new Date(iso)
    return d.toLocaleDateString('pt-PT')
  }
</script>

<Grid align="center" justify="space-between">
  <div>
    <h2>Leituras de Consumo</h2>
    <p>Registo histórico de leituras do contador elétrico</p>
  </div>
  <div>
    <wa-button role="button" tabindex="0" variant="brand" onclick={() => (dialogOpen = true)}>
      <wa-icon slot="prefix" name="plus"></wa-icon>
      Nova Leitura
    </wa-button>
  </div>
</Grid>

<Grid fullWidth>
  <!-- Summary Statistics -->
  <wa-card>
    <div slot="header">
      <h3>Resumo Histórico Geral</h3>
    </div>
    <Grid direction="column">
      <div>
        <h4 data-appearance="p">Dias Decorridos</h4>
        <strong>{stats.days} dias</strong>
      </div>
      <div>
        <h4 data-appearance="p">Total Consumido</h4>
        <strong>{stats.deltaTotal.toLocaleString('pt-PT')} kWh</strong>
      </div>
      <div>
        <h4 data-appearance="p">Média Mensal (30 dias)</h4>
        <strong>{stats.monthlyAverageTotal.toFixed(1)} kWh/mês</strong>
      </div>
      <div>
        <h4 data-appearance="p">Média Diária</h4>
        <strong>{stats.dailyAverageTotal.toFixed(2)} kWh/dia</strong>
      </div>
    </Grid>

    <wa-divider></wa-divider>

    <Grid direction="column">
      <div>
        <h4 data-appearance="p">Vazio (Média)</h4>
        <strong>{stats.monthlyAverageVazio.toFixed(1)} kWh/mês</strong>
      </div>
      <div>
        <h4 data-appearance="p">Ponta (Média)</h4>
        <strong>{stats.monthlyAveragePonta.toFixed(1)} kWh/mês</strong>
      </div>
      <div>
        <h4 data-appearance="p">Cheia (Média)</h4>
        <strong>{stats.monthlyAverageCheia.toFixed(1)} kWh/mês</strong>
      </div>
      <div>
        <h4 data-appearance="p">Fora Vazio (P+C)</h4>
        <strong>{stats.monthlyAverageForaDeVazio.toFixed(1)} kWh/mês</strong>
      </div>
    </Grid>
  </wa-card>

  <!-- Readings Table -->
  <wa-card>
    <div slot="header">
      <h3>Histórico de Registos ({data.readings.length})</h3>
    </div>

    <div>
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Vazio</th>
            <th>Ponta</th>
            <th>Cheia</th>
            <th>Total (kWh)</th>
            <th>Consumo Período</th>
            <th>Notas</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {#each data.readings as reading, i (reading.id)}
            {@const delta = getDelta(i)}
            <tr>
              <td><strong>{formatDate(reading.date)}</strong></td>
              <td>{reading.vazio.toLocaleString('pt-PT')}</td>
              <td>{reading.ponta.toLocaleString('pt-PT')}</td>
              <td>{reading.cheia.toLocaleString('pt-PT')}</td>
              <td><strong>{reading.total.toLocaleString('pt-PT')}</strong></td
              >
              <td>
                {#if delta !== null}
                  <wa-badge variant="neutral"
                    >+{delta.toLocaleString('pt-PT')} kWh</wa-badge
                  >
                {:else}
                  <wa-badge variant="brand">Leitura Inicial</wa-badge>
                {/if}
              </td>
              <td>{reading.notes || '-'}</td>
              <td>
                <form
                  method="POST"
                  action="?/delete"
                  onsubmit={(e) => {
                    if (
                      !confirm(
                        'Tem a certeza que deseja eliminar esta leitura?',
                      )
                    )
                      e.preventDefault()
                  }}
                >
                  <input type="hidden" name="id" value={reading.id} />
                  <wa-button type="submit" variant="danger" size="small">
                    Eliminar
                  </wa-button>
                </form>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </wa-card>
</Grid>

<!-- Dialog for New Reading -->
<wa-dialog
  label="Registar Nova Leitura"
  open={dialogOpen}
  onwa-after-hide={() => (dialogOpen = false)}
>
  <form method="POST" action="?/create">
    <Grid>
      <wa-input
        label="Data da Leitura"
        type="date"
        name="date"
        value={new Date().toISOString().split('T')[0]}
        required
      ></wa-input>

      <Grid gap="s">
        <wa-input
          label="Vazio (kWh)"
          type="number"
          name="vazio"
          min="0"
          step="1"
          required
          placeholder="0"
        ></wa-input>

        <wa-input
          label="Ponta (kWh)"
          type="number"
          name="ponta"
          min="0"
          step="1"
          required
          placeholder="0"
        ></wa-input>

        <wa-input
          label="Cheia (kWh)"
          type="number"
          name="cheia"
          min="0"
          step="1"
          required
          placeholder="0"
        ></wa-input>
      </Grid>

      <wa-input
        label="Notas (opcional)"
        type="text"
        name="notes"
        placeholder="Ex: Leitura real após férias"
      ></wa-input>

      <Grid gap="s">
        <wa-button role="button" tabindex="0" variant="neutral" onclick={() => (dialogOpen = false)}>
          Cancelar
        </wa-button>
        <wa-button type="submit" variant="brand"> Guardar Leitura </wa-button>
      </Grid>
    </Grid>
  </form>
</wa-dialog>
