import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

export function DistributionChart({ title, subtitle, data, color }) {
  const hasValues = data.some((item) => item.count > 0)
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-sky-100">
      <h3 className="font-display text-lg font-bold">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      <div className="mt-4 h-64">
        {hasValues ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid stroke="#e0f2fe" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "#475569", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: "#475569", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: "#f0f9ff" }} />
              <Bar dataKey="count" fill={color} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">No stored results to chart yet.</div>
        )}
      </div>
    </section>
  )
}
