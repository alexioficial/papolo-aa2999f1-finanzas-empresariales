<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	let { user, onNavigate }: { user: App.User; onNavigate: () => void } = $props();

	const links = $derived(() => {
		const items = [
			{ href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
			{ href: '/transacciones', label: 'Transacciones', icon: 'transactions' },
			{ href: '/reportes', label: 'Reportes', icon: 'reports' }
		];
		if (user.role === 'admin') {
			items.push({ href: '/categorias', label: 'Categorias', icon: 'categories' });
		}
		return items;
	});

	function isActive(href: string) {
		return $page.url.pathname === href || $page.url.pathname.startsWith(href + '/');
	}

	function navigate(href: string) {
		onNavigate();
		goto(href);
	}
</script>

<aside class="flex h-full flex-col border-r border-border bg-surface-card shadow-sm" aria-label="Navegacion principal">
	<div class="flex h-16 items-center gap-2 border-b border-border px-6">
		<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">F</div>
		<span class="text-base font-semibold font-heading text-text">Finanzas</span>
	</div>

	<nav class="flex-1 space-y-1 p-3">
		{#each links() as link}
			<button
				onclick={() => navigate(link.href)}
				class={isActive(link.href) ? 'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm bg-primary/10 text-primary font-medium' : 'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-text-secondary transition-colors hover:bg-surface hover:text-text'}
			>
				{#if link.icon === 'dashboard'}
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
				{:else if link.icon === 'transactions'}
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
				{:else if link.icon === 'reports'}
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
				{:else if link.icon === 'categories'}
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v4H4z"/><path d="M4 10h16v4H4z"/><path d="M4 16h16v4H4z"/></svg>
				{/if}
				{link.label}
			</button>
		{/each}
	</nav>

	<div class="border-t border-border p-3">
		<div class="flex items-center gap-3 rounded-lg px-3 py-2">
			<div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
				{user.name.charAt(0).toUpperCase()}
			</div>
			<div class="text-sm">
				<p class="font-medium text-text">{user.name}</p>
				<p class="text-xs text-text-secondary capitalize">{user.role}</p>
			</div>
		</div>
	</div>
</aside>
