import { ChangePasswordForm } from './_components/change-password-form'
import { SiteSettingsForm } from './_components/site-settings-form'
import { getSiteSettings } from '@/services/site-settings.server-services'

export const metadata = { title: 'Settings — Admin' }

export default async function SettingsPage() {
  const settings = await getSiteSettings()

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and site settings</p>
      </div>

      <div className="flex flex-col items-center gap-6">
        <SiteSettingsForm settings={settings} />
        <ChangePasswordForm />
      </div>
    </div>
  )
}
