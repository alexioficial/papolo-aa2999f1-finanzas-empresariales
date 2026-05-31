<script lang="ts">
	import EmptyState from '$lib/components/EmptyState.svelte';

	let categories = $state<Array<{ _id: string; name: string; type: string; description?: string; color?: string; isDefault: boolean }>>([]);
	let loading = $state(true);
	let error = $state('');

	// Modal state
	let showModal = $state(false);
	let editingCategory = $state<{ _id: string; name: string; type: string; description?: string; color?: string } | null>(null);
	let formName = $state('');
	let formType = $state('both');
	let formDescription = $state('');
	let formColor = $state('#3b82f6');
	let formErrors = $state<Record<string, string>>({});
	let formLoading = $state(false);

	async function loadCategories() {
		loading = true;
		error = '';
		try {
			const res = await fetch('/api/categorias');
			const json = await res.json();
			if (json.ok) categories = json.categories;
			else error = json.error || 'Error al cargar';
		} catch { error = 'Error de conexion'; }
		finally { loading = false; }
	}

	$effect(() => { loadCategories(); });

	function openCreate() {
		editingCategory = null;
		formName = '';
		formType = 'both';
		formDescription = '';
		formColor = '#3b82f6';
		formErrors = {};
		showModal = true;
	}

	function openEdit(cat: typeof categories[0]) {
		editingCategory = cat;
		formName = cat.name;
		formType = cat.type;
		formDescription = cat.description ?? '';
		formColor = cat.color ?? '#3b82f6';
		formErrors = {};
		showModal = true;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		formErrors = {};
		formLoading = true;

		try {
			const url = editingCategory ? `/api/categorias/${editingCategory._id}` : '/api/categorias';
			const method = editingCategory ? 'PUT' : 'POST';

			const res = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: formName.trim(),
					type: formType,
					description: formDescription.trim() || undefined,
					color: formColor || undefined
				})
			});
			const json = await res.json();
			if (json.ok) {
				showModal = false;
				loadCategories();
			} else if (json.errors) {
				formErrors = json.errors;
			} else {
				formErrors = { general: json.error || 'Error al guardar' };
			}
		} catch {
			formErrors = { general: 'Error de conexion' };
		} finally {
			formLoading = false;
		}
	}

	async function deleteCategory(id: string, name: string) {
		if (!confirm(`¿Desactivar categoria "${name}"? Las transacciones asociadas no se perderan.`)) return;
		try {
			const res = await fetch(`/api/categorias/${id}`, { method: 'DELETE' });
			const json = await res.json();
			if (json.ok) loadCategories();
		} catch {}
	}

	const typeLabels: Record<string, string> = { income: 'Ingreso', expense: 'Egreso', both: 'Ambos' };

	const typeColors: Record<string, string> = { income: 'bg-success/10 text-success', expense: 'bg-error/10 text-error', both: 'bg-primary/10 text-primary' };

	function closeModal() {
		showModal = false;
	}
</script>

<div class="max-w-4xl">
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
		<h2 class="text-2xl font-bold font-heading text-text">Categorias</h2>
		<button onclick={openCreate} class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors">
			Nueva Categoria
		</button>
	</div>

	{#if loading}
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each [1, 2, 3] as _}
				<div class="rounded-xl border border-border bg-surface-card p-6 shadow-sm">
					<div class="h-5 w-32 bg-surface rounded animate-pulse mb-3"></div>
					<div class="h-4 w-20 bg-surface rounded animate-pulse"></div>
				</div>
			{/each}
		</div>
	{:else if error}
		<div class="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>
	{:else if categories.length === 0}
		<EmptyState title="Sin categorias" description="Crea categorias para organizar tus transacciones" action={openCreate} actionLabel="Crear Categoria" />
	{:else}
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each categories as cat}
				<div class="rounded-xl border border-border bg-surface-card p-5 shadow-sm hover:shadow-md transition-shadow">
					<div class="flex items-start justify-between mb-3">
						<div class="flex items-center gap-2">
							<div class="w-3 h-3 rounded-full" style="background-color: {cat.color || '#6b7280'}"></div>
							<h3 class="font-medium text-text">{cat.name}</h3>
						</div>
						<span class="text-xs px-2 py-0.5 rounded-full font-medium {typeColors[cat.type] || 'bg-surface text-text-secondary'}">
							{typeLabels[cat.type] || cat.type}
						</span>
					</div>
					{#if cat.description}
						<p class="text-sm text-text-secondary mb-3">{cat.description}</p>
					{/if}
					<div class="flex gap-2 mt-auto pt-2 border-t border-border">
						<button onclick={() => openEdit(cat)} class="text-xs text-text-secondary hover:text-text transition-colors">Editar</button>
						<button onclick={() => deleteCategory(cat._id, cat.name)} class="text-xs text-text-secondary hover:text-error transition-colors">Desactivar</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Modal -->
{#if showModal}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onclick={closeModal} role="presentation">
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div class="w-full max-w-md rounded-xl border border-border bg-surface-card p-6 shadow-lg" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="modal-title">
			<h3 id="modal-title" class="text-lg font-semibold font-heading text-text mb-4">
				{editingCategory ? 'Editar Categoria' : 'Nueva Categoria'}
			</h3>

			<form onsubmit={handleSubmit} class="space-y-4">
				{#if formErrors.general}
					<div role="alert" class="rounded-lg bg-error/10 p-3 text-sm text-error">{formErrors.general}</div>
				{/if}

				<div>
					<label for="cat-name" class="block text-sm font-medium text-text-secondary mb-1">Nombre *</label>
					<input id="cat-name" type="text" bind:value={formName} required class="w-full rounded-lg border px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors {formErrors.name ? 'border-red-400' : 'border-border'}" />
					{#if formErrors.name}<p class="mt-1 text-sm text-error">{formErrors.name}</p>{/if}
				</div>

				<div>
					<label for="cat-type" class="block text-sm font-medium text-text-secondary mb-1">Tipo</label>
					<select id="cat-type" bind:value={formType} class="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors">
						<option value="both">Ambos</option>
						<option value="income">Ingreso</option>
						<option value="expense">Egreso</option>
					</select>
				</div>

				<div>
					<label for="cat-desc" class="block text-sm font-medium text-text-secondary mb-1">Descripcion</label>
					<input id="cat-desc" type="text" bind:value={formDescription} class="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors" />
				</div>

				<div>
					<label for="cat-color" class="block text-sm font-medium text-text-secondary mb-1">Color</label>
					<div class="flex items-center gap-3">
						<input id="cat-color" type="color" bind:value={formColor} class="h-9 w-9 rounded-lg border border-border cursor-pointer" />
						<span class="text-sm text-text-secondary">{formColor}</span>
					</div>
				</div>

				<div class="flex gap-3 pt-2">
					<button type="submit" disabled={formLoading} class="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50 transition-colors">
						{formLoading ? 'Guardando...' : editingCategory ? 'Guardar Cambios' : 'Crear Categoria'}
					</button>
					<button type="button" onclick={closeModal} class="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface transition-colors">
						Cancelar
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
