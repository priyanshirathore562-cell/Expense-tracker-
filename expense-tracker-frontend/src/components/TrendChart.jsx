import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function TrendChart({ data }) {
  if (!data || data.length < 2) {
    return <p className="empty-chart">Add more entries to see a trend.</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ left: -10, right: 10 }}>
        <CartesianGrid stroke="#DCE5DA" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 10.5 }} />
        <YAxis tick={{ fontSize: 10.5 }} tickFormatter={(v) => `₹${v}`} width={60} />
        <Tooltip formatter={(v) => `₹${v}`} />
        <Line type="monotone" dataKey="balance" stroke="#A6802E" strokeWidth={2} dot={{ r: 2.5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}