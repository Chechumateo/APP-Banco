'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowDownLeft, ArrowUpRight, Landmark, Plus, Wallet } from 'lucide-react'
import { formatMoney, type Account, type Transaction } from '@/lib/finance'
import { TransactionForm } from '@/components/finance/transaction-form'
import { AccountsPanel } from '@/components/finance/accounts-panel'

const sections = ['Resumen', 'Cuentas', 'Ingresar', 'Retirar', 'Movimientos'] as const

type Section = (typeof sections)[number]

export function DashboardNav({ accounts, transactions }: { accounts: Account[]; transactions: Transaction[] }) {
  const [section, setSection] = useState<Section>('Resumen')
  const total = accounts.reduce((sum, account) => sum + account.balance, 0)

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 md:px-6">
      <nav className="grid grid-cols-2 gap-2 rounded-2xl border bg-card p-2 shadow-sm sm:grid-cols-5" aria-label="Secciones financieras">
        {sections.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setSection(name)}
            className={`rounded-xl px-3 py-3 text-sm font-semibold transition ${section === name ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
          >
            {name}
          </button>
        ))}
      </nav>

      {section === 'Resumen' && (
        <section className="grid gap-4 md:grid-cols-3">
          <button type="button" onClick={() => setSection('Cuentas')} className="flex min-h-44 flex-col justify-between rounded-3xl bg-primary p-6 text-left text-primary-foreground shadow-lg transition hover:-translate-y-1">
            <div className="flex items-center gap-2 text-sm font-medium"><Wallet className="size-5" /> Saldo total</div>
            <div><p className="text-4xl font-bold tabular-nums">{formatMoney(total)}</p><p className="mt-2 text-sm opacity-80">Ver todas las cuentas →</p></div>
          </button>
          <button type="button" onClick={() => setSection('Ingresar')} className="flex min-h-44 flex-col justify-between rounded-3xl border border-primary/20 bg-card p-6 text-left shadow-sm transition hover:-translate-y-1">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"><ArrowDownLeft className="size-6" /></div>
            <div><p className="text-xl font-bold">Ingresar</p><p className="text-sm text-muted-foreground">Añadir dinero a una cuenta</p></div>
          </button>
          <button type="button" onClick={() => setSection('Retirar')} className="flex min-h-44 flex-col justify-between rounded-3xl border border-primary/20 bg-card p-6 text-left shadow-sm transition hover:-translate-y-1">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"><ArrowUpRight className="size-6" /></div>
            <div><p className="text-xl font-bold">Retirar</p><p class="text-sm text-muted-foreground">Registrar una salida de dinero</p></div>
          </button>
        </section>
      )}

      {section === 'Cuentas' && (
        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <AccountsPanel accounts={accounts} />
          <section className="rounded-3xl border bg-card p-6 shadow-sm">
            <h2 class="mb-5 flex items-center gap-2 text-xl font-bold"><Landmark className="size-5 text-primary" /> Todas las cuentas</h2>
            {accounts.length === 0 ? <p className="text-muted-foreground">Todavía no tienes cuentas.</p> : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {accounts.map((account) => (
                  <li key={account.id} className="rounded-2xl border bg-muted/30 p-5"><p className="font-semibold">{account.name}</p><p className="mt-1 text-sm text-muted-foreground">{account.type}</p><p className="mt-5 text-2xl font-bold tabular-nums">{formatMoney(account.balance)}</p></li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

      {(section === 'Ingresar' || section === 'Retirar') && (
        <div className="mx-auto w-full max-w-3xl">
          <TransactionForm accounts={accounts} initialKind={section === 'Ingresar' ? 'ingreso' : 'gasto'} />
        </div>
      )}

      {section === 'Movimientos' && (
        <div className="rounded-3xl border bg-card p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold">Movimientos recientes</h2>
          {transactions.length === 0 ? <p className="text-muted-foreground">No hay movimientos todavía.</p> : (
            <ul className="divide-y">
              {transactions.map((transaction) => (
                <li key={transaction.id} className="flex items-center justify-between gap-4 py-4"><div><p className="font-medium">{transaction.description || transaction.category}</p><p className="text-sm text-muted-foreground">{transaction.category} · {transaction.date}</p></div><p className={`font-bold tabular-nums ${transaction.kind === 'ingreso' ? 'text-positive' : ''}`}>{transaction.kind === 'ingreso' ? '+' : '-'}{formatMoney(transaction.amount)}</p></li>
              ))}
            </ul>
          )}
        </div>
      )}
    </main>
  )
}
