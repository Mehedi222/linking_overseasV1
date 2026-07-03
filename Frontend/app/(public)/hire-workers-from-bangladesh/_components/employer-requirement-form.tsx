'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { employerRequirementSchema, type EmployerRequirementValues } from '@/lib/validations'
import { SERVICE_TYPES } from '@/lib/constants'
import { submitEmployerRequirement } from '@/server/actions/employer-requirements.actions'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export function EmployerRequirementForm() {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const form = useForm<EmployerRequirementValues>({
    resolver: zodResolver(employerRequirementSchema),
    defaultValues: {
      fullName: '', phone: '', email: '', companyName: '',
      country: '', city: '', businessType: '', serviceType: '',
      workerType: '', quantity: '', hiringTimeline: '', description: '',
    },
  })

  async function onSubmit(values: EmployerRequirementValues) {
    setError('')
    try {
      await submitEmployerRequirement(values)
      setSubmitted(true)
      form.reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  if (submitted) {
    return (
      <Card className="mx-auto max-w-2xl p-8 text-center">
        <CardContent className="space-y-3 pt-6">
          <div className="text-4xl">✓</div>
          <h2 className="text-xl font-semibold">Requirement Submitted Successfully!</h2>
          <p className="text-muted-foreground">
            Thank you. Our team will review your requirement and contact you within 24 hours.
          </p>
          <Button className="cursor-pointer mt-4" onClick={() => setSubmitted(false)}>
            Submit Another Requirement
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mx-auto max-w-3xl">
      <CardHeader>
        <CardTitle>Submit Clients Requirement</CardTitle>
        <CardDescription>
          Share your project details with us in one clean form. Our team will review your hiring
          requirement quickly and you will be able to track it from the admin panel.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="fullName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl><Input placeholder="Your full name" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone / WhatsApp Number</FormLabel>
                  <FormControl><Input placeholder="+971 5X XXX XXXX" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl><Input placeholder="employer@company.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="companyName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Company / Business Name</FormLabel>
                  <FormControl><Input placeholder="Company name" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="country" render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl><Input placeholder="e.g. Saudi Arabia" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="city" render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl><Input placeholder="e.g. Riyadh" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="businessType" render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Type</FormLabel>
                  <FormControl><Input placeholder="e.g. Construction, Hospitality" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="serviceType" render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Service Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="cursor-pointer w-full">
                        <SelectValue placeholder="Select service type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SERVICE_TYPES.map((s) => (
                        <SelectItem key={s} value={s} className="cursor-pointer">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="workerType" render={({ field }) => (
                <FormItem>
                  <FormLabel>Type of Workers Needed</FormLabel>
                  <FormControl><Input placeholder="Example: Mason, Driver, Housemaid" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="quantity" render={({ field }) => (
                <FormItem>
                  <FormLabel>Required Quantity</FormLabel>
                  <FormControl><Input type="number" min={1} placeholder="e.g. 10" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="hiringTimeline" render={({ field }) => (
              <FormItem>
                <FormLabel>Expected Hiring Timeline</FormLabel>
                <FormControl><Input placeholder="Example: Immediate, Within 30 days" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Describe Your Requirement</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe worker category, salary, duty hours, accommodation, visa status and any special requirement..."
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full cursor-pointer" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Submitting...' : 'Submit Requirement'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
