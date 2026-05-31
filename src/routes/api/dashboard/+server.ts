import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAuth } from '$lib/server/auth';
import { getDB } from '$lib/server/db';
import { Transaction } from '$lib/server/models/Transaction';

export const GET: RequestHandler = async ({ locals }) => {
	const user = requireAuth(locals);
	await getDB();

	// Filtro base
	const filter: Record<string, unknown> = {};
	if (user.role !== 'admin') {
		filter.createdBy = user._id;
	}

	// Totales generales
	const [incomeResult, expenseResult] = await Promise.all([
		Transaction.aggregate([
			{ $match: { ...filter, type: 'income' } },
			{ $group: { _id: null, total: { $sum: '$amount' } } }
		]),
		Transaction.aggregate([
			{ $match: { ...filter, type: 'expense' } },
			{ $group: { _id: null, total: { $sum: '$amount' } } }
		])
	]);

	const ingresosTotal = incomeResult[0]?.total ?? 0;
	const egresosTotal = expenseResult[0]?.total ?? 0;
	const balanceTotal = ingresosTotal - egresosTotal;

	// Totales del mes actual
	const now = new Date();
	const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
	const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

	const monthFilter = { ...filter, date: { $gte: startOfMonth, $lte: endOfMonth } };

	const [incomeMonth, expenseMonth] = await Promise.all([
		Transaction.aggregate([
			{ $match: { ...monthFilter, type: 'income' } },
			{ $group: { _id: null, total: { $sum: '$amount' } } }
		]),
		Transaction.aggregate([
			{ $match: { ...monthFilter, type: 'expense' } },
			{ $group: { _id: null, total: { $sum: '$amount' } } }
		])
	]);

	const ingresosMes = incomeMonth[0]?.total ?? 0;
	const egresosMes = expenseMonth[0]?.total ?? 0;

	// Ultimas 5 transacciones
	const ultimasTransacciones = await Transaction.find(filter)
		.sort({ date: -1, createdAt: -1 })
		.limit(5)
		.populate('category', 'name color type')
		.lean();

	// Ingresos por categoria
	const ingresosPorCategoria = await Transaction.aggregate([
		{ $match: { ...filter, type: 'income' } },
		{ $group: { _id: '$category', total: { $sum: '$amount' } } },
		{ $sort: { total: -1 } },
		{
			$lookup: {
				from: 'categories',
				localField: '_id',
				foreignField: '_id',
				as: 'category'
			}
		},
		{ $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
		{ $project: { total: 1, 'category.name': 1, 'category.color': 1 } }
	]);

	// Egresos por categoria
	const egresosPorCategoria = await Transaction.aggregate([
		{ $match: { ...filter, type: 'expense' } },
		{ $group: { _id: '$category', total: { $sum: '$amount' } } },
		{ $sort: { total: -1 } },
		{
			$lookup: {
				from: 'categories',
				localField: '_id',
				foreignField: '_id',
				as: 'category'
			}
		},
		{ $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
		{ $project: { total: 1, 'category.name': 1, 'category.color': 1 } }
	]);

	return json({
		ok: true,
		dashboard: {
			balanceTotal,
			ingresosTotal,
			egresosTotal,
			ingresosMes,
			egresosMes,
			ultimasTransacciones,
			ingresosPorCategoria,
			egresosPorCategoria
		}
	});
};
