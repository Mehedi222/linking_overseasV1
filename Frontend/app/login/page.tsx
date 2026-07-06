import type { Metadata } from 'next'
import { LoginForm } from './_components/login-form'
import { getSiteSettings } from '@/services/site-settings.server-services'

export const metadata: Metadata = { title: 'Staff Login — Linking Overseas' }

export default async function LoginPage() {
  const settings = await getSiteSettings()

  return (
    <div className="animate-fade-in flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 px-4 py-12">
      <LoginForm companyName={settings.companyName} />
    </div>
  )
}
