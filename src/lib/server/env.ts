export const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
	console.warn('MONGODB_URI no configurada — la app no podra conectar a la DB');
}
