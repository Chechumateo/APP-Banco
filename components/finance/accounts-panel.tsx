'use client'

import { useActionState, useEffect, useRef, useState, useTransition } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import { createAccount, deleteAccount } from '@/app/actions/finance'
import {
  ACCOUNT_TYPES,
  accountTypeLabel,
  formatMoney,
  type Account,
} from '@/lib/finance'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/finance/native-select'

export function AccountsPanel({ accounts }: { accounts: Account[] }) {
  const [open, setOpen] = useState(accounts.length === 0)
  const [state, formAction, pending] = useActionState(createAccount, {})
  const [deleting, startDelete] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset()
      setOpen(false)
    }
  }, [state])

  return (
    <section className="flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Mis cuentas</h2>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          {open ? <X aria-hidden="true" /> : <Plus aria-hidden="true" />}
          {open ? 'Cancelar' : 'Nueva'}
        </Button>
      </div>

      {open && (
        <form
          ref={formRef}
          action={formAction}
          className="flex flex-col gap-3 rounded-lg bg-muted/60 p-4"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="acc-name">Nombre</Label>
            <Input
              id="acc-name"
              name="name"
              placeholder="Ej. Cuenta nómina"
              maxLength={60}
              required
            />
          </div>
          <div className="flex gap-3">
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="acc-type">Tipo</Label>
              <NativeSelect id="acc-type" name="type" defaultValue="corriente">
                {ACCOUNT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="acc-balance">Saldo inicial</Label>
              <Input
                id="acc-balance"
                name="initialBalance"
                type="number"
                step="0.01"
                inputMode="decimal"
                defaultValue="0"
              />
            </div>
          </div>
          {state.error && (
            <p role="alert" className="text-sm text-destructive">
              {state.error}
            </p>
          )}
          <Button type="submit" disabled={pending}>
            {pending ? 'Guardando...' : 'Crear cuenta'}
          </Button>
        </form>
      )}

      {accounts.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aún no tienes cuentas. Crea la primera para empezar.
        </p>
      ) : (
        <ul className="flex flex-col divide-y">
          {accounts.map((a) => (
            <li
              key={a.id}
              className="group flex items-center justify-between gap-3 py-3"
            >
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">{a.name}</span>
                <span className="text-xs text-muted-foreground">
                  {accountTypeLabel(a.type)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span
                  className={`text-sm font-semibold tabular-nums ${a.balance < 0 ? 'text-destructive' : ''}`}
                >
                  {formatMoney(a.balance)}
                </span>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  disabled={deleting}
                  aria-label={`Eliminar cuenta ${a.name}`}
                  onClick={() => {
                    if (
                      confirm(
                        `¿Eliminar "${a.name}" y todos sus movimientos?`,
                      )
                    )
                      startDelete(() => deleteAccount(a.id))
                  }}
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
