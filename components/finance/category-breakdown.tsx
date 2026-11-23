import { formatMoney, type Transaction } from '@/lib/finance'

export function CategoryBreakdown({
  transactions,
}: {
  transactions: Transaction[]
}) {
  const monthPrefix = new Date().toISOString().slice(0, 7)
  const totals = new Map<string, number>()
  for (const t of transactions) {
    if (t.kind !== 'gasto' || !t.date.startsWith(monthPrefix)) continue
    totals.set(t.category, (totals.get(t.category) ?? 0) + t.amount)
  }
  const rows = [...totals.entries()].sort((a, b) => b[1] - a[1])
  const max = rows[0]?.[1] ?? 0

  return (
    <section className="flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-sm">
      <h2 className="font-semibold">Gastos por categoría</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Sin gastos registrados este mes.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map(([category, amount]) => (
            <li key={category} className="flex flex-col gap-1.5">
              <div className="flex justify-between text-sm">
                <span>{category}</span>
                <span className="font-medium tabular-nums">
                  {formatMoney(amount)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${(amount / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
