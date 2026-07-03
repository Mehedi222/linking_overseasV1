# Skill: Forms

## Stack
React Hook Form + Zod v4 + shadcn/ui Form components

## Pattern

### 1. Define schema in `lib/validations.ts`
```ts
import { z } from 'zod'

export const candidateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  email: z.string().email('Enter a valid email'),
  destination: z.enum(['Saudi Arabia', 'UAE', 'Kuwait', 'Oman', 'Qatar', 'Bahrain']),
  jobType: z.string().min(1, 'Select a job type'),
})

export type CandidateFormValues = z.infer<typeof candidateSchema>
```

### 2. Build the form component
```tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { candidateSchema, type CandidateFormValues } from '@/lib/validations'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { submitCandidateCV } from '@/server/actions/candidates.actions'

export function CandidateForm() {
  const form = useForm<CandidateFormValues>({
    resolver: zodResolver(candidateSchema),
    defaultValues: { name: '', phone: '', email: '', destination: 'UAE', jobType: '' },
  })

  async function onSubmit(values: CandidateFormValues) {
    try {
      await submitCandidateCV(values)
      form.reset()
    } catch (error) {
      // show error toast or inline message
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Ahmed Rahman" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="cursor-pointer" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Submitting...' : 'Submit CV'}
        </Button>
      </form>
    </Form>
  )
}
```

## Rules
- Schema lives in `lib/validations.ts` — shared between client form and server action
- Server action re-validates with the same Zod schema (never trust client data)
- Always use shadcn `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`
- Never use raw `<form>`, `<label>`, or `<input>` directly
- Disable submit button while `form.formState.isSubmitting` is true
- Always call `form.reset()` on successful submission

## Server-Side Revalidation (in the action)
```ts
import { candidateSchema } from '@/lib/validations'

export async function submitCandidateCV(data: unknown) {
  const parsed = candidateSchema.safeParse(data)
  if (!parsed.success) throw new Error('Invalid form data.')
  // proceed with parsed.data
}
```
