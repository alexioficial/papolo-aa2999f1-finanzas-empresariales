<script lang="ts">
	let { title = 'Sin datos', description = '', action, actionLabel = 'Crear' }: {
		title?: string;
		description?: string;
		action?: () => void;
		actionLabel?: string;
	} = $props();
</script>

<div class="flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-12 text-center">
	<svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-text-secondary/30 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
		<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
		<polyline points="14 2 14 8 20 8"/>
		<line x1="12" y1="18" x2="12" y2="12"/>
		<line x1="9" y1="15" x2="15" y2="15"/>
	</svg>
	<h3 class="text-lg font-medium text-text">{title}</h3>
	{#if description}
		<p class="mt-1 text-sm text-text-secondary max-w-xs">{description}</p>
	{/if}
	{#if action}
		<button onclick={action} class="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors">
			{actionLabel}
		</button>
	{/if}
</div>
