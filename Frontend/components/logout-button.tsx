'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'

export function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    try {
      await authClient.signOut()
      router.push('/login')
      router.refresh()
    } catch (err) {
      console.error('[LogoutButton]', err)
    }
  }

  return (
    <Button variant="outline" size="sm" className="cursor-pointer" onClick={handleLogout}>
      <LogOut className="size-4" /> Logout
    </Button>
  )
}
