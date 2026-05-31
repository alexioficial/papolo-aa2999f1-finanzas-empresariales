import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { error, redirect } from '@sveltejs/kit';
import type { Cookies, RequestEvent } from '@sveltejs/kit';
import { getDB } from './db';
import { User } from './models/User';
import { Session } from './models/Session';

const SALT_ROUNDS = 12;
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias

export function hashPassword(password: string): string {
	return bcrypt.hashSync(password, SALT_ROUNDS);
}

export function verifyPassword(password: string, hash: string): boolean {
	return bcrypt.compareSync(password, hash);
}

export async function createSession(userId: string): Promise<{ sessionId: string; expiresAt: Date }> {
	await getDB();
	const sessionId = crypto.randomUUID();
	const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
	await Session.create({ sessionId, userId, expiresAt });
	return { sessionId, expiresAt };
}

export async function validateSession(sessionId: string): Promise<App.User | null> {
	try {
		await getDB();
		const session = await Session.findOne({ sessionId }).populate('userId');
		if (!session) return null;
		if (session.expiresAt < new Date()) {
			await Session.deleteOne({ _id: session._id });
			return null;
		}
		const user = session.userId as unknown as { _id: string; email: string; name: string; role: string };
		if (!user || !user._id) return null;
		// Sliding session: renovar expiracion
		const newExpires = new Date(Date.now() + SESSION_DURATION_MS);
		await Session.updateOne({ _id: session._id }, { $set: { expiresAt: newExpires } });
		return {
			_id: user._id.toString(),
			email: user.email,
			name: user.name,
			role: user.role as 'admin' | 'user'
		};
	} catch {
		return null;
	}
}

export async function deleteSession(sessionId: string): Promise<void> {
	try {
		await getDB();
		await Session.deleteOne({ sessionId });
	} catch {
		// ignorar errores al cerrar sesion
	}
}

export function getSessionCookie(sessionId: string, expiresAt: Date): string {
	const isProd = process.env.NODE_ENV === 'production';
	return `session=${sessionId}; HttpOnly; Path=/; SameSite=Lax; ${
		isProd ? 'Secure; ' : ''
	}Expires=${expiresAt.toUTCString()}`;
}

export function getLogoutCookie(): string {
	return 'session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0';
}

export function requireAuth(event: RequestEvent): App.User {
	if (!event.locals.user) {
		throw redirect(303, '/login');
	}
	return event.locals.user;
}

export function requireAdmin(event: RequestEvent): App.User {
	const user = requireAuth(event);
	if (user.role !== 'admin') {
		throw error(403, 'Acceso denegado — se requieren permisos de administrador');
	}
	return user;
}
