'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DESTINATIONS } from '@/lib/constants'

export function DestinationFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = searchParams.get('destination') ?? 'ALL'

  function onChange(value: string | null) {
    if (!value || value === 'ALL') {
      router.push('/current-overseas-jobs')
    } else {
      router.push(`/current-overseas-jobs?destination=${value}`)
    }
  }

  return (
    <Select value={current} onValueChange={onChange}>
      <SelectTrigger className="w-full cursor-pointer sm:w-56">
        <SelectValue placeholder="Filter by destination" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL" className="cursor-pointer">All Destinations</SelectItem>
        {DESTINATIONS.map((d) => (
          <SelectItem key={d.value} value={d.value} className="cursor-pointer">
            {d.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
