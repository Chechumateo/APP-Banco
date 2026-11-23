export const ACCOUNT_TYPES = [
  { value: 'corriente', label: 'Cuenta corriente' },
  { value: 'ahorro', label: 'Ahorro' },
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'efectivo', label: 'Efectivo' },
] as const

export const CATEGORIES: Record<'ingreso' | 'gasto', string[]> = {
  ingreso: ['Nómina', 'Freelance', 'Inversiones', 'Regalos', 'Otros ingresos'],
  gasto: [
    'Vivienda',
    'Comida',
    'Transporte',
    'Ocio',
    'Salud',
    'Suministros',
    'Compras',
    'Educación',
    'Otros gastos',
  ],
}

export type Account = {
  id: number
  name: string
  type: string
  balance: number
}

export type Transaction = {
  id: number
  accountId: number
  kind: 'ingreso' | 'gasto'
  amount: number
  category: string
  description: string
  date: string
}

const currency = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
})

export function formatMoney(value: number) {
  return currency.format(value)
}

export function accountTypeLabel(value: string) {
  return ACCOUNT_TYPES.find((t) => t.value === value)?.label ?? value
}
