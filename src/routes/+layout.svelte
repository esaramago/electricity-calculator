<script lang="ts">
  import '@awesome.me/webawesome/dist/styles/webawesome.css'
  import '@/css/webawesome-theme.css'

  import '@awesome.me/webawesome/dist/components/button/button.js'
  import '@awesome.me/webawesome/dist/components/input/input.js'
  import '@awesome.me/webawesome/dist/components/card/card.js'
  import '@awesome.me/webawesome/dist/components/dialog/dialog.js'
  import '@awesome.me/webawesome/dist/components/select/select.js'
  import '@awesome.me/webawesome/dist/components/option/option.js'
  import '@awesome.me/webawesome/dist/components/badge/badge.js'
  import '@awesome.me/webawesome/dist/components/icon/icon.js'
  import '@awesome.me/webawesome/dist/components/tag/tag.js'
  import '@awesome.me/webawesome/dist/components/divider/divider.js'
  import '@awesome.me/webawesome/dist/components/callout/callout.js'

  import Grid from '@/components/Grid.svelte'
  import type { Snippet } from 'svelte'

  interface Props {
    data: {
      user: { id: string; email: string } | null
    }
    children?: Snippet
  }

  let { data, children }: Props = $props()
</script>

<div class="app-container">
  {#if data.user}
    <header class="app-header">
      <Grid cols="2" gap="4">
        <div class="brand-section">
          <h2>Calculador de Eletricidade</h2>
          <nav>
            <Grid cols="3" gap="2">
              <a href="/">
                <wa-button variant="text">Comparador</wa-button>
              </a>
              <a href="/readings">
                <wa-button variant="text">Consumos</wa-button>
              </a>
              <a href="/proposals">
                <wa-button variant="text">Propostas</wa-button>
              </a>
            </Grid>
          </nav>
        </div>

        <div class="user-section">
          <Grid cols="2" gap="2">
            <span>{data.user.email}</span>
            <form method="POST" action="/logout">
              <wa-button type="submit" variant="neutral" size="small"
                >Sair</wa-button
              >
            </form>
          </Grid>
        </div>
      </Grid>
      <wa-divider></wa-divider>
    </header>
  {/if}

  <main class="app-main">
    {#if children}
      {@render children()}
    {/if}
  </main>
</div>
