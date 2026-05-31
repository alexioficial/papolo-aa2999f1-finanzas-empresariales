import mongoose from 'mongoose';
import { MONGODB_URI } from './env';

let cachedConnection: typeof mongoose | null = null;

export async function connectDB() {
	if (cachedConnection) return cachedConnection;
	if (!MONGODB_URI) {
		throw new Error('MONGODB_URI no esta configurada');
	}
	cachedConnection = await mongoose.connect(MONGODB_URI);
	console.log('Conectado a MongoDB');
	return cachedConnection;
}

export async function getDB() {
	return connectDB();
}
