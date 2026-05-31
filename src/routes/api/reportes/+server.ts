import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAuth } from '$lib/server/auth';
import { getDB } from '$lib/server/db';
import { Transaction } from '$lib/server/models/Transaction';

export const GET: RequestHandler = async ({ url, locals }) => {
	const user = requireAuth(locals);
	await getDB();

	const desde = url.searchParams.get('desde');
	const hasta = url.searchParams.get('hasta');
	const tipo = url.searchParams.get('tipo');

	const filter: Record<string, unknown> = {};
	if (user.role !== 'admin') {
		filter.createdBy = user._id;
	}

	if (tipo && (tipo === 'income' || tipo === 'expense')) {
		filter.type = tipo;
	}

	if (desde || hasta) {
		const dateFilter: Record<string, Date> = {};
		if (desde) dateFilter.$gte = new Date(desde + 'T00:00:00.000Z');
		if (hasta) dateFilter.$lte = new Date(hasta + 'T23:59:59.999Z');
		filter.date = dateFilter;
	}

	const transactions = await Transaction.find(filter)
		.sort({ date: -1 })
		.populate('category', 'name type')
		.populate('createdBy', 'name')
		.lean();

	// Calcular totales
	let ingresos = 0;
	let egresos = 0;
	for (const tx of transactions) {
		if (tx.type === 'income') ingresos += tx.amount;
		else egresos += tx.amount;
	}

	return json({
		ok: true,
		reporte: {
			transactions,
			ingresos,
			egresos,
			balance: ingresos - egresos,
			total: transactions.length
		}
	});
};
