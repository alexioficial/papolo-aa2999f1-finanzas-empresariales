<script lang="ts">
	import { goto } from '$app/navigation';
	import { formatDateInput } from '$lib/utils/format';

	let type = $state('expense');
	let amount = $state('');
	let category = $state('');
	let description = $state('');
	let date = $state(formatDateInput(new Date()));
	let notes = $state('');

	let categories = $state<Array<{ _id: string; name: string; type: string; color?: string }>>([]);
	let errors = $state<Record<string, string>>({});
	let loading = $state(false);
	let generalError = $state('');

	async function loadCategories() {
		try {
			const res = await fetch('/api/categorias');
			const json = await res.json();
			if (json.ok) {
				categories = json.categories;
				if (categories.length > 0 && !category) category = categories[0]._id;
			}
		} catch {}
	}

	$effect(() => { loadCategories(); });

	async function handleSubmit(e: Event) {
		e.preventDefault();
		errors = {};
		generalError = '';
		loading = true;

		try {
			const res = await fetch('/api/transacciones', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					type,
					amount: parseFloat(amount),
					category,
					description: description.trim(),
					date,
					notes: notes.trim() || undefined
				})
			});
			const json = await res.json();
			if (json.ok) {
				goto('/transacciones');
			} else if (json.errors) {
				errors = json.errors;
			} else {
				generalError = json.error || 'Error al crear transaccion';
			}
		} catch {
			generalError = 'Error de conexion';
		} finally {
			loading = false;
		}
	}
</script>

<div class="max-w-2xl">
	<div class="mb-6">
		<button onclick={() => goto('/transacciones')} class="text-sm text-text-secondary hover:text-text transition-colors">&larr; Volver a transacciones</button>
		<h2 class="text-2xl font-bold font-heading text-text mt-2">Nueva Transaccion</h2>
	</div>

	<form onsubmit={handleSubmit} class="rounded-xl border border-border bg-surface-card p-6 shadow-sm space-y-5">
		{#if generalError}
			<div role="alert" class="rounded-lg bg-error/10 p-3 text-sm text-error">
				{generalError}
			</div>
		{/if}

		<!-- Type toggle -->
		<div>
			<label class="block text-sm font-medium text-text-secondary mb-2">Tipo</label>
			<div class="flex rounded-lg border border-border overflow-hidden">
				<button type="button" onclick={() => type = 'income'} class={type === 'income' ? 'flex-1 px-4 py-2.5 text-sm font-medium bg-success text-white' : 'flex-1 px-4 py-2.5 text-sm font-medium bg-white text-text-secondary hover:bg-surface'}>
					Ingreso
				</button>
				<button type="button" onclick={() => type = 'expense'} class={type === 'expense' ? 'flex-1 px-4 py-2.5 text-sm font-medium bg-error text-white' : 'flex-1 px-4 py-2.5 text-sm font-medium bg-white text-text-secondary hover:bg-surface'}>
					Egreso
				</button>
			</div>
		</div>

		<!-- Amount -->
		<div>
			<label for="amount" class="block text-sm font-medium text-text-secondary mb-1">Monto *</label>
			<div class="relative">
				<span class="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">$</span>
				<input
					id="amount" type="number" step="0.01" min="0.01" bind:value={amount} required
					aria-invalid={!!errors.amount}
					aria-describedby={errors.amount ? 'amount-error' : undefined}
					class={'w-full rounded-lg border px-8 py-2.5 text-lg font-mono focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors ' + (errors.amount ? 'border-red-400' : 'border-border')}
					placeholder="0.00"
				/>
			</div>
			{#if errors.amount}
				<p id="amount-error" role="alert" class="mt-1 text-sm text-error">{errors.amount}</p>
			{/if}
		</div>

		<!-- Category -->
		<div>
			<label for="category" class="block text-sm font-medium text-text-secondary mb-1">Categoria *</label>
			<select
				id="category" bind:value={category} required
				class={'w-full rounded-lg border px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors ' + (errors.category ? 'border-red-400' : 'border-border')}
			>
				<option value="">Seleccionar categoria...</option>
				{#each categories as cat}
					<option value={cat._id}>{cat.name}</option>
				{/each}
			</select>
			{#if errors.category}
				<p id="category-error" role="alert" class="mt-1 text-sm text-error">{errors.category}</p>
			{/if}
		</div>

		<!-- Description -->
		<div>
			<label for="description" class="block text-sm font-medium text-text-secondary mb-1">Descripcion *</label>
			<input
				id="description" type="text" bind:value={description} required maxlength="500"
				class={'w-full rounded-lg border px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors ' + (errors.description ? 'border-red-400' : 'border-border')}
				placeholder="Ej: Venta de productos, Pago de servicios..."
			/>
			{#if errors.description}
				<p id="description-error" role="alert" class="mt-1 text-sm text-error">{errors.description}</p>
			{/if}
		</div>

		<!-- Date -->
		<div>
			<label for="date" class="block text-sm font-medium text-text-secondary mb-1">Fecha</label>
			<input
				id="date" type="date" bind:value={date}
				class="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
			/>
		</div>

		<!-- Notes -->
		<div>
			<label for="notes" class="block text-sm font-medium text-text-secondary mb-1">Notas (opcional)</label>
			<textarea
				id="notes" bind:value={notes} maxlength="1000" rows={3}
				class="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors resize-none"
				placeholder="Notas adicionales..."
			></textarea>
		</div>

		<!-- Submit -->
		<div class="flex gap-3 pt-2">
			<button
				type="submit" disabled={loading}
				class="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-primary-hover active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{loading ? 'Guardando...' : 'Guardar Transaccion'}
			</button>
			<button
				type="button" onclick={() => goto('/transacciones')}
				class="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface transition-colors"
			>
				Cancelar
			</button>
		</div>
	</form>
</div>
