import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useTheme } from "../context/ThemeContext"

export function DistributionChart({ title, subtitle, data, color }) {
  const { theme } = useTheme()
  const hasValues = data.some((item) => item.count > 0)
  const isDark = theme === "dark"

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-sky-100 transition-colors dark:bg-[#111827] dark:ring-slate-800">
      <h3 className="font-display text-lg font-bold text-[#0f2744] dark:text-white">{title}</h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
      <div className="mt-4 h-64">
        {hasValues ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid stroke={isDark ? "#1e293b" : "#e0f2fe"} vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: isDark ? "#94a3b8" : "#475569", fontSize: 12, fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: isDark ? "#94a3b8" : "#475569", fontSize: 12, fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? "#1e293b" : "#ffffff",
                  borderColor: isDark ? "#334155" : "#e2e8f0",
                  borderRadius: "0.75rem",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  color: isDark ? "#ffffff" : "#0f2744",
                  fontWeight: 600,
                }}
                cursor={{ fill: isDark ? "rgba(255,255,255,0.03)" : "#f0f9ff" }}
              />
              <Bar dataKey="count" fill={color} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-medium text-slate-400 dark:text-slate-500">
            No clinical records in category yet.
          </div>
        )}
      </div>
    </section>
  )
}
