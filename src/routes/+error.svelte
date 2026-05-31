<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="flex min-h-screen items-center justify-center p-8">
	<div class="text-center max-w-md">
		<h1 class="text-6xl font-bold text-primary font-heading">{$page.status}</h1>
		<p class="mt-4 text-xl text-text-secondary">
			{#if $page.status === 404}
				Pagina no encontrada
			{:else if $page.status === 403}
				Acceso denegado
			{:else}
				Error interno del servidor
			{/if}
		</p>
		<p class="mt-2 text-text-secondary">
			{$page.error?.message ?? 'Algo salio mal.'}
		</p>
		<a href="/dashboard" class="mt-6 inline-block rounded-lg bg-primary px-6 py-3 text-white font-medium hover:bg-primary-hover transition-colors">
			Volver al inicio
		</a>
	</div>
</div>
