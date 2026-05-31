<script lang="ts">
	import { goto } from '$app/navigation';
	import { formatCurrency, formatDate } from '$lib/utils/format';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import Pagination from '$lib/components/Pagination.svelte';

	let transactions = $state<Array<{
		_id: string;
		type: 'income' | 'expense';
		amount: number;
		description: string;
		date: string;
		category: { _id: string; name: string; color?: string; type: string } | null;
		createdBy: { _id: string; name: string };
	}>>([]);
	let categories = $state<Array<{ _id: string; name: string; type: string; color?: string }>>([]);
	let page = $state(1);
	let totalPages = $state(1);
	let total = $state(0);
	let loading = $state(true);
	let error = $state('');

	let filterTipo = $state('');
	let filterCategoria = $state('');
	let filterDesde = $state('');
	let filterHasta = $state('');
	let filterSearch = $state('');

	async function loadCategories() {
		try {
			const res = await fetch('/api/categorias');
			const json = await res.json();
			if (json.ok) categories = json.categories;
		} catch {}
	}

	async function loadTransactions() {
		loading = true;
		error = '';
		try {
			const params = new URLSearchParams();
			params.set('page', String(page));
			if (filterTipo) params.set('tipo', filterTipo);
			if (filterCategoria) params.set('categoria', filterCategoria);
			if (filterDesde) params.set('desde', filterDesde);
			if (filterHasta) params.set('hasta', filterHasta);
			if (filterSearch) params.set('search', filterSearch);

			const res = await fetch('/api/transacciones?' + params.toString());
			const json = await res.json();
			if (json.ok) {
				transactions = json.items;
				total = json.total;
				totalPages = json.totalPages;
				page = json.page;
			} else {
				error = json.error || 'Error al cargar transacciones';
			}
		} catch {
			error = 'Error de conexion';
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		loadCategories();
		loadTransactions();
	});

	function applyFilters() {
		page = 1;
		loadTransactions();
	}

	function clearFilters() {
		filterTipo = '';
		filterCategoria = '';
		filterDesde = '';
		filterHasta = '';
		filterSearch = '';
		page = 1;
		loadTransactions();
	}

	function onPageChange(p: number) {
		page = p;
		loadTransactions();
	}

	let debounceTimer: ReturnType<typeof setTimeout>;
	function onSearchInput() {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(applyFilters, 400);
	}

	async function deleteTransaction(id: string) {
		if (!confirm('¿Eliminar esta transaccion?')) return;
		try {
			const res = await fetch('/api/transacciones/' + id, { method: 'DELETE' });
			const json = await res.json();
			if (json.ok) loadTransactions();
		} catch {}
	}
</script>

<div class="max-w-6xl">
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
		<h2 class="text-2xl font-bold font-heading text-text">Transacciones</h2>
		<button onclick={() => goto('/transacciones/nueva')} class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors">
			Nueva Transaccion
		</button>
	</div>

	<!-- Filters -->
	<div class="rounded-xl border border-border bg-surface-card p-4 shadow-sm mb-6">
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
			<div>
				<label for="filter-search" class="block text-xs font-medium text-text-secondary mb-1">Buscar</label>
				<input
					id="filter-search" type="text" bind:value={filterSearch} oninput={onSearchInput}
					placeholder="Descripcion..."
					class="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
				/>
			</div>
			<div>
				<label for="filter-tipo" class="block text-xs font-medium text-text-secondary mb-1">Tipo</label>
				<select id="filter-tipo" bind:value={filterTipo} onchange={applyFilters} class="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors">
					<option value="">Todos</option>
					<option value="income">Ingresos</option>
					<option value="expense">Egresos</option>
				</select>
			</div>
			<div>
				<label for="filter-categoria" class="block text-xs font-medium text-text-secondary mb-1">Categoria</label>
				<select id="filter-categoria" bind:value={filterCategoria} onchange={applyFilters} class="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors">
					<option value="">Todas</option>
					{#each categories as cat}
						<option value={cat._id}>{cat.name}</option>
					{/each}
				</select>
			</div>
			<div>
				<label for="filter-desde" class="block text-xs font-medium text-text-secondary mb-1">Desde</label>
				<input id="filter-desde" type="date" bind:value={filterDesde} onchange={applyFilters} class="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors" />
			</div>
			<div>
				<label for="filter-hasta" class="block text-xs font-medium text-text-secondary mb-1">Hasta</label>
				<div class="flex gap-2">
					<input id="filter-hasta" type="date" bind:value={filterHasta} onchange={applyFilters} class="flex-1 rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors" />
					<button onclick={clearFilters} class="px-3 py-2 text-sm text-text-secondary hover:text-text transition-colors" aria-label="Limpiar filtros">
						Limpiar
					</button>
				</div>
			</div>
		</div>
	</div>

	<!-- List -->
	{#if loading}
		<div class="rounded-xl border border-border bg-surface-card shadow-sm">
			{#each [1, 2, 3, 4, 5] as _}
				<div class="flex items-center gap-4 p-4 border-b border-border last:border-b-0">
					<div class="w-2 h-2 rounded-full bg-surface animate-pulse"></div>
					<div class="flex-1 space-y-1">
						<div class="h-4 w-48 bg-surface rounded animate-pulse"></div>
						<div class="h-3 w-24 bg-surface rounded animate-pulse"></div>
					</div>
					<div class="h-5 w-20 bg-surface rounded animate-pulse"></div>
				</div>
			{/each}
		</div>
	{:else if error}
		<div class="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
			<p>{error}</p>
			<button onclick={loadTransactions} class="mt-2 text-sm font-medium underline">Reintentar</button>
		</div>
	{:else if transactions.length === 0}
		<EmptyState
			title="No hay transacciones"
			description="Comienza registrando tu primera transaccion"
			action={() => goto('/transacciones/nueva')}
			actionLabel="Nueva Transaccion"
		/>
	{:else}
		<div class="rounded-xl border border-border bg-surface-card shadow-sm overflow-hidden">
			<div class="hidden md:block">
				<table class="w-full">
					<thead>
						<tr class="border-b border-border bg-surface">
							<th class="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">Fecha</th>
							<th class="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">Descripcion</th>
							<th class="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">Categoria</th>
							<th class="text-right px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">Monto</th>
							<th class="text-right px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">Acciones</th>
						</tr>
					</thead>
					<tbody>
						{#each transactions as tx}
							<tr class="border-b border-border last:border-b-0 hover:bg-surface/50 transition-colors cursor-pointer" onclick={() => goto('/transacciones/' + tx._id)}>
								<td class="px-4 py-3 text-sm text-text-secondary">{formatDate(tx.date)}</td>
								<td class="px-4 py-3">
									<div class="flex items-center gap-2">
										<div class="w-2 h-2 rounded-full shrink-0" class:bg-success={tx.type === 'income'} class:bg-error={tx.type === 'expense'}></div>
										<span class="text-sm font-medium text-text">{tx.description}</span>
									</div>
								</td>
								<td class="px-4 py-3 text-sm text-text-secondary">{tx.category?.name ?? 'Sin categoria'}</td>
								<td class="px-4 py-3 text-right text-sm font-mono font-medium" class:text-success={tx.type === 'income'} class:text-error={tx.type === 'expense'}>
									{tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
								</td>
								<td class="px-4 py-3 text-right">
									<button onclick={(e) => { e.stopPropagation(); deleteTransaction(tx._id); }} class="text-sm text-text-secondary hover:text-error transition-colors" aria-label="Eliminar transaccion">
										Eliminar
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<!-- Mobile cards -->
			<div class="md:hidden divide-y divide-border">
				{#each transactions as tx}
					<button onclick={() => goto('/transacciones/' + tx._id)} class="w-full text-left p-4 hover:bg-surface/50 transition-colors">
						<div class="flex justify-between items-start mb-1">
							<span class="text-sm font-medium text-text">{tx.description}</span>
							<span class="text-sm font-mono font-medium" class:text-success={tx.type === 'income'} class:text-error={tx.type === 'expense'}>
								{tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
							</span>
						</div>
						<div class="flex items-center gap-2 text-xs text-text-secondary">
							<span>{formatDate(tx.date)}</span>
							<span>&middot;</span>
							<span>{tx.category?.name ?? 'Sin categoria'}</span>
						</div>
					</button>
				{/each}
			</div>
		</div>

		<div class="flex items-center justify-between mt-4">
			<p class="text-sm text-text-secondary">{total} transaccion{total !== 1 ? 'es' : ''}</p>
			<Pagination {page} {totalPages} onPageChange={onPageChange} />
		</div>
	{/if}
</div>
