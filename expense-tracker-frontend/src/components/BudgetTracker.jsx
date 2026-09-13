import { useState } from 'react';
import { EXPENSE_CATEGORIES } from '../constants/categories';

const formatMoney = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export default function BudgetTracker({ budgets, onSetBudget, onDeleteBudget }) {
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [limit, setLimit] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!limit || Number(limit) <= 0) return setError('Enter a valid limit');
    try {
      await onSetBudget(category, Number(limit));
      setLimit('');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="panel">
      <h2>Monthly budgets</h2>

      {budgets.length === 0 ? (
        <p className="empty-chart">No budgets set yet.</p>
      ) : (
        <div className="budget-list">
          {budgets.map((b) => (
            <div key={b._id} className="budget-row">
              <div className="budget-row-top">
                <span>{b.category}</span>
                <span className={b.isOverBudget ? 'amount-debit' : ''}>
                  {formatMoney(b.spent)} / {formatMoney(b.monthlyLimit)}
                </span>
                <button className="icon-btn danger" onClick={() => onDeleteBudget(b._id)}>✕</button>
              </div>
              <div className="budget-bar-bg">
                <div
                  className={`budget-bar-fill ${b.isOverBudget ? 'over' : ''}`}
                  style={{ width: `${b.percentUsed}%` }}
                />
              </div>
              {b.isOverBudget && <p className="budget-warning">Over budget by {formatMoney(b.spent - b.monthlyLimit)}</p>}
            </div>
          ))}
        </div>
      )}

      <form className="budget-form" onSubmit={handleSubmit}>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input
          type="number"
          min="1"
          placeholder="Monthly limit (₹)"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
        />
        <button type="submit" className="btn-primary">Set budget</button>
      </form>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}