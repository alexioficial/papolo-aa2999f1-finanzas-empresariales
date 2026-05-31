import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDB } from '$lib/server/db';
import { User } from '$lib/server/models/User';
import { Category } from '$lib/server/models/Category';
import { Transaction } from '$lib/server/models/Transaction';
import mongoose from 'mongoose';

export const GET: RequestHandler = async () => {
	try {
		await getDB();

		const collections = await mongoose.connection.db.listCollections().toArray();
		const colNames = collections.map(c => c.name);

		const userCount = await User.countDocuments({});
		const catCount = await Category.countDocuments({});
		const txCount = await Transaction.countDocuments({});

		let catTest = 'N/A';
		try {
			const cats = await Category.find({}).lean();
			catTest = `found ${cats.length} cats, first: ${cats[0]?.name}`;
		} catch (e: unknown) {
			catTest = (e as Error).message;
		}

		let txTest = 'N/A';
		try {
			const txs = await Transaction.find({}).populate('category').lean();
			txTest = `found ${txs.length} txs`;
		} catch (e: unknown) {
			txTest = (e as Error).message;
		}

		let aggTest = 'N/A';
		try {
			const agg = await Transaction.aggregate([
				{ $match: { type: 'income' } },
				{ $group: { _id: null, total: { $sum: '$amount' } } }
			]);
			aggTest = `agg result: ${JSON.stringify(agg)}`;
		} catch (e: unknown) {
			aggTest = (e as Error).message;
		}

		return json({
			ok: true,
			collections: colNames,
			counts: { users: userCount, categories: catCount, transactions: txCount },
			tests: { catTest, txTest, aggTest },
			nodeEnv: process.env.NODE_ENV
		});
	} catch (err) {
		return json({ ok: false, error: String(err) }, { status: 500 });
	}
};
