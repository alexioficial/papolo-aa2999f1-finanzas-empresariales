import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAuth, requireAdmin } from '$lib/server/auth';
import { getDB } from '$lib/server/db';
import { Category } from '$lib/server/models/Category';

export const GET: RequestHandler = async ({ url, locals }) => {
	requireAuth(locals);
	await getDB();

	const type = url.searchParams.get('type');
	const filter: Record<string, unknown> = { active: true };
	if (type && ['income', 'expense', 'both'].includes(type)) {
		filter.$or = [{ type }, { type: 'both' }];
	}

	const categories = await Category.find(filter).sort({ name: 1 }).lean();
	return json({ ok: true, categories });
};

export const POST: RequestHandler = async ({ request, locals }) => {
	const user = requireAdmin(locals);
	await getDB();

	try {
		const body = await request.json();
		const { name, type, description, color } = body;

		const errors: Record<string, string> = {};
		if (!name || !name.trim()) errors.name = 'Nombre requerido';
		if (type && !['income', 'expense', 'both'].includes(type)) errors.type = 'Tipo invalido';

		if (Object.keys(errors).length > 0) {
			return json({ ok: false, errors }, { status: 400 });
		}

		// Verificar unicidad
		const existing = await Category.findOne({ name: name.trim() });
		if (existing) {
			return json({ ok: false, errors: { name: 'Ya existe una categoria con ese nombre' } }, { status: 400 });
		}

		const category = await Category.create({
			name: name.trim(),
			type: type || 'both',
			description: description?.trim(),
			color: color || undefined,
			createdBy: user._id
		});

		return json({ ok: true, category }, { status: 201 });
	} catch (err) {
		console.error('Error creating category:', err);
		return json({ ok: false, error: 'Error al crear la categoria' }, { status: 500 });
	}
};
