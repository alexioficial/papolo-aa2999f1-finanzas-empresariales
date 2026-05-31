<script lang="ts">
	import { formatCurrency, formatDate } from '$lib/utils/format';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import { goto } from '$app/navigation';

	let data = $state<{
		balanceTotal: number;
		ingresosTotal: number;
		egresosTotal: number;
		ingresosMes: number;
		egresosMes: number;
		ultimasTransacciones: Array<{
			_id: string;
			type: string;
			amount: number;
			description: string;
			date: string;
			category: { name: string; color?: string; type: string };
		}>;
		ingresosPorCategoria: Array<{ total: number; category: { name: string; color?: string } }>;
		egresosPorCategoria: Array<{ total: number; category: { name: string; color?: string } }>;
	} | null>(null);

	let loading = $state(true);
	let error = $state('');

	async function loadData() {
		loading = true;
		error = '';
		try {
			const res = await fetch('/api/dashboard');
			const json = await res.json();
			if (json.ok) {
				data = json.dashboard;
			} else {
				error = json.error || 'Error al cargar datos';
			}
		} catch {
			error = 'Error de conexion';
		} finally {
			loading = false;
		}
	}

	$effect(() => { loadData(); });

	function categoryColor(cat: { color?: string; name: string } | null | undefined): string {
		if (cat?.color) return cat.color;
		return '#6b7280';
	}

	const maxCategory = $derived(
		Math.max(
			1,
			...(data?.ingresosPorCategoria ?? []).map(c => c.total),
			...(data?.egresosPorCategoria ?? []).map(c => c.total)
		)
	);
</script>

<div class="max-w-6xl">
	<h2 class="text-2xl font-bold font-heading text-text mb-6">Dashboard</h2>

	{#if loading}
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
			{#each [1, 2, 3] as _}
				<div class="rounded-xl border border-border bg-surface-card p-6 shadow-sm">
					<div class="h-4 w-24 bg-surface rounded animate-pulse mb-3"></div>
					<div class="h-8 w-32 bg-surface rounded animate-pulse"></div>
				</div>
			{/each}
		</div>
	{:else if error}
		<div class="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
			<p>{error}</p>
			<button onclick={loadData} class="mt-2 text-sm font-medium underline">Reintentar</button>
		</div>
	{:else if data}
		<!-- Summary cards -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
			<div class="rounded-xl border border-border bg-surface-card p-6 shadow-sm">
				<p class="text-sm font-medium text-text-secondary mb-1">Balance Total</p>
				<p class="text-3xl font-bold font-mono" class:text-success={data.balanceTotal >= 0} class:text-error={data.balanceTotal < 0}>
					{formatCurrency(data.balanceTotal)}
				</p>
			</div>
			<div class="rounded-xl border border-border bg-surface-card p-6 shadow-sm">
				<p class="text-sm font-medium text-text-secondary mb-1">Ingresos Totales</p>
				<p class="text-3xl font-bold font-mono text-success">{formatCurrency(data.ingresosTotal)}</p>
			</div>
			<div class="rounded-xl border border-border bg-surface-card p-6 shadow-sm">
				<p class="text-sm font-medium text-text-secondary mb-1">Egresos Totales</p>
				<p class="text-3xl font-bold font-mono text-error">{formatCurrency(data.egresosTotal)}</p>
			</div>
		</div>

		<!-- Monthly summary & Recent transactions -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
			<!-- Monthly -->
			<div class="rounded-xl border border-border bg-surface-card p-6 shadow-sm">
				<h3 class="text-base font-semibold font-heading text-text mb-4">Este Mes</h3>
				<div class="space-y-3">
					<div class="flex justify-between items-center">
						<span class="text-sm text-text-secondary">Ingresos</span>
						<span class="text-sm font-mono font-medium text-success">{formatCurrency(data.ingresosMes)}</span>
					</div>
					<div class="flex justify-between items-center">
						<span class="text-sm text-text-secondary">Egresos</span>
						<span class="text-sm font-mono font-medium text-error">{formatCurrency(data.egresosMes)}</span>
					</div>
					<div class="border-t border-border pt-3 flex justify-between items-center">
						<span class="text-sm font-medium text-text">Resultado</span>
						<span class="text-sm font-mono font-bold" class:text-success={data.ingresosMes - data.egresosMes >= 0} class:text-error={data.ingresosMes - data.egresosMes < 0}>
							{formatCurrency(data.ingresosMes - data.egresosMes)}
						</span>
					</div>
				</div>
			</div>

			<!-- Recent transactions -->
			<div class="rounded-xl border border-border bg-surface-card p-6 shadow-sm">
				<div class="flex justify-between items-center mb-4">
					<h3 class="text-base font-semibold font-heading text-text">Ultimas Transacciones</h3>
					<button onclick={() => goto('/transacciones')} class="text-sm text-primary hover:underline">Ver todas</button>
				</div>
				{#if data.ultimasTransacciones.length === 0}
					<EmptyState title="Sin transacciones" description="No hay transacciones registradas aun" action={() => goto('/transacciones/nueva')} actionLabel="Crear primera" />
				{:else}
					<div class="space-y-2">
						{#each data.ultimasTransacciones as tx}
							<button onclick={() => goto('/transacciones/' + tx._id)} class="flex items-center justify-between w-full rounded-lg p-3 hover:bg-surface transition-colors text-left">
								<div class="flex items-center gap-3 min-w-0">
									<div class="shrink-0 w-2 h-2 rounded-full" class:bg-success={tx.type === 'income'} class:bg-error={tx.type === 'expense'}></div>
									<div class="min-w-0">
										<p class="text-sm font-medium text-text truncate">{tx.description}</p>
										<p class="text-xs text-text-secondary">{formatDate(tx.date)} &middot; {tx.category?.name ?? 'Sin categoria'}</p>
									</div>
								</div>
								<span class="shrink-0 text-sm font-mono font-medium" class:text-success={tx.type === 'income'} class:text-error={tx.type === 'expense'}>
									{tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
								</span>
							</button>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<!-- Category breakdowns -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<div class="rounded-xl border border-border bg-surface-card p-6 shadow-sm">
				<h3 class="text-base font-semibold font-heading text-text mb-4">Ingresos por Categoria</h3>
				{#if data.ingresosPorCategoria.length === 0}
					<p class="text-sm text-text-secondary">Sin ingresos registrados</p>
				{:else}
					<div class="space-y-3">
						{#each data.ingresosPorCategoria as item}
							<div>
								<div class="flex justify-between text-sm mb-1">
									<span class="text-text">{item.category?.name ?? 'Sin categoria'}</span>
									<span class="font-mono text-success">{formatCurrency(item.total)}</span>
								</div>
								<div class="h-2 rounded-full bg-surface overflow-hidden">
									<div class="h-full rounded-full transition-all" style="width: {(item.total / maxCategory) * 100}%; background-color: {categoryColor(item.category)}"></div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
			<div class="rounded-xl border border-border bg-surface-card p-6 shadow-sm">
				<h3 class="text-base font-semibold font-heading text-text mb-4">Egresos por Categoria</h3>
				{#if data.egresosPorCategoria.length === 0}
					<p class="text-sm text-text-secondary">Sin egresos registrados</p>
				{:else}
					<div class="space-y-3">
						{#each data.egresosPorCategoria as item}
							<div>
								<div class="flex justify-between text-sm mb-1">
									<span class="text-text">{item.category?.name ?? 'Sin categoria'}</span>
									<span class="font-mono text-error">{formatCurrency(item.total)}</span>
								</div>
								<div class="h-2 rounded-full bg-surface overflow-hidden">
									<div class="h-full rounded-full transition-all" style="width: {(item.total / maxCategory) * 100}%; background-color: {categoryColor(item.category)}"></div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
