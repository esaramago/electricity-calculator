<script lang="ts">
  import Grid from '@/components/Grid.svelte'
  import type { Proposal } from '$lib/types'

  interface Props {
    data: {
      proposals: Proposal[]
    }
  }

  let { data }: Props = $props()

  let dialogOpen = $state(false)

  function formatDate(iso: string): string {
    const d = new Date(iso)
    return d.toLocaleDateString('pt-PT')
  }
</script>

<div>
  <Grid>
    <div>
      <Grid>
        <div>
          <h2>Propostas de Tarifários</h2>
          <p>Tabela de preços e condições comerciais dos fornecedores</p>
        </div>
        <div>
          <wa-button role="button" tabindex="0" variant="brand" onclick={() => (dialogOpen = true)}>
            <wa-icon slot="prefix" name="plus"></wa-icon>
            Nova Proposta
          </wa-button>
        </div>
      </Grid>
    </div>

    <wa-card>
      <div slot="header">
        <h4>Lista de Propostas ({data.proposals.length})</h4>
      </div>

      <div>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Comercializadora</th>
              <th>Potência (kVA)</th>
              <th>Potência TAR (€/dia)</th>
              <th>Potência Comerc. (€/dia)</th>
              <th>Energia TAR (€/kWh)</th>
              <th>Energia Comerc. (€/kWh)</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Notas</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {#each data.proposals as p (p.id)}
              <tr>
                <td><strong>{formatDate(p.date)}</strong></td>
                <td><strong>{p.supplier}</strong></td>
                <td><wa-tag variant="neutral">{p.power_kva} kVA</wa-tag></td>
                <td>{p.power_tar.toFixed(4)} €</td>
                <td>{p.power_com.toFixed(4)} €</td>
                <td>{p.energy_tar.toFixed(4)} €</td>
                <td>{p.energy_com.toFixed(4)} €</td>
                <td>
                  {#if p.is_indexed}
                    <wa-badge variant="warning">Indexado</wa-badge>
                  {:else}
                    <wa-badge variant="neutral">Fixo</wa-badge>
                  {/if}
                </td>
                <td>
                  {#if p.is_active}
                    <wa-badge variant="success">Ativa</wa-badge>
                  {:else}
                    <wa-badge variant="neutral">Arquivada</wa-badge>
                  {/if}
                </td>
                <td>{p.notes || '-'}</td>
                <td>
                  <Grid gap="xs">
                    <form method="POST" action="?/toggleActive">
                      <input type="hidden" name="id" value={p.id} />
                      <input
                        type="hidden"
                        name="currentActive"
                        value={String(p.is_active)}
                      />
                      <wa-button type="submit" variant="text" size="small">
                        {p.is_active ? 'Arquivar' : 'Reativar'}
                      </wa-button>
                    </form>

                    <form
                      method="POST"
                      action="?/delete"
                      onsubmit={(e) => {
                        if (!confirm('Eliminar esta proposta permanentemente?'))
                          e.preventDefault()
                      }}
                    >
                      <input type="hidden" name="id" value={p.id} />
                      <wa-button type="submit" variant="danger" size="small">
                        Eliminar
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
  </Grid>

  <!-- Dialog for New Proposal -->
  <wa-dialog
    label="Adicionar Nova Proposta"
    open={dialogOpen}
    onwa-after-hide={() => (dialogOpen = false)}
  >
    <form method="POST" action="?/create">
      <Grid>
        <Grid gap="s">
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
        </Grid>

        <Grid gap="s">
          <wa-input
            label="Potência (kVA)"
            type="number"
            name="power_kva"
            value="3.45"
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
        </Grid>

        <Grid gap="s">
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
        </Grid>

        <label>
          <input type="checkbox" name="is_indexed" />
          <span>Tarifário Indexado (OMIE)</span>
        </label>

        <wa-input
          label="Notas adicionais"
          type="text"
          name="notes"
          placeholder="Ex: Campanha de adesão com desconto"
        ></wa-input>

        <Grid gap="s">
          <wa-button role="button" tabindex="0" variant="neutral" onclick={() => (dialogOpen = false)}>
            Cancelar
          </wa-button>
          <wa-button type="submit" variant="brand"> Criar Proposta </wa-button>
        </Grid>
      </Grid>
    </form>
  </wa-dialog>
</div>
