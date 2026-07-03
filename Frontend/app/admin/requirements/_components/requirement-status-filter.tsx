'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const STATUS_OPTIONS = ['NEW', 'CONTACTED', 'CLOSED']

export function RequirementStatusFilter({ current }: { current?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function onChange(value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (!value || value === 'ALL') {
      params.delete('status')
    } else {
      params.set('status', value)
    }
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <Select value={current ?? 'ALL'} onValueChange={onChange}>
      <SelectTrigger className="w-full cursor-pointer sm:w-48">
        <SelectValue placeholder="Filter by status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL" className="cursor-pointer">All Statuses</SelectItem>
        {STATUS_OPTIONS.map((s) => (
          <SelectItem key={s} value={s} className="cursor-pointer">
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
