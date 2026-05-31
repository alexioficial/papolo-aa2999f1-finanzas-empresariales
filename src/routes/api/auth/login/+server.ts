import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDB } from '$lib/server/db';
import { User } from '$lib/server/models/User';
import { verifyPassword, createSession } from '$lib/server/auth';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const { email, password } = await request.json();

		if (!email || !password) {
			return json({ ok: false, error: 'Email y contrasena requeridos' }, { status: 400 });
		}

		await getDB();
		const user = await User.findOne({ email: email.toLowerCase().trim(), active: true });
		if (!user) {
			return json({ ok: false, error: 'Credenciales invalidas' }, { status: 401 });
		}

		if (!verifyPassword(password, user.passwordHash)) {
			return json({ ok: false, error: 'Credenciales invalidas' }, { status: 401 });
		}

		const { sessionId, expiresAt } = await createSession(user._id.toString());

		cookies.set('session', sessionId, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production',
			expires: expiresAt
		});

		return json({
			ok: true,
			user: {
				_id: user._id.toString(),
				email: user.email,
				name: user.name,
				role: user.role
			}
		});
	} catch (err) {
		console.error('Login error:', err);
		return json({ ok: false, error: 'Error interno del servidor' }, { status: 500 });
	}
};
