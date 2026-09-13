import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function CategoryChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="empty-chart">No expenses recorded yet.</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
        <CartesianGrid horizontal={false} stroke="#DCE5DA" />
        <XAxis type="number" tick={{ fontSize: 11 }} />
        <YAxis type="category" dataKey="category" width={110} tick={{ fontSize: 11.5 }} />
        <Tooltip formatter={(v) => `₹${v}`} />
        <Bar dataKey="total" fill="#A6802E" radius={[0, 3, 3, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}