<script lang="ts">
  import Grid from '@/components/Grid.svelte'

  interface Props {
    user?: { id?: string; email?: string, name?: string } | null
  }

  let { user }: Props = $props()
</script>

{#if user}
  <header class="l-container">
    <Grid align="center" justify="space-between">
      <Grid align="center">
        <h2>Calculador de Eletricidade</h2>
        <nav>
          <Grid gap="none">
            <a href="/">
              <wa-button appearance="plain">Comparador</wa-button>
            </a>
            <a href="/readings">
              <wa-button appearance="plain">Consumos</wa-button>
            </a>
            <a href="/proposals">
              <wa-button appearance="plain">Propostas</wa-button>
            </a>
          </Grid>
        </nav>
      </Grid>
      <Grid gap="xs" align="center">
        <span>{user.name}</span>
        <form method="POST" action="/logout">
          <wa-button type="submit" variant="neutral" size="small"
            >Sair</wa-button
          >
        </form>
      </Grid>
    </Grid>
    <wa-divider></wa-divider>
  </header>
{/if}

<style>
  header {
    padding-block: var(--wa-space-l);
  }
</style>