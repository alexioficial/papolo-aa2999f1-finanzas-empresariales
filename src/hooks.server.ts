import { validateSession, deleteSession } from '$lib/server/auth';
import type { Handle, HandleServerError } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get('session');

	if (sessionId) {
		const user = await validateSession(sessionId);
		if (user) {
			event.locals.user = user;
		} else {
			// Sesion invalida o expirada
			event.cookies.set('session', '', { path: '/', maxAge: 0, httpOnly: true, sameSite: 'lax' });
		}
	} else {
		event.locals.user = null;
	}

	const response = await resolve(event);
	return response;
};

export const handleError: HandleServerError = ({ error: err }) => {
	console.error('Server error:', err);
	return {
		message: 'Error interno del servidor'
	};
};
