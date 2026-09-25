<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	interface Props extends HTMLAttributes<HTMLDivElement> {
		cols?: number | string;
		gap?: number | string;
		class?: string;
		children?: Snippet;
	}
	let {
		cols = 1,
		gap = 4,
		class: className = '',
		children,
		...restProps
	}: Props = $props();
	const colsMap: Record<string | number, string> = {
		1: 'grid-cols-1',
		2: 'grid-cols-1 md:grid-cols-2',
		3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
		4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
		6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
		12: 'grid-cols-12'
	};
	const gapMap: Record<string | number, string> = {
		1: 'gap-1',
		2: 'gap-2',
		3: 'gap-3',
		4: 'gap-4',
		6: 'gap-6',
		8: 'gap-8'
	};
	const gridColsClass = $derived(colsMap[cols] ?? `grid-cols-${cols}`);
	const gapClass = $derived(gapMap[gap] ?? `gap-${gap}`);
</script>
<div class="grid {gridColsClass} {gapClass} {className}" {...restProps}>
	{#if children}
		{@render children()}
	{/if}
</div>