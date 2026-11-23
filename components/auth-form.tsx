'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Landmark } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const isSignUp = mode === 'sign-up'

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const email = String(form.get('email'))
    const password = String(form.get('password'))

    const result = isSignUp
      ? await authClient.signUp.email({
          email,
          password,
          name: String(form.get('name')),
        })
      : await authClient.signIn.email({ email, password })

    setLoading(false)
    if (result.error) {
      setError(
        isSignUp
          ? 'No se pudo crear la cuenta. Revisa los datos e inténtalo de nuevo.'
          : 'Correo o contraseña incorrectos.',
      )
      return
    }
    router.push('/')
    router.refresh()
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/40 px-4 py-12">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Landmark className="size-6" aria-hidden="true" />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">
            {isSignUp ? 'Crea tu cuenta' : 'Bienvenido de nuevo'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isSignUp
              ? 'Empieza a controlar tus finanzas en minutos.'
              : 'Accede a tu gestor financiero.'}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-xl border bg-card p-6 shadow-sm"
        >
          {isSignUp && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" name="name" autoComplete="name" required />
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              minLength={8}
              required
            />
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <Button type="submit" disabled={loading} className="mt-2 w-full">
            {loading
              ? 'Procesando...'
              : isSignUp
                ? 'Crear cuenta'
                : 'Iniciar sesión'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {isSignUp ? '¿Ya tienes cuenta? ' : '¿No tienes cuenta? '}
          <Link
            href={isSignUp ? '/sign-in' : '/sign-up'}
            className="font-medium text-foreground underline underline-offset-4"
          >
            {isSignUp ? 'Inicia sesión' : 'Regístrate'}
          </Link>
        </p>
      </div>
    </main>
  )
}
