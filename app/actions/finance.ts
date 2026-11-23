'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { bankAccounts, transactions } from '@/lib/db/schema'
import { CATEGORIES, ACCOUNT_TYPES } from '@/lib/finance'
import { and, desc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

export type ActionState = { error?: string; ok?: boolean }

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

function parseAmount(value: FormDataEntryValue | null) {
  const n = Number(String(value ?? '').replace(',', '.'))
  if (!Number.isFinite(n)) return null
  return Math.round(n * 100) / 100
}

export async function getFinanceData() {
  const userId = await getUserId()
  const [accounts, txs] = await Promise.all([
    db
      .select()
      .from(bankAccounts)
      .where(eq(bankAccounts.userId, userId))
      .orderBy(bankAccounts.createdAt),
    db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.date), desc(transactions.id)),
  ])

  const accountsWithBalance = accounts.map((a) => {
    const movement = txs
      .filter((t) => t.accountId === a.id)
      .reduce(
        (sum, t) =>
          sum + (t.kind === 'ingreso' ? Number(t.amount) : -Number(t.amount)),
        0,
      )
    return {
      id: a.id,
      name: a.name,
      type: a.type,
      balance: Number(a.initialBalance) + movement,
    }
  })

  return {
    accounts: accountsWithBalance,
    transactions: txs.map((t) => ({
      id: t.id,
      accountId: t.accountId,
      kind: t.kind as 'ingreso' | 'gasto',
      amount: Number(t.amount),
      category: t.category,
      description: t.description,
      date: String(t.date),
    })),
  }
}

export async function createAccount(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await getUserId()
  const name = String(formData.get('name') ?? '').trim().slice(0, 60)
  const type = String(formData.get('type') ?? '')
  const initialBalance = parseAmount(formData.get('initialBalance') || '0')

  if (!name) return { error: 'Escribe un nombre para la cuenta.' }
  if (!ACCOUNT_TYPES.some((t) => t.value === type))
    return { error: 'Tipo de cuenta no válido.' }
  if (initialBalance === null || Math.abs(initialBalance) > 1_000_000_000)
    return { error: 'Saldo inicial no válido.' }

  await db.insert(bankAccounts).values({
    userId,
    name,
    type,
    initialBalance: initialBalance.toFixed(2),
  })
  revalidatePath('/')
  return { ok: true }
}

export async function deleteAccount(id: number) {
  const userId = await getUserId()
  await db
    .delete(transactions)
    .where(and(eq(transactions.accountId, id), eq(transactions.userId, userId)))
  await db
    .delete(bankAccounts)
    .where(and(eq(bankAccounts.id, id), eq(bankAccounts.userId, userId)))
  revalidatePath('/')
}

export async function createTransaction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await getUserId()
  const accountId = Number(formData.get('accountId'))
  const kind = String(formData.get('kind') ?? '')
  const amount = parseAmount(formData.get('amount'))
  const category = String(formData.get('category') ?? '')
  const description = String(formData.get('description') ?? '')
    .trim()
    .slice(0, 140)
  const dateValue = String(formData.get('date') ?? '')

  if (kind !== 'ingreso' && kind !== 'gasto')
    return { error: 'Tipo de movimiento no válido.' }
  if (amount === null || amount <= 0 || amount > 1_000_000_000)
    return { error: 'El importe debe ser mayor que 0.' }
  if (!CATEGORIES[kind].includes(category))
    return { error: 'Categoría no válida.' }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue))
    return { error: 'Fecha no válida.' }

  const [owned] = await db
    .select({ id: bankAccounts.id })
    .from(bankAccounts)
    .where(and(eq(bankAccounts.id, accountId), eq(bankAccounts.userId, userId)))
  if (!owned) return { error: 'Selecciona una cuenta válida.' }

  await db.insert(transactions).values({
    userId,
    accountId,
    kind,
    amount: amount.toFixed(2),
    category,
    description,
    date: dateValue,
  })
  revalidatePath('/')
  return { ok: true }
}

export async function deleteTransaction(id: number) {
  const userId = await getUserId()
  await db
    .delete(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
  revalidatePath('/')
}
