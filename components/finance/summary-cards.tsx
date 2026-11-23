import { ArrowDownRight, ArrowUpRight, Wallet } from 'lucide-react'
import { formatMoney, type Account, type Transaction } from '@/lib/finance'

export function SummaryCards({
  accounts,
  transactions,
}: {
  accounts: Account[]
  transactions: Transaction[]
}) {
  const total = accounts.reduce((s, a) => s + a.balance, 0)
  const monthPrefix = new Date().toISOString().slice(0, 7)
  const monthTxs = transactions.filter((t) => t.date.startsWith(monthPrefix))
  const income = monthTxs
    .filter((t) => t.kind === 'ingreso')
    .reduce((s, t) => s + t.amount, 0)
  const expenses = monthTxs
    .filter((t) => t.kind === 'gasto')
    .reduce((s, t) => s + t.amount, 0)

  return (
    <section
      aria-label="Resumen"
      className="flex flex-col gap-4 md:flex-row"
    >
      <div className="flex flex-1 flex-col gap-3 rounded-xl bg-primary p-6 text-primary-foreground shadow-sm">
        <div className="flex items-center gap-2 text-sm opacity-80">
          <Wallet className="size-4" aria-hidden="true" />
          Saldo total
        </div>
        <p className="text-3xl font-semibold tracking-tight tabular-nums">
          {formatMoney(total)}
        </p>
        <p className="text-xs opacity-70">
          {accounts.length} {accounts.length === 1 ? 'cuenta' : 'cuentas'}
        </p>
      </div>
      <StatCard
        label="Ingresos del mes"
        value={formatMoney(income)}
        icon={<ArrowUpRight className="size-4" aria-hidden="true" />}
        tone="positive"
      />
      <StatCard
        label="Gastos del mes"
        value={formatMoney(expenses)}
        icon={<ArrowDownRight className="size-4" aria-hidden="true" />}
        tone="negative"
      />
    </section>
  )
}

function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string
  value: string
  icon: React.ReactNode
  tone: 'positive' | 'negative'
}) {
  return (
    <div className="flex flex-1 flex-col gap-3 rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span
          className={
            tone === 'positive'
              ? 'flex size-6 items-center justify-center rounded-md bg-positive/10 text-positive'
              : 'flex size-6 items-center justify-center rounded-md bg-destructive/10 text-destructive'
          }
        >
          {icon}
        </span>
        {label}
      </div>
      <p className="text-2xl font-semibold tracking-tight tabular-nums">
        {value}
      </p>
    </div>
  )
}
