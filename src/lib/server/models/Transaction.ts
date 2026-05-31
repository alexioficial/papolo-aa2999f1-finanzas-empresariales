import mongoose, { Schema, type Document } from 'mongoose';

export interface ITransaction extends Document {
	_id: mongoose.Types.ObjectId;
	type: 'income' | 'expense';
	amount: number;
	category: mongoose.Types.ObjectId;
	description: string;
	date: Date;
	createdBy: mongoose.Types.ObjectId;
	notes?: string;
	createdAt: Date;
	updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
	{
		type: { type: String, enum: ['income', 'expense'], required: true },
		amount: { type: Number, required: true, min: 0.01 },
		category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
		description: { type: String, required: true, trim: true, maxlength: 500 },
		date: { type: Date, required: true, default: Date.now },
		createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		notes: { type: String, maxlength: 1000 }
	},
	{ timestamps: true }
);

TransactionSchema.index({ createdBy: 1, date: -1 });
TransactionSchema.index({ category: 1 });
TransactionSchema.index({ date: -1 });

export const Transaction = mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);
