const formatMoney = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
const formatDate = (iso) => new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export default function TransactionList({ transactions, onEdit, onDelete }) {
  if (transactions.length === 0) {
    return <p className="empty-row">No entries yet.</p>;
  }
  return (
    <table className="ledger">
      <thead>
        <tr><th>Date</th><th>Description</th><th>Category</th><th>Amount</th><th></th></tr>
      </thead>
      <tbody>
        {transactions.map((t) => (
          <tr key={t._id}>
            <td>{formatDate(t.date)}</td>
            <td>{t.description}</td>
            <td>{t.category}</td>
            <td className={t.type === 'income' ? 'amount-credit' : 'amount-debit'}>
              {t.type === 'income' ? '+' : '−'}{formatMoney(t.amount)}
            </td>
            <td>
              <button onClick={() => onEdit(t)}>Edit</button>
              <button onClick={() => onDelete(t._id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}