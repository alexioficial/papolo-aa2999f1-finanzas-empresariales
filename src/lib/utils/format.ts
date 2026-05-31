export function formatCurrency(amount: number): string {
	return new Intl.NumberFormat('es-AR', {
		style: 'currency',
		currency: 'ARS',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}).format(amount);
}

export function formatDate(date: Date | string): string {
	const d = typeof date === 'string' ? new Date(date) : date;
	return d.toLocaleDateString('es-AR', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	});
}

export function formatDateInput(date: Date | string): string {
	const d = typeof date === 'string' ? new Date(date) : date;
	return d.toISOString().split('T')[0];
}

export function formatShortDate(date: Date | string): string {
	const d = typeof date === 'string' ? new Date(date) : date;
	return d.toLocaleDateString('es-AR', {
		day: 'numeric',
		month: 'short'
	});
}
