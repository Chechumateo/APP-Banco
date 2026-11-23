'use client'

import { useRouter } from 'next/navigation'
import { Landmark, LogOut } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'

export function DashboardHeader({ name }: { name: string }) {
  const router = useRouter()

  async function signOut() {
    await authClient.signOut()
    router.push('/sign-in')
    router.refresh()
  }

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-6">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Landmark className="size-5" aria-hidden="true" />
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-tight">
              Gestor Financiero
            </span>
            <span className="text-xs text-muted-foreground">Hola, {name}</span>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={signOut}>
          <LogOut aria-hidden="true" />
          Cerrar sesión
        </Button>
      </div>
    </header>
  )
}
