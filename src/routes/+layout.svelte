<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	let { children, data }: { children: import('svelte').Snippet; data: { user: App.User | null } } = $props();

	let sidebarOpen = $state(false);
</script>

<svelte:head>
	<title>Finanzas Empresariales</title>
	<meta name="description" content="Sistema de gestion de finanzas empresariales" />
</svelte:head>

<a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-4 focus:text-primary">
	Saltar al contenido
</a>

{#if data.user}
	<div class="flex h-screen overflow-hidden">
		<!-- Sidebar mobile overlay -->
		{#if sidebarOpen}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<div
				class="fixed inset-0 z-40 bg-black/30 lg:hidden"
				onclick={() => sidebarOpen = false}
				role="presentation"
			></div>
		{/if}

		<!-- Sidebar -->
		<div class:open={sidebarOpen} class="sidebar">
			<Sidebar user={data.user} onNavigate={() => sidebarOpen = false} />
		</div>

		<!-- Main content -->
		<div class="flex flex-1 flex-col overflow-hidden lg:ml-60">
			<Header user={data.user} onMenuClick={() => sidebarOpen = !sidebarOpen} />
			<main id="main-content" class="flex-1 overflow-y-auto p-4 md:p-8">
				{@render children()}
			</main>
		</div>
	</div>
{:else}
	<main id="main-content">
		{@render children()}
	</main>
{/if}

<style>
	.sidebar {
		position: fixed;
		inset: 0;
		z-index: 50;
		width: 16rem;
		transform: translateX(-100%);
		transition: transform 200ms ease-out;
	}
	@media (prefers-reduced-motion: reduce) {
		.sidebar { transition: none; }
	}
	@media (min-width: 64rem) {
		.sidebar {
			transform: translateX(0);
			position: fixed;
		}
	}
	.sidebar.open {
		transform: translateX(0);
	}
</style>
