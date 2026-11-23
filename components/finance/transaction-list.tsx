'use client'

import { useMemo, useState, useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteTransaction } from '@/app/actions/finance'
import { formatMoney, type Account, type Transaction } from '@/lib/finance'
import { Button } from '@/components/ui/button'
import { NativeSelect } from '@/components/finance/native-select'
import { cn } from '@/lib/utils'

const dateFormat = new Intl.DateTimeFormat('es-ES', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

export function TransactionList({
  accounts,
  transactions,
}: {
  accounts: Account[]
  transactions: Transaction[]
}) {
  const [filter, setFilter] = useState('all')
  const [pending, startTransition] = useTransition()
  const accountNames = useMemo(
    () => new Map(accounts.map((a) => [a.id, a.name])),
    [accounts],
  )

  const visible =
    filter === 'all'
      ? transactions
      : transactions.filter((t) => String(t.accountId) === filter)

  return (
    <section className="flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold">Movimientos</h2>
        <div className="w-48">
          <label htmlFor="tx-filter" className="sr-only">
            Filtrar por cuenta
          </label>
          <NativeSelect
            id="tx-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Todas las cuentas</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No hay movimientos todavía.
        </p>
      ) : (
        <ul className="flex flex-col divide-y">
          {visible.map((t) => (
            <li key={t.id} className="flex items-center gap-3 py-3">
              <span
                aria-hidden="true"
                className={cn(
                  'size-2 shrink-0 rounded-full',
                  t.kind === 'ingreso' ? 'bg-positive' : 'bg-destructive',
                )}
              />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium">
                  {t.description || t.category}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {t.category} · {accountNames.get(t.accountId)} ·{' '}
                  {dateFormat.format(new Date(t.date))}
                </span>
              </div>
              <span
                className={cn(
                  'text-sm font-semibold tabular-nums',
                  t.kind === 'ingreso' ? 'text-positive' : 'text-foreground',
                )}
              >
                {t.kind === 'ingreso' ? '+' : '-'}
                {formatMoney(t.amount)}
              </span>
              <Button
                size="icon-sm"
                variant="ghost"
                disabled={pending}
                aria-label="Eliminar movimiento"
                onClick={() =>
                  startTransition(() => deleteTransaction(t.id))
                }
              >
                <Trash2 aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
