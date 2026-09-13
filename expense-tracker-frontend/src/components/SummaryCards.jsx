const formatMoney = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

export default function SummaryCards({ summary }) {
  return (
    <div className="summary-row">
      <div className="stamp-card balance">
        <div className="stamp-label">Balance</div>
        <div className="stamp-value">{formatMoney(summary?.balance)}</div>
      </div>
      <div className="stamp-card income">
        <div className="stamp-label">Total income</div>
        <div className="stamp-value credit">{formatMoney(summary?.income)}</div>
      </div>
      <div className="stamp-card expense">
        <div className="stamp-label">Total expense</div>
        <div className="stamp-value debit">{formatMoney(summary?.expense)}</div>
      </div>
    </div>
  );
}