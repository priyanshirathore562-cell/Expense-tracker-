const asyncHandler = require('express-async-handler');
const Budget = require('../models/budget');
const Transaction = require('../models/transaction');

// @desc  Get all budgets for the user, with this month's spending against each
// @route GET /api/budgets
const getBudgets = asyncHandler(async (req, res) => {
  const budgets = await Budget.find({ user: req.user._id });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const thisMonthTransactions = await Transaction.find({
    user: req.user._id,
    type: 'expense',
    date: { $gte: startOfMonth },
  });

  const spentByCategory = {};
  thisMonthTransactions.forEach((t) => {
    spentByCategory[t.category] = (spentByCategory[t.category] || 0) + t.amount;
  });

  const result = budgets.map((b) => {
    const spent = spentByCategory[b.category] || 0;
    return {
      _id: b._id,
      category: b.category,
      monthlyLimit: b.monthlyLimit,
      spent,
      remaining: b.monthlyLimit - spent,
      percentUsed: Math.min(100, Math.round((spent / b.monthlyLimit) * 100)),
      isOverBudget: spent > b.monthlyLimit,
    };
  });

  res.json(result);
});

// @desc  Create or update a budget for a category (upsert)
// @route POST /api/budgets
const setBudget = asyncHandler(async (req, res) => {
  const { category, monthlyLimit } = req.body;

  if (!category || !monthlyLimit || monthlyLimit <= 0) {
    res.status(400);
    throw new Error('Please provide a category and a positive monthly limit');
  }

  const budget = await Budget.findOneAndUpdate(
    { user: req.user._id, category },
    { monthlyLimit },
    { new: true, upsert: true, runValidators: true }
  );

  res.status(201).json(budget);
});

// @desc  Delete a budget
// @route DELETE /api/budgets/:id
const deleteBudget = asyncHandler(async (req, res) => {
  const budget = await Budget.findById(req.params.id);

  if (!budget) {
    res.status(404);
    throw new Error('Budget not found');
  }
  if (budget.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to delete this budget');
  }

  await budget.deleteOne();
  res.json({ id: req.params.id });
});

module.exports = { getBudgets, setBudget, deleteBudget };