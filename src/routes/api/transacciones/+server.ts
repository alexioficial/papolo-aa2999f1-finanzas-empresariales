import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAuth } from '$lib/server/auth';
import { getDB } from '$lib/server/db';
import { Transaction } from '$lib/server/models/Transaction';
import { Category } from '$lib/server/models/Category';

export const GET: RequestHandler = async ({ url, locals }) => {
	const user = requireAuth(locals);
	await getDB();

	const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1'));
	const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') ?? '20')));
	const desde = url.searchParams.get('desde');
	const hasta = url.searchParams.get('hasta');
	const tipo = url.searchParams.get('tipo');
	const categoria = url.searchParams.get('categoria');
	const search = url.searchParams.get('search');

	const filter: Record<string, unknown> = {};

	// Admin ve todo, user solo sus transacciones
	if (user.role !== 'admin') {
		filter.createdBy = user._id;
	}

	if (tipo && (tipo === 'income' || tipo === 'expense')) {
		filter.type = tipo;
	}

	if (categoria) {
		filter.category = categoria;
	}

	if (desde || hasta) {
		const dateFilter: Record<string, Date> = {};
		if (desde) dateFilter.$gte = new Date(desde + 'T00:00:00.000Z');
		if (hasta) dateFilter.$lte = new Date(hasta + 'T23:59:59.999Z');
		filter.date = dateFilter;
	}

	if (search) {
		filter.description = { $regex: search, $options: 'i' };
	}

	const skip = (page - 1) * limit;
	const [items, total] = await Promise.all([
		Transaction.find(filter)
			.sort({ date: -1, createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.populate('category', 'name color type')
			.populate('createdBy', 'name email')
			.lean(),
		Transaction.countDocuments(filter)
	]);

	return json({
		ok: true,
		items,
		total,
		page,
		totalPages: Math.ceil(total / limit)
	});
};

export const POST: RequestHandler = async ({ request, locals }) => {
	const user = requireAuth(locals);
	await getDB();

	try {
		const body = await request.json();
		const { type, amount, category, description, date, notes } = body;

		// Validaciones
		const errors: Record<string, string> = {};
		if (!type || !['income', 'expense'].includes(type)) errors.type = 'Tipo invalido';
		if (!amount || amount <= 0) errors.amount = 'El monto debe ser mayor a 0';
		if (!category) errors.category = 'Categoria requerida';
		if (!description || !description.trim()) errors.description = 'Descripcion requerida';

		if (Object.keys(errors).length > 0) {
			return json({ ok: false, errors }, { status: 400 });
		}

		// Verificar que la categoria existe
		const cat = await Category.findById(category);
		if (!cat || !cat.active) {
			return json({ ok: false, errors: { category: 'Categoria no encontrada' } }, { status: 400 });
		}

		const transaction = await Transaction.create({
			type,
			amount: parseFloat(amount),
			category,
			description: description.trim(),
			date: date ? new Date(date) : new Date(),
			notes: notes?.trim(),
			createdBy: user._id
		});

		const populated = await Transaction.findById(transaction._id)
			.populate('category', 'name color type')
			.lean();

		return json({ ok: true, transaction: populated }, { status: 201 });
	} catch (err) {
		console.error('Error creating transaction:', err);
		return json({ ok: false, error: 'Error al crear la transaccion' }, { status: 500 });
	}
};
