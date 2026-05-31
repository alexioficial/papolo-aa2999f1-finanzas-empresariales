import mongoose, { Schema, type Document } from 'mongoose';

export interface IUser extends Document {
	_id: mongoose.Types.ObjectId;
	email: string;
	passwordHash: string;
	name: string;
	role: 'admin' | 'user';
	active: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
	{
		email: { type: String, required: true, unique: true, lowercase: true, trim: true },
		passwordHash: { type: String, required: true },
		name: { type: String, required: true, trim: true },
		role: { type: String, enum: ['admin', 'user'], default: 'user' },
		active: { type: Boolean, default: true }
	},
	{ timestamps: true }
);

UserSchema.index({ email: 1 }, { unique: true });

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
