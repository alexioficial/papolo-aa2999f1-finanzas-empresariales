import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { deleteSession } from '$lib/server/auth';

export const POST: RequestHandler = async ({ cookies }) => {
	const sessionId = cookies.get('session');
	if (sessionId) {
		await deleteSession(sessionId);
	}
	cookies.set('session', '', { path: '/', maxAge: 0, httpOnly: true, sameSite: 'lax' });
	return json({ ok: true });
};
