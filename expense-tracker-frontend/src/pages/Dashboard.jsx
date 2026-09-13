import { exportTransactionsToCSV } from '../api/exportCsv';
import TrendChart from '../components/TrendChart';
import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import BudgetTracker from '../components/BudgetTracker';
import { useAuth } from '../context/AuthContext';
import SummaryCards from '../components/SummaryCards';
import CategoryChart from '../components/CategoryChart';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({ search: '', type: 'all', startDate: '', endDate: '' });

  const loadTransactions = useCallback(async () => {
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.type !== 'all') params.type = filters.type;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;

    const res = await api.get('/transactions', { params });
    setTransactions(res.data);
  }, [filters]);

  const loadSummary = useCallback(async () => {
    const res = await api.get('/transactions/summary');
    setSummary(res.data);
  }, []);
  const loadTrend = useCallback(async () => {
  const res = await api.get('/transactions/trend');
  setTrend(res.data);
}, []);
  const loadBudgets = useCallback(async () => {
  const res = await api.get('/budgets');
  setBudgets(res.data);
}, []);

const handleSetBudget = async (category, monthlyLimit) => {
  await api.post('/budgets', { category, monthlyLimit });
  await loadBudgets();
};

const handleDeleteBudget = async (id) => {
  await api.delete(`/budgets/${id}`);
  await loadBudgets();
};

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadTransactions(), loadSummary(), loadTrend(), loadBudgets()]);
    setLoading(false);
  }, [loadTransactions, loadSummary]);

  useEffect(() => { loadAll(); }, []);
  useEffect(() => { loadTransactions(); }, [filters]);

  const handleSubmit = async (data, id) => {
    if (id) {
      await api.put(`/transactions/${id}`, data);
    } else {
      await api.post('/transactions', data);
    }
    setEditingTransaction(null);
    await loadAll();
    await loadAll();
    await loadBudgets();
  };

  const handleDelete = async (id) => {
    await api.delete(`/transactions/${id}`);
    await loadAll();
  };

  const clearFilters = () => setFilters({ search: '', type: 'all', startDate: '', endDate: '' });

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;

  return (
    <div className="dashboard">
      <div className="masthead">
        <h1>The Ledger</h1>
        <div>
          <span style={{ marginRight: 12 }}>Hi, {user?.name}</span>
          <button onClick={logout}>Log out</button>
        </div>
      </div>

      <SummaryCards summary={summary} />

      <div className="panel">
        <h2>Where it went</h2>
        <CategoryChart data={summary?.categoryBreakdown} />
      </div>
      <div className="panel">
        <h2>Balance over time</h2>
        <TrendChart data={trend} />
      </div>
      <BudgetTracker budgets={budgets} onSetBudget={handleSetBudget} onDeleteBudget={handleDeleteBudget} />

      <TransactionForm
        onSubmit={handleSubmit}
        editingTransaction={editingTransaction}
        onCancelEdit={() => setEditingTransaction(null)}
      />

            <div className="filter-bar">
        <input
          type="text"
          placeholder="Search description..."
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
        />
        <select value={filters.type} onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}>
          <option value="all">All types</option>
          <option value="income">Income only</option>
          <option value="expense">Expense only</option>
        </select>
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
        />
        <span>to</span>
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
        />
        <button type="button" className="btn-ghost" onClick={clearFilters}>Clear</button>
        <button type="button" className="btn-ghost" onClick={() => exportTransactionsToCSV(transactions)}>
          Export CSV
        </button>
      </div>
      <button
        type="button"
        className="btn-ghost"
        style={{ marginBottom: 14 }}
        onClick={async () => {
         const res = await api.post('/transactions/generate-recurring');
         alert(`${res.data.createdCount} recurring transaction(s) added for this month.`);
         await loadAll();
        }}
       >
        Generate this month's recurring entries
       </button>

      <TransactionList transactions={transactions} onEdit={setEditingTransaction} onDelete={handleDelete} />
    </div>
  );
}