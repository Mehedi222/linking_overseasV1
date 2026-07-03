import { createAuthClient } from 'better-auth/react'
import { usernameClient } from 'better-auth/client/plugins'

// Routed through the Next.js rewrite proxy (see next.config.ts, "/api/auth/:path*")
// so the browser calls its own origin — the Backend's Better Auth instance is what
// actually handles it. Kept path-free here: better-auth's client only appends its
// default "/api/auth" base path onto a baseURL that has no path of its own.
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [usernameClient()],
})

export const { signIn, signOut, useSession } = authClient
