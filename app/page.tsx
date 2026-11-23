import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getFinanceData } from '@/app/actions/finance'
import { DashboardHeader } from '@/components/finance/dashboard-header'
import { SummaryCards } from '@/components/finance/summary-cards'
import { AccountsPanel } from '@/components/finance/accounts-panel'
import { TransactionForm } from '@/components/finance/transaction-form'
import { TransactionList } from '@/components/finance/transaction-list'
import { CategoryBreakdown } from '@/components/finance/category-breakdown'

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  const { accounts, transactions } = await getFinanceData()

  return (
    <div className="min-h-svh bg-muted/40">
      <DashboardHeader name={session.user.name} />
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 md:px-6">
        <SummaryCards accounts={accounts} transactions={transactions} />
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex flex-col gap-6 lg:w-[360px] lg:shrink-0">
            <AccountsPanel accounts={accounts} />
            <CategoryBreakdown transactions={transactions} />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <TransactionForm accounts={accounts} />
            <TransactionList accounts={accounts} transactions={transactions} />
          </div>
        </div>
      </main>
    </div>
  )
}
