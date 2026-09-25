<script lang="ts">
  import Grid from '@/components/Grid.svelte'

  interface Props {
    form?: {
      email?: string
      error?: string
    }
  }

  let { form }: Props = $props()
</script>

<div>
  <Grid>
    <wa-card>
      <div slot="header">
        <h3>Iniciar Sessão</h3>
        <p>Aceda ao Calculador de Eletricidade</p>
      </div>

      {#if form?.error}
        <wa-callout variant="danger">
          <wa-icon slot="icon" name="circle-exclamation"></wa-icon>
          {form.error}
        </wa-callout>
      {/if}

      <form method="POST">
        <Grid>
          <wa-input
            label="Email"
            type="email"
            name="email"
            value={form?.email ?? ''}
            required
            placeholder="utilizador@exemplo.com"
          ></wa-input>

          <wa-input
            label="Palavra-passe"
            type="password"
            name="password"
            required
            password-toggle
          ></wa-input>

          <wa-button type="submit" variant="brand"> Entrar </wa-button>
        </Grid>
      </form>

      <div slot="footer">
        <small>Credenciais padrão: admin@local.host / password123456</small>
      </div>
    </wa-card>
  </Grid>
</div>
