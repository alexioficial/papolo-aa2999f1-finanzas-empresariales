import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDB } from '$lib/server/db';

export const GET: RequestHandler = async () => {
	try {
		await getDB();
		const dbState = 'connected';
		return json({ ok: true, status: 'healthy', db: dbState });
	} catch (err) {
		return json({ ok: true, status: 'degraded', db: 'disconnected', error: (err as Error).message }, { status: 200 });
	}
};
