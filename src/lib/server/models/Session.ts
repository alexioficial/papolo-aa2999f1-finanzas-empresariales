import mongoose, { Schema, type Document } from 'mongoose';

export interface ISession extends Document {
	_id: mongoose.Types.ObjectId;
	sessionId: string;
	userId: mongoose.Types.ObjectId;
	expiresAt: Date;
	createdAt: Date;
}

const SessionSchema = new Schema<ISession>({
	sessionId: { type: String, required: true, unique: true },
	userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	expiresAt: { type: Date, required: true },
	createdAt: { type: Date, default: Date.now }
});

SessionSchema.index({ sessionId: 1 }, { unique: true });
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Session = mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema);
