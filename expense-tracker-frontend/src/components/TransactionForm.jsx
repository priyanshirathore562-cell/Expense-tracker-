import { useState, useEffect } from 'react';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants/categories';

const todayISO = () => new Date().toISOString().slice(0, 10);
const emptyForm = { date: todayISO(), description: '', category: EXPENSE_CATEGORIES[0], type: 'expense', amount: '', isRecurring: false };

export default function TransactionForm({ onSubmit, editingTransaction, onCancelEdit }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingTransaction) {
      setForm({ ...editingTransaction, date: editingTransaction.date.slice(0, 10), amount: String(editingTransaction.amount) });
    } else {
      setForm(emptyForm);
    }
  }, [editingTransaction]);

  const categoryOptions = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleTypeChange = (type) => {
    setForm((f) => ({ ...f, type, category: type === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.amount || Number(form.amount) <= 0) return setError('Enter a valid amount');
    try {
      await onSubmit({ ...form, amount: Number(form.amount) }, editingTransaction?._id);
      setForm(emptyForm);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <form className="entry-form" onSubmit={handleSubmit}>
      <h3>{editingTransaction ? 'Edit entry' : 'Add new entry'}</h3>
      <div className="form-grid">
        <div className="field">
          <label>Type</label>
          <div className="type-toggle">
            <button type="button" className={form.type === 'expense' ? 'active expense' : ''} onClick={() => handleTypeChange('expense')}>Expense</button>
            <button type="button" className={form.type === 'income' ? 'active income' : ''} onClick={() => handleTypeChange('income')}>Income</button>
          </div>
        </div>
        <div className="field">
          <label>Date</label>
          <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} max={todayISO()} />
        </div>
        <div className="field">
          <label>Category</label>
          <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
            {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Amount (₹)</label>
          <input type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
        </div>
        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label>Description</label>
          <input type="text" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </div>
        {error && <p className="form-error" style={{ gridColumn: '1 / -1' }}>{error}</p>}
        <div className="field" style={{ gridColumn: '1 / -1' }}>
         <label>
          <input
           type="checkbox"
           checked={form.isRecurring || false}
           onChange={(e) => setForm((f) => ({ ...f, isRecurring: e.target.checked }))}
           style={{ marginRight: 6 }}
          />
          This is a recurring transaction (e.g. rent, subscription)
         </label>
        </div>
        <div className="form-actions">
          {editingTransaction && <button type="button" className="btn-ghost" onClick={onCancelEdit}>Cancel</button>}
          <button type="submit" className="btn-primary">{editingTransaction ? 'Save changes' : 'Add entry'}</button>
        </div>
      </div>
    </form>
  );
}