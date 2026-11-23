'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { createTransaction } from '@/app/actions/finance'
import { CATEGORIES, type Account } from '@/lib/finance'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/finance/native-select'
import { cn } from '@/lib/utils'

function today() {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 10)
}

export function TransactionForm({ accounts }: { accounts: Account[] }) {
  const [kind, setKind] = useState<'ingreso' | 'gasto'>('gasto')
  const [state, formAction, pending] = useActionState(createTransaction, {})
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.ok) formRef.current?.reset()
  }, [state])

  const disabled = accounts.length === 0

  return (
    <section className="flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold">Nuevo movimiento</h2>
        <div
          role="radiogroup"
          aria-label="Tipo de movimiento"
          className="flex rounded-lg bg-muted p-1"
        >
          {(['gasto', 'ingreso'] as const).map((k) => (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={kind === k}
              onClick={() => setKind(k)}
              className={cn(
                'rounded-md px-3 py-1 text-sm font-medium transition-colors',
                kind === k
                  ? 'bg-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {k === 'gasto' ? 'Gasto' : 'Ingreso'}
            </button>
          ))}
        </div>
      </div>

      {disabled ? (
        <p className="text-sm text-muted-foreground">
          Crea una cuenta para poder registrar movimientos.
        </p>
      ) : (
        <form
          ref={formRef}
          action={formAction}
          className="flex flex-col gap-4"
        >
          <input type="hidden" name="kind" value={kind} />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="tx-amount">Importe (EUR)</Label>
              <Input
                id="tx-amount"
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                inputMode="decimal"
                placeholder="0,00"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="tx-account">Cuenta</Label>
              <NativeSelect id="tx-account" name="accountId" required>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="tx-category">Categoría</Label>
              <NativeSelect
                key={kind}
                id="tx-category"
                name="category"
                required
              >
                {CATEGORIES[kind].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="tx-date">Fecha</Label>
              <Input
                id="tx-date"
                name="date"
                type="date"
                defaultValue={today()}
                required
              />
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="tx-desc">Descripción (opcional)</Label>
              <Input
                id="tx-desc"
                name="description"
                maxLength={140}
                placeholder="Ej. Compra semanal"
              />
            </div>
            <Button type="submit" disabled={pending} className="sm:w-40">
              {pending ? 'Guardando...' : 'Añadir'}
            </Button>
          </div>
          {state.error && (
            <p role="alert" className="text-sm text-destructive">
              {state.error}
            </p>
          )}
        </form>
      )}
    </section>
  )
}
