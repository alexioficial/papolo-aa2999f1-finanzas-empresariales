<script lang="ts">
	import { formatCurrency, formatDate } from '$lib/utils/format';

	let transactions = $state<Array<{
		_id: string; type: string; amount: number;
		description: string; date: string;
		category: { name: string; type: string } | null;
		createdBy: { name: string };
	}>>([]);
	let ingresos = $state(0);
	let egresos = $state(0);
	let balance = $state(0);
	let total = $state(0);
	let loading = $state(false);
	let error = $state('');

	let filterTipo = $state('');
	let filterDesde = $state('');
	let filterHasta = $state('');

	async function loadReport() {
		loading = true;
		error = '';
		try {
			const params = new URLSearchParams();
			if (filterTipo) params.set('tipo', filterTipo);
			if (filterDesde) params.set('desde', filterDesde);
			if (filterHasta) params.set('hasta', filterHasta);

			const res = await fetch('/api/reportes?' + params.toString());
			const json = await res.json();
			if (json.ok) {
				transactions = json.reporte.transactions;
				ingresos = json.reporte.ingresos;
				egresos = json.reporte.egresos;
				balance = json.reporte.balance;
				total = json.reporte.total;
			} else {
				error = json.error || 'Error al cargar reporte';
			}
		} catch {
			error = 'Error de conexion';
		} finally {
			loading = false;
		}
	}

	$effect(() => { loadReport(); });

	function exportCSV() {
		if (transactions.length === 0) return;

		const headers = ['Fecha', 'Tipo', 'Descripcion', 'Categoria', 'Monto', 'Registrado por'];
		const rows = transactions.map(tx => [
			formatDate(tx.date),
			tx.type === 'income' ? 'Ingreso' : 'Egreso',
			`"${tx.description.replace(/"/g, '""')}"`,
			tx.category?.name ?? '',
			tx.amount.toFixed(2),
			tx.createdBy?.name ?? ''
		]);

		const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
		const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `reporte-financiero-${new Date().toISOString().split('T')[0]}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	}
</script>

<div class="max-w-6xl">
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
		<h2 class="text-2xl font-bold font-heading text-text">Reportes</h2>
		<button onclick={exportCSV} disabled={transactions.length === 0} class="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-text hover:bg-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
			Exportar CSV
		</button>
	</div>

	<!-- Filters -->
	<div class="rounded-xl border border-border bg-surface-card p-4 shadow-sm mb-6">
		<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
			<div>
				<label for="rep-tipo" class="block text-xs font-medium text-text-secondary mb-1">Tipo</label>
				<select id="rep-tipo" bind:value={filterTipo} onchange={loadReport} class="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors">
					<option value="">Todos</option>
					<option value="income">Ingresos</option>
					<option value="expense">Egresos</option>
				</select>
			</div>
			<div>
				<label for="rep-desde" class="block text-xs font-medium text-text-secondary mb-1">Desde</label>
				<input id="rep-desde" type="date" bind:value={filterDesde} onchange={loadReport} class="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors" />
			</div>
			<div>
				<label for="rep-hasta" class="block text-xs font-medium text-text-secondary mb-1">Hasta</label>
				<input id="rep-hasta" type="date" bind:value={filterHasta} onchange={loadReport} class="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors" />
			</div>
		</div>
	</div>

	<!-- Summary -->
	{#if !loading && !error}
		<div class="grid grid-cols-3 gap-4 mb-6">
			<div class="rounded-xl border border-border bg-surface-card p-4 shadow-sm text-center">
				<p class="text-xs font-medium text-text-secondary uppercase tracking-wider">Ingresos</p>
				<p class="text-lg font-bold font-mono text-success mt-1">{formatCurrency(ingresos)}</p>
			</div>
			<div class="rounded-xl border border-border bg-surface-card p-4 shadow-sm text-center">
				<p class="text-xs font-medium text-text-secondary uppercase tracking-wider">Egresos</p>
				<p class="text-lg font-bold font-mono text-error mt-1">{formatCurrency(egresos)}</p>
			</div>
			<div class="rounded-xl border border-border bg-surface-card p-4 shadow-sm text-center">
				<p class="text-xs font-medium text-text-secondary uppercase tracking-wider">Balance</p>
				<p class="text-lg font-bold font-mono mt-1" class:text-success={balance >= 0} class:text-error={balance < 0}>{formatCurrency(balance)}</p>
			</div>
		</div>
	{/if}

	<!-- Transactions table -->
	{#if loading}
		<div class="rounded-xl border border-border bg-surface-card shadow-sm">
			{#each [1, 2, 3] as _}
				<div class="flex items-center gap-4 p-4 border-b border-border">
					<div class="flex-1 space-y-1">
						<div class="h-4 w-48 bg-surface rounded animate-pulse"></div>
						<div class="h-3 w-24 bg-surface rounded animate-pulse"></div>
					</div>
					<div class="h-5 w-20 bg-surface rounded animate-pulse"></div>
				</div>
			{/each}
		</div>
	{:else if error}
		<div class="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>
	{:else if transactions.length === 0}
		<div class="rounded-xl border border-dashed border-border p-12 text-center">
			<p class="text-text-secondary">No hay transacciones en el periodo seleccionado</p>
		</div>
	{:else}
		<div class="rounded-xl border border-border bg-surface-card shadow-sm overflow-hidden">
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead>
						<tr class="border-b border-border bg-surface">
							<th class="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">Fecha</th>
							<th class="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">Tipo</th>
							<th class="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">Descripcion</th>
							<th class="text-left px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">Categoria</th>
							<th class="text-right px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">Monto</th>
						</tr>
					</thead>
					<tbody>
						{#each transactions as tx}
							<tr class="border-b border-border last:border-b-0 hover:bg-surface/50 transition-colors">
								<td class="px-4 py-3 text-sm text-text-secondary">{formatDate(tx.date)}</td>
								<td class="px-4 py-3">
									<span class="text-xs px-2 py-0.5 rounded-full font-medium {tx.type === 'income' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}">
										{tx.type === 'income' ? 'Ingreso' : 'Egreso'}
									</span>
								</td>
								<td class="px-4 py-3 text-sm text-text">{tx.description}</td>
								<td class="px-4 py-3 text-sm text-text-secondary">{tx.category?.name ?? '-'}</td>
								<td class="px-4 py-3 text-right text-sm font-mono font-medium" class:text-success={tx.type === 'income'} class:text-error={tx.type === 'expense'}>
									{tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
		<p class="mt-3 text-sm text-text-secondary text-right">{total} transaccion{total !== 1 ? 'es' : ''} en total</p>
	{/if}
</div>
