<script lang="ts">
	import { goto } from '$app/navigation';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';
		loading = true;

		try {
			const res = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password })
			});
			const data = await res.json();
			if (data.ok) {
				goto('/dashboard');
			} else {
				error = data.error || 'Credenciales invalidas';
			}
		} catch {
			error = 'Error de conexion';
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center p-4">
	<div class="w-full max-w-sm">
		<div class="rounded-xl border bg-surface-card p-8 shadow-sm">
			<div class="mb-8 text-center">
				<h1 class="text-2xl font-bold font-heading text-text">Finanzas Empresariales</h1>
				<p class="mt-1 text-sm text-text-secondary">Ingresa para gestionar tus finanzas</p>
			</div>

			<form onsubmit={handleSubmit}>
				{#if error}
					<div role="alert" class="mb-4 rounded-lg bg-error/10 p-3 text-sm text-error">
						{error}
					</div>
				{/if}

				<div class="mb-4">
					<label for="email" class="mb-1 block text-sm font-medium text-text-secondary">Email</label>
					<input
						id="email"
						type="email"
						bind:value={email}
						required
						class="block w-full rounded-lg border border-border bg-white px-3 py-2 text-text placeholder:text-text-secondary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
						placeholder="admin@empresa.com"
					/>
				</div>

				<div class="mb-6">
					<label for="password" class="mb-1 block text-sm font-medium text-text-secondary">Contrasena</label>
					<input
						id="password"
						type="password"
						bind:value={password}
						required
						class="block w-full rounded-lg border border-border bg-white px-3 py-2 text-text placeholder:text-text-secondary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
						placeholder="••••••••"
					/>
				</div>

				<button
					type="submit"
					disabled={loading}
					class="w-full rounded-lg bg-primary px-4 py-2.5 text-white font-medium transition-all hover:bg-primary-hover active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{loading ? 'Iniciando sesion...' : 'Iniciar sesion'}
				</button>
			</form>
		</div>
	</div>
</div>
