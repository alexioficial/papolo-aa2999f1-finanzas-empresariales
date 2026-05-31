import 'dotenv/config';
import mongoose from 'mongoose';
import { hashPassword } from '../src/lib/server/auth.js';
import { User } from '../src/lib/server/models/User.js';
import { Category } from '../src/lib/server/models/Category.js';
import { Transaction } from '../src/lib/server/models/Transaction.js';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
	console.error('MONGODB_URI no configurada');
	process.exit(1);
}

async function seed() {
	console.log('Conectando a MongoDB...');
	await mongoose.connect(MONGODB_URI);
	console.log('Conectado.');

	// Crear admin
	const adminPassword = hashPassword('admin123');
	const admin = await User.findOneAndUpdate(
		{ email: 'admin@empresa.com' },
		{ email: 'admin@empresa.com', passwordHash: adminPassword, name: 'Admin', role: 'admin', active: true },
		{ upsert: true, new: true }
	);
	console.log(`Admin creado: admin@empresa.com / admin123 (${admin._id})`);

	// Crear user de prueba
	const userPassword = hashPassword('user123');
	const user = await User.findOneAndUpdate(
		{ email: 'user@empresa.com' },
		{ email: 'user@empresa.com', passwordHash: userPassword, name: 'Usuario Demo', role: 'user', active: true },
		{ upsert: true, new: true }
	);
	console.log(`User creado: user@empresa.com / user123 (${user._id})`);

	// Crear categorias base
	const categoriesData = [
		{ name: 'Ventas', type: 'income', color: '#22c55e', description: 'Ingresos por ventas de productos o servicios' },
		{ name: 'Salarios', type: 'expense', color: '#ef4444', description: 'Pagos de salarios y sueldos' },
		{ name: 'Alquiler', type: 'expense', color: '#f59e0b', description: 'Pago de alquiler de oficinas o locales' },
		{ name: 'Marketing', type: 'expense', color: '#8b5cf6', description: 'Gastos de publicidad y marketing' },
		{ name: 'Servicios', type: 'expense', color: '#06b6d4', description: 'Servicios basicos (luz, agua, internet)' },
		{ name: 'Inversiones', type: 'income', color: '#10b981', description: 'Ingresos por inversiones' },
		{ name: 'Otros Ingresos', type: 'income', color: '#6366f1', description: 'Otros ingresos varios' },
		{ name: 'Insumos', type: 'expense', color: '#ec4899', description: 'Compra de insumos y materiales' }
	];

	const categories = [];
	for (const catData of categoriesData) {
		const cat = await Category.findOneAndUpdate(
			{ name: catData.name },
			{ ...catData, isDefault: true, active: true },
			{ upsert: true, new: true }
		);
		categories.push(cat);
	}
	console.log(`${categories.length} categorias creadas.`);

	// Crear transacciones de ejemplo
	const transactionsData = [
		{ type: 'income', amount: 150000, category: categories[0]._id, description: 'Venta desoftware - Cliente A', date: new Date('2025-05-15'), createdBy: admin._id },
		{ type: 'income', amount: 85000, category: categories[0]._id, description: 'Venta de consultoria - Cliente B', date: new Date('2025-05-20'), createdBy: admin._id },
		{ type: 'expense', amount: 45000, category: categories[1]._id, description: 'Salario empleado 1', date: new Date('2025-05-05'), createdBy: admin._id },
		{ type: 'expense', amount: 35000, category: categories[1]._id, description: 'Salario empleado 2', date: new Date('2025-05-05'), createdBy: admin._id },
		{ type: 'expense', amount: 12000, category: categories[2]._id, description: 'Alquiler oficina Mayo', date: new Date('2025-05-01'), createdBy: admin._id },
		{ type: 'expense', amount: 8500, category: categories[3]._id, description: 'Campana Google Ads', date: new Date('2025-05-10'), createdBy: admin._id },
		{ type: 'expense', amount: 3200, category: categories[4]._id, description: 'Factura luz', date: new Date('2025-05-08'), createdBy: admin._id },
		{ type: 'expense', amount: 2500, category: categories[4]._id, description: 'Factura internet', date: new Date('2025-05-08'), createdBy: admin._id },
		{ type: 'income', amount: 50000, category: categories[5]._id, description: 'Rendimiento plazo fijo', date: new Date('2025-05-25'), createdBy: admin._id },
		{ type: 'expense', amount: 15000, category: categories[7]._id, description: 'Compra insumos oficina', date: new Date('2025-05-12'), createdBy: admin._id },
		{ type: 'income', amount: 200000, category: categories[0]._id, description: 'Proyecto Cliente C - adelanto', date: new Date('2025-06-01'), createdBy: admin._id },
		{ type: 'expense', amount: 18000, category: categories[3]._id, description: 'Diseno de sitio web', date: new Date('2025-06-02'), createdBy: admin._id },
	];

	await Transaction.deleteMany({});
	await Transaction.insertMany(transactionsData);
	console.log(`${transactionsData.length} transacciones de ejemplo creadas.`);

	console.log('\nSeed completado exitosamente.');
	await mongoose.disconnect();
}

seed().catch(err => {
	console.error('Error en seed:', err);
	process.exit(1);
});
