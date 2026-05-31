import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDB } from '$lib/server/db';
import { User } from '$lib/server/models/User';
import { Category } from '$lib/server/models/Category';
import { Transaction } from '$lib/server/models/Transaction';
import bcrypt from 'bcryptjs';

const SEED_TOKEN = process.env.SEED_TOKEN || 'dev-seed-token';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const token = request.headers.get('x-seed-token');
		if (token !== SEED_TOKEN) {
			return json({ ok: false, error: 'Token invalido' }, { status: 403 });
		}

		await getDB();

		const hash = bcrypt.hashSync('Test1234!', 12);

		const admin = await User.findOneAndUpdate(
			{ email: 'test@papolo.dev' },
			{ email: 'test@papolo.dev', passwordHash: hash, name: 'Test Admin', role: 'admin', active: true },
			{ upsert: true, new: true }
		);

		const user = await User.findOneAndUpdate(
			{ email: 'user@papolo.dev' },
			{ email: 'user@papolo.dev', passwordHash: hash, name: 'Test User', role: 'user', active: true },
			{ upsert: true, new: true }
		);

		const cats = await Promise.all([
			Category.findOneAndUpdate({ name: 'Ventas' }, { name: 'Ventas', type: 'income', color: '#22c55e', description: 'Ingresos por ventas', isDefault: true, active: true }, { upsert: true, new: true }),
			Category.findOneAndUpdate({ name: 'Salarios' }, { name: 'Salarios', type: 'expense', color: '#ef4444', description: 'Pagos de salarios', isDefault: true, active: true }, { upsert: true, new: true }),
			Category.findOneAndUpdate({ name: 'Alquiler' }, { name: 'Alquiler', type: 'expense', color: '#f59e0b', description: 'Alquiler oficina', isDefault: true, active: true }, { upsert: true, new: true }),
			Category.findOneAndUpdate({ name: 'Marketing' }, { name: 'Marketing', type: 'expense', color: '#8b5cf6', description: 'Publicidad y marketing', isDefault: true, active: true }, { upsert: true, new: true }),
			Category.findOneAndUpdate({ name: 'Servicios' }, { name: 'Servicios', type: 'expense', color: '#06b6d4', description: 'Servicios basicos', isDefault: true, active: true }, { upsert: true, new: true })
		]);

		await Transaction.deleteMany({});
		await Transaction.insertMany([
			{ type: 'income', amount: 150000, category: cats[0]._id, description: 'Venta software Cliente A', date: new Date('2025-05-15'), createdBy: admin._id },
			{ type: 'income', amount: 85000, category: cats[0]._id, description: 'Consultoria Cliente B', date: new Date('2025-05-20'), createdBy: admin._id },
			{ type: 'expense', amount: 45000, category: cats[1]._id, description: 'Salario empleado 1', date: new Date('2025-05-05'), createdBy: admin._id },
			{ type: 'expense', amount: 35000, category: cats[1]._id, description: 'Salario empleado 2', date: new Date('2025-05-05'), createdBy: admin._id },
			{ type: 'expense', amount: 12000, category: cats[2]._id, description: 'Alquiler oficina Mayo', date: new Date('2025-05-01'), createdBy: admin._id },
			{ type: 'expense', amount: 8500, category: cats[3]._id, description: 'Campana Google Ads', date: new Date('2025-05-10'), createdBy: admin._id },
			{ type: 'expense', amount: 3200, category: cats[4]._id, description: 'Factura luz', date: new Date('2025-05-08'), createdBy: admin._id },
			{ type: 'expense', amount: 2500, category: cats[4]._id, description: 'Factura internet', date: new Date('2025-05-08'), createdBy: admin._id },
			{ type: 'income', amount: 50000, category: cats[0]._id, description: 'Proyecto especial', date: new Date('2025-05-25'), createdBy: admin._id }
		]);

		const txCount = await Transaction.countDocuments();

		return json({
			ok: true, seeded: true,
			users: { admin: admin.email, user: user.email },
			categories: cats.length,
			transactions: txCount
		});
	} catch (err) {
		console.error('Seed error:', err);
		return json({ ok: false, error: String(err) }, { status: 500 });
	}
};
