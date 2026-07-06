import 'server-only'
import { headers } from 'next/headers'

type ApiServerOptions = RequestInit & { next?: { revalidate?: number | false; tags?: string[] } }

export async function apiServer<T>(path: string, options: ApiServerOptions = {}): Promise<T> {
  const incomingHeaders = await headers()
  const cookie = incomingHeaders.get('cookie') ?? ''

  const res = await fetch(`${process.env.BACKEND_INTERNAL_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      cookie,
      ...options.headers,
    },
  })

  const body = await res.json()

  if (!res.ok || !body.success) {
    throw new Error(body.message ?? 'Something went wrong.')
  }

  return body.data as T
}

export default apiServer
