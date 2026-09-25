<script lang="ts">
  import '@awesome.me/webawesome/dist/styles/webawesome.css'
  import '@/css/main.css'

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

  import Header from '@/components/Header.svelte'
  import type { Snippet } from 'svelte'

  interface Props {
    data: {
      user: { id: string; email: string } | null
    }
    children?: Snippet
  }

  let { data, children }: Props = $props()
</script>

<Header user={data.user} />

<main class="l-container">
  {#if children}
    {@render children()}
  {/if}
</main>
