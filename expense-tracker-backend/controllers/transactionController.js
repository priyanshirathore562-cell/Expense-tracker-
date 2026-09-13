const asyncHandler = require('express-async-handler');
const Transaction = require('../models/transaction');

const getTransactions = asyncHandler(async (req, res) => {
  const { type, category, search, startDate, endDate } = req.query;
  const filter = { user: req.user._id };

  if (type && type !== 'all') filter.type = type;
  if (category && category !== 'all') filter.category = category;
  if (search) filter.description = { $regex: search, $options: 'i' };
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const transactions = await Transaction.find(filter).sort({ date: -1, createdAt: -1 });
  res.json(transactions);
});

const getSummary = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({ user: req.user._id });

  const income = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const categoryMap = {};
  transactions.filter((t) => t.type === 'expense').forEach((t) => {
    categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
  });

  const categoryBreakdown = Object.entries(categoryMap)
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);

  res.json({ income, expense, balance: income - expense, categoryBreakdown });
});

const createTransaction = asyncHandler(async (req, res) => {
  const { date, description, category, type, amount } = req.body;

  if (!date || !category || !type || amount === undefined) {
    res.status(400);
    throw new Error('Please add date, description, category, type and amount');
  }
  if (!['income', 'expense'].includes(type)) {
    res.status(400);
    throw new Error("Type must be 'income' or 'expense'");
  }
  if (Number(amount) <= 0) {
    res.status(400);
    throw new Error('Amount must be greater than zero');
  }

  const transaction = await Transaction.create({ user: req.user._id, date, description, category, type, amount });
  res.status(201).json(transaction);
});

const updateTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    res.status(404);
    throw new Error('Transaction not found');
  }
  if (transaction.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this transaction');
  }

  const updated = await Transaction.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.json(updated);
});

const deleteTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    res.status(404);
    throw new Error('Transaction not found');
  }
  if (transaction.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to delete this transaction');
  }

  await transaction.deleteOne();
  res.json({ id: req.params.id });
});
const getTrend = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({ user: req.user._id }).sort({ date: 1, createdAt: 1 });

  let running = 0;
  const trend = transactions.map((t) => {
    running += t.type === 'income' ? t.amount : -t.amount;
    return {
      date: new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      balance: running,
    };
  });

  res.json(trend);
});
// @desc  Copy all recurring transactions into the current month (if not already added this month)
// @route POST /api/transactions/generate-recurring
const generateRecurring = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const recurringTemplates = await Transaction.find({ user: req.user._id, isRecurring: true });

  const created = [];
  for (const template of recurringTemplates) {
    const alreadyExists = await Transaction.findOne({
      user: req.user._id,
      description: template.description,
      category: template.category,
      isRecurring: true,
      date: { $gte: startOfMonth },
      _id: { $ne: template._id },
    });

    if (!alreadyExists) {
      const newTxn = await Transaction.create({
        user: req.user._id,
        date: now,
        description: template.description,
        category: template.category,
        type: template.type,
        amount: template.amount,
        isRecurring: true,
      });
      created.push(newTxn);
    }
  }

  res.json({ createdCount: created.length, created });
});
module.exports = { getTransactions, getSummary, getTrend, generateRecurring, createTransaction, updateTransaction, deleteTransaction };