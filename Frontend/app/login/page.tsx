import type { Metadata } from 'next'
import { LoginForm } from './_components/login-form'

export const metadata: Metadata = { title: 'Staff Login — Linking Overseas' }

export default function LoginPage() {
  return (
    <div className="animate-fade-in flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 px-4 py-12">
      <LoginForm />
    </div>
  )
}
