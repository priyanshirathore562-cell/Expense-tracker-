export function exportTransactionsToCSV(transactions) {
  if (!transactions || transactions.length === 0) {
    alert('No transactions to export.');
    return;
  }

  const headers = ['Date', 'Description', 'Category', 'Type', 'Amount'];
  const rows = transactions.map((t) => [
    new Date(t.date).toLocaleDateString('en-IN'),
    (t.description || '').replace(/,/g, ' '),
    t.category,
    t.type,
    t.amount,
  ]);

  const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `expense-tracker-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}