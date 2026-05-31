import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDB } from '$lib/server/db';
import { User } from '$lib/server/models/User';
import { Category } from '$lib/server/models/Category';
import { Transaction } from '$lib/server/models/Transaction';
import { hashPassword } from '$lib/server/auth';

const SEED_TOKEN = process.env.SEED_TOKEN || 'dev-seed-token';

export const POST: RequestHandler = async ({ request }) => {
	const token = request.headers.get('x-seed-token');
	if (token !== SEED_TOKEN) {
		return json({ ok: false, error: 'Token invalido' }, { status: 403 });
	}

	await getDB();

	// Crear usuarios
	const adminPassword = hashPassword('Test1234!');
	const admin = await User.findOneAndUpdate(
		{ email: 'test@papolo.dev' },
		{ email: 'test@papolo.dev', passwordHash: adminPassword, name: 'Test Admin', role: 'admin', active: true },
		{ upsert: true, new: true }
	);

	const userPassword = hashPassword('Test1234!');
	const user = await User.findOneAndUpdate(
		{ email: 'user@papolo.dev' },
		{ email: 'user@papolo.dev', passwordHash: userPassword, name: 'Test User', role: 'user', active: true },
		{ upsert: true, new: true }
	);

	// Crear categorias
	const cats = await Promise.all([
		{ name: 'Ventas', type: 'income', color: '#22c55e', description: 'Ingresos por ventas' },
		{ name: 'Salarios', type: 'expense', color: '#ef4444', description: 'Pagos de salarios' },
		{ name: 'Alquiler', type: 'expense', color: '#f59e0b', description: 'Alquiler oficina' },
		{ name: 'Marketing', type: 'expense', color: '#8b5cf6', description: 'Publicidad y marketing' },
		{ name: 'Servicios', type: 'expense', color: '#06b6d4', description: 'Servicios basicos' }
	].map(c => Category.findOneAndUpdate(
		{ name: c.name },
		{ ...c, isDefault: true, active: true },
		{ upsert: true, new: true }
	)));

	// Crear transacciones de prueba
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
		ok: true,
		seeded: true,
		users: { admin: admin.email, user: user.email },
		categories: cats.length,
		transactions: txCount,
		hint: 'Login with test@papolo.dev / Test1234!'
	});
};
