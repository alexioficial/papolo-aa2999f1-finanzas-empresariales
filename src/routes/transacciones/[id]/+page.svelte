<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { formatCurrency, formatDate } from '$lib/utils/format';
	import { formatDateInput } from '$lib/utils/format';

	const id = $derived($page.params.id);

	let transaction = $state<{
		_id: string; type: string; amount: number;
		description: string; date: string; notes?: string;
		category: { _id: string; name: string; color?: string; type: string } | null;
		createdBy: { _id: string; name: string; email: string };
		createdAt: string; updatedAt: string;
	} | null>(null);
	let categories = $state<Array<{ _id: string; name: string; type: string; color?: string }>>([]);
	let loading = $state(true);
	let error = $state('');
	let editing = $state(false);

	// Edit form state
	let editType = $state('expense');
	let editAmount = $state('');
	let editCategory = $state('');
	let editDescription = $state('');
	let editDate = $state('');
	let editNotes = $state('');
	let editErrors = $state<Record<string, string>>({});
	let editLoading = $state(false);

	async function loadTransaction() {
		loading = true;
		error = '';
		try {
			const res = await fetch('/api/transacciones/' + id);
			const json = await res.json();
			if (json.ok) {
				transaction = json.transaction;
				editType = json.transaction.type;
				editAmount = String(json.transaction.amount);
				editCategory = json.transaction.category?._id ?? '';
				editDescription = json.transaction.description;
				editDate = formatDateInput(json.transaction.date);
				editNotes = json.transaction.notes ?? '';
			} else {
				error = json.error || 'Transaccion no encontrada';
			}
		} catch {
			error = 'Error de conexion';
		} finally {
			loading = false;
		}
	}

	async function loadCategories() {
		try {
			const res = await fetch('/api/categorias');
			const json = await res.json();
			if (json.ok) categories = json.categories;
		} catch {}
	}

	$effect(() => {
		loadTransaction();
		loadCategories();
	});

	async function handleEdit(e: Event) {
		e.preventDefault();
		editErrors = {};
		editLoading = true;
		try {
			const res = await fetch('/api/transacciones/' + id, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					type: editType,
					amount: parseFloat(editAmount),
					category: editCategory,
					description: editDescription.trim(),
					date: editDate,
					notes: editNotes.trim() || undefined
				})
			});
			const json = await res.json();
			if (json.ok) {
				transaction = json.transaction;
				editing = false;
			} else if (json.errors) {
				editErrors = json.errors;
			} else {
				editErrors = { general: json.error || 'Error al actualizar' };
			}
		} catch {
			editErrors = { general: 'Error de conexion' };
		} finally {
			editLoading = false;
		}
	}

	async function deleteTransaction() {
		if (!confirm('¿Eliminar esta transaccion permanentemente?')) return;
		try {
			const res = await fetch('/api/transacciones/' + id, { method: 'DELETE' });
			const json = await res.json();
			if (json.ok) goto('/transacciones');
		} catch {}
	}
</script>

<div class="max-w-2xl">
	<button onclick={() => goto('/transacciones')} class="text-sm text-text-secondary hover:text-text transition-colors mb-6 block">&larr; Volver a transacciones</button>

	{#if loading}
		<div class="rounded-xl border border-border bg-surface-card p-6 shadow-sm space-y-4">
			<div class="h-6 w-48 bg-surface rounded animate-pulse"></div>
			<div class="h-4 w-full bg-surface rounded animate-pulse"></div>
			<div class="h-4 w-3/4 bg-surface rounded animate-pulse"></div>
		</div>
	{:else if error}
		<div class="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
			<p>{error}</p>
		</div>
	{:else if transaction}
		{#if editing}
			<!-- Edit form -->
			<h2 class="text-2xl font-bold font-heading text-text mb-6">Editar Transaccion</h2>
			<form onsubmit={handleEdit} class="rounded-xl border border-border bg-surface-card p-6 shadow-sm space-y-5">
				{#if editErrors.general}
					<div role="alert" class="rounded-lg bg-error/10 p-3 text-sm text-error">{editErrors.general}</div>
				{/if}
				<div>
					<label class="block text-sm font-medium text-text-secondary mb-2">Tipo</label>
					<div class="flex rounded-lg border border-border overflow-hidden">
						<button type="button" onclick={() => editType = 'income'} class={editType === 'income' ? 'flex-1 px-4 py-2 text-sm font-medium bg-success text-white' : 'flex-1 px-4 py-2 text-sm font-medium bg-white text-text-secondary hover:bg-surface'}>Ingreso</button>
						<button type="button" onclick={() => editType = 'expense'} class={editType === 'expense' ? 'flex-1 px-4 py-2 text-sm font-medium bg-error text-white' : 'flex-1 px-4 py-2 text-sm font-medium bg-white text-text-secondary hover:bg-surface'}>Egreso</button>
					</div>
				</div>
				<div>
					<label for="edit-amount" class="block text-sm font-medium text-text-secondary mb-1">Monto *</label>
					<input id="edit-amount" type="number" step="0.01" min="0.01" bind:value={editAmount} required class={'w-full rounded-lg border px-3 py-2.5 text-lg font-mono focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors ' + (editErrors.amount ? 'border-red-400' : 'border-border')} />
					{#if editErrors.amount}<p class="mt-1 text-sm text-error">{editErrors.amount}</p>{/if}
				</div>
				<div>
					<label for="edit-category" class="block text-sm font-medium text-text-secondary mb-1">Categoria *</label>
					<select id="edit-category" bind:value={editCategory} required class={'w-full rounded-lg border px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors ' + (editErrors.category ? 'border-red-400' : 'border-border')}>
						<option value="">Seleccionar...</option>
						{#each categories as cat}
							<option value={cat._id}>{cat.name}</option>
						{/each}
					</select>
					{#if editErrors.category}<p class="mt-1 text-sm text-error">{editErrors.category}</p>{/if}
				</div>
				<div>
					<label for="edit-desc" class="block text-sm font-medium text-text-secondary mb-1">Descripcion *</label>
					<input id="edit-desc" type="text" bind:value={editDescription} required class={'w-full rounded-lg border px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors ' + (editErrors.description ? 'border-red-400' : 'border-border')} />
					{#if editErrors.description}<p class="mt-1 text-sm text-error">{editErrors.description}</p>{/if}
				</div>
				<div>
					<label for="edit-date" class="block text-sm font-medium text-text-secondary mb-1">Fecha</label>
					<input id="edit-date" type="date" bind:value={editDate} class="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors" />
				</div>
				<div>
					<label for="edit-notes" class="block text-sm font-medium text-text-secondary mb-1">Notas</label>
					<textarea id="edit-notes" bind:value={editNotes} rows={3} class="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors resize-none"></textarea>
				</div>
				<div class="flex gap-3">
					<button type="submit" disabled={editLoading} class="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50 transition-colors">
						{editLoading ? 'Guardando...' : 'Guardar Cambios'}
					</button>
					<button type="button" onclick={() => editing = false} class="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface transition-colors">
						Cancelar
					</button>
				</div>
			</form>
		{:else}
			<!-- Detail view -->
			<div class="rounded-xl border border-border bg-surface-card p-6 shadow-sm">
				<div class="flex items-start justify-between mb-6">
					<div>
						<div class="flex items-center gap-2 mb-1">
							<div class="w-3 h-3 rounded-full" class:bg-success={transaction.type === 'income'} class:bg-error={transaction.type === 'expense'}></div>
							<span class="text-sm font-medium text-text-secondary uppercase">{transaction.type === 'income' ? 'Ingreso' : 'Egreso'}</span>
						</div>
						<h2 class="text-xl font-bold font-heading text-text">{transaction.description}</h2>
					</div>
					<p class="text-2xl font-bold font-mono" class:text-success={transaction.type === 'income'} class:text-error={transaction.type === 'expense'}>
						{transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
					</p>
				</div>

				<div class="grid grid-cols-2 gap-4 text-sm border-t border-border pt-4">
					<div>
						<p class="text-text-secondary">Fecha</p>
						<p class="font-medium text-text">{formatDate(transaction.date)}</p>
					</div>
					<div>
						<p class="text-text-secondary">Categoria</p>
						<p class="font-medium text-text">{transaction.category?.name ?? 'Sin categoria'}</p>
					</div>
					<div>
						<p class="text-text-secondary">Registrado por</p>
						<p class="font-medium text-text">{transaction.createdBy?.name ?? 'N/A'}</p>
					</div>
					<div>
						<p class="text-text-secondary">Creado</p>
						<p class="font-medium text-text">{formatDate(transaction.createdAt)}</p>
					</div>
				</div>

				{#if transaction.notes}
					<div class="border-t border-border pt-4 mt-4">
						<p class="text-sm text-text-secondary mb-1">Notas</p>
						<p class="text-sm text-text">{transaction.notes}</p>
					</div>
				{/if}

				<div class="flex gap-3 border-t border-border pt-4 mt-4">
					<button onclick={() => editing = true} class="rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors">
						Editar
					</button>
					<button onclick={deleteTransaction} class="rounded-lg px-4 py-2 text-sm font-medium text-error hover:bg-error/5 transition-colors">
						Eliminar
					</button>
				</div>
			</div>
		{/if}
	{/if}
</div>
