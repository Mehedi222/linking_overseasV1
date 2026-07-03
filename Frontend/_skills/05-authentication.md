# Skill: Authentication

## Stack
Better Auth + Google OAuth

## Two Separate Auth Contexts
| Portal | Login Method | Guard Location |
|---|---|---|
| Admin (staff) | Google OAuth — whitelisted Google accounts | `app/(admin)/layout.tsx` |
| Employer (GCC companies) | Google OAuth — employer account | `app/(employer)/layout.tsx` |
| Public | No auth required | — |

## Auth Guard Pattern (layout.tsx)

```tsx
// app/(admin)/layout.tsx
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) redirect('/admin/login')
  if (session.user.role !== 'admin' && session.user.role !== 'recruiter' &&
      session.user.role !== 'coordinator' && session.user.role !== 'trainer') {
    redirect('/admin/login')
  }

  return <>{children}</>
}
```

```tsx
// app/(employer)/layout.tsx
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function EmployerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) redirect('/employer/login')
  if (!session.user.employerId) redirect('/employer/login')

  return <>{children}</>
}
```

## Better Auth Setup (`lib/auth.ts`)
```ts
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from '@/lib/prisma'

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
})
```

## Auth Route Handler (`app/api/auth/[...all]/route.ts`)
```ts
import { auth } from '@/lib/auth'
import { toNextJsHandler } from 'better-auth/next-js'

export const { GET, POST } = toNextJsHandler(auth)
```

## Getting Session in a Server Component
```tsx
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  // session.user.id, session.user.role, session.user.employerId
}
```

## Staff Roles
`admin` | `recruiter` | `coordinator` | `trainer`

## Rules
- Auth guards live **only** in `layout.tsx` — not in individual page components
- Never check auth in a page directly — the layout handles it
- Never expose session data to client components via props if it contains sensitive fields
- Google OAuth callback URL: `http://localhost:3000/api/auth/callback/google`
