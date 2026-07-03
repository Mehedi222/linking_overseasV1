export async function apiClient<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api/backend${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  const body = await res.json()

  if (!res.ok || !body.success) {
    throw new Error(body.message ?? 'Something went wrong.')
  }

  return body.data as T
}

export default apiClient
