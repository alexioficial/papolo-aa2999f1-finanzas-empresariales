import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAuth } from '$lib/server/auth';
import { getDB } from '$lib/server/db';
import { Transaction } from '$lib/server/models/Transaction';
import { Category } from '$lib/server/models/Category';

export const GET: RequestHandler = async ({ params, locals }) => {
	const user = requireAuth(locals);
	await getDB();

	const transaction = await Transaction.findById(params.id)
		.populate('category', 'name color type')
		.populate('createdBy', 'name email')
		.lean();

	if (!transaction) {
		return json({ ok: false, error: 'Transaccion no encontrada' }, { status: 404 });
	}

	// User solo ve sus transacciones
	if (user.role !== 'admin' && transaction.createdBy?.toString() !== user._id) {
		return json({ ok: false, error: 'No tienes permiso para ver esta transaccion' }, { status: 403 });
	}

	return json({ ok: true, transaction });
};

export const PUT: RequestHandler = async ({ params, request, locals }) => {
	const user = requireAuth(locals);
	await getDB();

	const transaction = await Transaction.findById(params.id);
	if (!transaction) {
		return json({ ok: false, error: 'Transaccion no encontrada' }, { status: 404 });
	}

	// Solo dueño o admin pueden editar
	if (user.role !== 'admin' && transaction.createdBy.toString() !== user._id) {
		return json({ ok: false, error: 'No tienes permiso para editar esta transaccion' }, { status: 403 });
	}

	try {
		const body = await request.json();
		const { type, amount, category, description, date, notes } = body;

		const errors: Record<string, string> = {};
		if (type && !['income', 'expense'].includes(type)) errors.type = 'Tipo invalido';
		if (amount !== undefined && (amount <= 0)) errors.amount = 'El monto debe ser mayor a 0';
		if (description !== undefined && !description.trim()) errors.description = 'Descripcion requerida';

		if (Object.keys(errors).length > 0) {
			return json({ ok: false, errors }, { status: 400 });
		}

		// Verificar categoria si cambio
		if (category) {
			const cat = await Category.findById(category);
			if (!cat || !cat.active) {
				return json({ ok: false, errors: { category: 'Categoria no encontrada' } }, { status: 400 });
			}
		}

		const update: Record<string, unknown> = {};
		if (type) update.type = type;
		if (amount !== undefined) update.amount = parseFloat(amount);
		if (category) update.category = category;
		if (description !== undefined) update.description = description.trim();
		if (date) update.date = new Date(date);
		if (notes !== undefined) update.notes = notes.trim();

		await Transaction.updateOne({ _id: params.id }, { $set: update });

		const updated = await Transaction.findById(params.id)
			.populate('category', 'name color type')
			.lean();

		return json({ ok: true, transaction: updated });
	} catch (err) {
		console.error('Error updating transaction:', err);
		return json({ ok: false, error: 'Error al actualizar la transaccion' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	const user = requireAuth(locals);
	await getDB();

	const transaction = await Transaction.findById(params.id);
	if (!transaction) {
		return json({ ok: false, error: 'Transaccion no encontrada' }, { status: 404 });
	}

	if (user.role !== 'admin' && transaction.createdBy.toString() !== user._id) {
		return json({ ok: false, error: 'No tienes permiso para eliminar esta transaccion' }, { status: 403 });
	}

	await Transaction.deleteOne({ _id: params.id });

	return json({ ok: true });
};
