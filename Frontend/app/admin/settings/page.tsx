import { ChangePasswordForm } from './_components/change-password-form'

export const metadata = { title: 'Settings — Admin' }

export default function SettingsPage() {
  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account settings</p>
      </div>

      <div className="flex justify-center">
        <ChangePasswordForm />
      </div>
    </div>
  )
}
