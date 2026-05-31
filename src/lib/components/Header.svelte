<script lang="ts">
	import { goto } from '$app/navigation';

	let { user, onMenuClick }: { user: App.User; onMenuClick: () => void } = $props();

	async function handleLogout() {
		await fetch('/api/auth/logout', { method: 'POST' });
		goto('/login');
	}

	let showUserMenu = $state(false);
</script>

<header class="flex h-16 items-center justify-between border-b border-border bg-surface-card px-4 md:px-6">
	<div class="flex items-center gap-3">
		<button onclick={onMenuClick} class="lg:hidden rounded-lg p-2 hover:bg-surface transition-colors" aria-label="Abrir menu">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
				<path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
			</svg>
		</button>
		<h1 class="text-lg font-semibold font-heading text-text hidden sm:block">Finanzas Empresariales</h1>
	</div>

	<div class="relative">
		<button
			onclick={() => showUserMenu = !showUserMenu}
			class="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-surface transition-colors"
			aria-haspopup="true"
			aria-expanded={showUserMenu}
		>
			<div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-white">
				{user.name.charAt(0).toUpperCase()}
			</div>
			<span class="text-sm font-medium text-text hidden sm:block">{user.name}</span>
			<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-text-secondary" viewBox="0 0 20 20" fill="currentColor">
				<path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
			</svg>
		</button>

		{#if showUserMenu}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<div class="absolute right-0 top-full z-30 mt-1 w-48 rounded-lg border border-border bg-surface-card p-1 shadow-lg" onclick={() => showUserMenu = false} role="menu">
				<div class="px-3 py-2 text-sm text-text-secondary border-b border-border mb-1">
					{user.email}
					<span class="block text-xs capitalize">{user.role}</span>
				</div>
				<button onclick={handleLogout} class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-error hover:bg-error/5 transition-colors" role="menuitem">
					Cerrar sesion
				</button>
			</div>
		{/if}
	</div>
</header>
