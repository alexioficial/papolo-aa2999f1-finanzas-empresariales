import mongoose, { Schema, type Document } from 'mongoose';

export interface ICategory extends Document {
	_id: mongoose.Types.ObjectId;
	name: string;
	type: 'income' | 'expense' | 'both';
	description?: string;
	color?: string;
	isDefault: boolean;
	active: boolean;
	createdBy?: mongoose.Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
	{
		name: { type: String, required: true, unique: true, trim: true },
		type: { type: String, enum: ['income', 'expense', 'both'], default: 'both' },
		description: { type: String },
		color: { type: String },
		isDefault: { type: Boolean, default: false },
		active: { type: Boolean, default: true },
		createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
	},
	{ timestamps: true }
);

CategorySchema.index({ name: 1 }, { unique: true });
CategorySchema.index({ type: 1 });
CategorySchema.index({ active: 1 });

export const Category = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
