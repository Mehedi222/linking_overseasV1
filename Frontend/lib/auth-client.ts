import { createAuthClient } from 'better-auth/react'
import { usernameClient } from 'better-auth/client/plugins'

// Routed through the Next.js rewrite proxy (see next.config.ts) so the browser calls
// its own origin — the Backend's Better Auth instance is what actually handles it.
export const authClient = createAuthClient({
  baseURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/backend`,
  plugins: [usernameClient()],
})

export const { signIn, signOut, useSession } = authClient
