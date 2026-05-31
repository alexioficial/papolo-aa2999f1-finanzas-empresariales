import { validateSession } from '$lib/server/auth';
import type { Handle, HandleServerError } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get('session');

	if (sessionId) {
		const user = await validateSession(sessionId);
		if (user) {
			event.locals.user = user;
		} else {
			event.cookies.set('session', '', { path: '/', maxAge: 0, httpOnly: true, sameSite: 'lax' });
		}
	} else {
		event.locals.user = null;
	}

	const response = await resolve(event);
	return response;
};

export const handleError: HandleServerError = ({ error: err, event }) => {
	console.error('Server error:', err, 'URL:', event.url.pathname);
	const message = err instanceof Error ? err.message : 'Error interno del servidor';
	const stack = err instanceof Error ? err.stack?.split('\n').slice(0, 5).join('\n') : undefined;
	return {
		message,
		stack,
		path: event.url.pathname
	};
};
