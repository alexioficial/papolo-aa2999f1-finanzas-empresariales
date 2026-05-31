<script lang="ts">
	let { page, totalPages, onPageChange }: {
		page: number;
		totalPages: number;
		onPageChange: (p: number) => void;
	} = $props();
</script>

{#if totalPages > 1}
	<nav class="flex items-center justify-center gap-1 mt-6" aria-label="Paginacion">
		<button
			onclick={() => onPageChange(page - 1)}
			disabled={page <= 1}
			class="rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-surface transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
			aria-label="Pagina anterior"
		>
			Anterior
		</button>
		{#each Array.from({ length: totalPages }, (_, i) => i + 1) as p}
			<button
				onclick={() => onPageChange(p)}
				class={'rounded-lg px-3 py-2 text-sm transition-colors hover:bg-surface ' + (page === p ? 'bg-primary text-white' : 'text-text-secondary')}
				aria-label={`Pagina ${p}`}
				aria-current={page === p ? 'page' : undefined}
			>
				{p}
			</button>
		{/each}
		<button
			onclick={() => onPageChange(page + 1)}
			disabled={page >= totalPages}
			class="rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-surface transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
			aria-label="Pagina siguiente"
		>
			Siguiente
		</button>
	</nav>
{/if}
