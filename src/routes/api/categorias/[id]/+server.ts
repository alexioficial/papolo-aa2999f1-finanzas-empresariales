import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAdmin } from '$lib/server/auth';
import { getDB } from '$lib/server/db';
import { Category } from '$lib/server/models/Category';
import { Transaction } from '$lib/server/models/Transaction';

export const PUT: RequestHandler = async ({ params, request, locals }) => {
	requireAdmin(locals);
	await getDB();

	const category = await Category.findById(params.id);
	if (!category) {
		return json({ ok: false, error: 'Categoria no encontrada' }, { status: 404 });
	}

	try {
		const body = await request.json();
		const { name, type, description, color } = body;

		const errors: Record<string, string> = {};
		if (name !== undefined && !name.trim()) errors.name = 'Nombre requerido';
		if (type && !['income', 'expense', 'both'].includes(type)) errors.type = 'Tipo invalido';

		if (Object.keys(errors).length > 0) {
			return json({ ok: false, errors }, { status: 400 });
		}

		// Verificar unicidad si cambio el nombre
		if (name && name.trim() !== category.name) {
			const existing = await Category.findOne({ name: name.trim(), _id: { $ne: params.id } });
			if (existing) {
				return json({ ok: false, errors: { name: 'Ya existe una categoria con ese nombre' } }, { status: 400 });
			}
		}

		const update: Record<string, unknown> = {};
		if (name !== undefined) update.name = name.trim();
		if (type) update.type = type;
		if (description !== undefined) update.description = description?.trim();
		if (color !== undefined) update.color = color || undefined;

		await Category.updateOne({ _id: params.id }, { $set: update });

		const updated = await Category.findById(params.id).lean();
		return json({ ok: true, category: updated });
	} catch (err) {
		console.error('Error updating category:', err);
		return json({ ok: false, error: 'Error al actualizar la categoria' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	requireAdmin(locals);
	await getDB();

	const category = await Category.findById(params.id);
	if (!category) {
		return json({ ok: false, error: 'Categoria no encontrada' }, { status: 404 });
	}

	// Verificar si hay transacciones asociadas
	const txCount = await Transaction.countDocuments({ category: params.id });
	if (txCount > 0) {
		// Soft-delete: desactivar en vez de eliminar
		await Category.updateOne({ _id: params.id }, { $set: { active: false } });
		return json({
			ok: true,
			softDelete: true,
			message: `Categoria desactivada. ${txCount} transacciones mantienen la referencia.`
		});
	}

	await Category.deleteOne({ _id: params.id });
	return json({ ok: true });
};
