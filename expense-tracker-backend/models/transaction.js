const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    date: { type: Date, required: [true, 'Please add a date'] },
    description: { type: String, trim: true, default: '' },
    category: { type: String, required: [true, 'Please add a category'] },
    type: { type: String, enum: ['income', 'expense'], required: true },
    isRecurring: { type: Boolean, default: false },
    amount: { type: Number, required: [true, 'Please add an amount'], min: [0.01, 'Amount must be greater than zero'] },
  },
  { timestamps: true }
);

transactionSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);