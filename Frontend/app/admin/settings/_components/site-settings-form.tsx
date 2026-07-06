'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { updateSiteSettings } from '@/services/site-settings.services'
import type { ISiteSettings } from '@/services/site-settings.server-services'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

// Every field is a plain, required string (never optional/undefined) — cleared
// optional fields are submitted as '' rather than omitted, so the inferred type
// here matches `UpdateSiteSettingsInput` in site-settings.services.ts exactly.
const siteSettingsSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  shortName: z.string().min(1, 'Short name is required'),
  since: z.string().min(1, 'Since year is required'),
  license: z.string().min(1, 'License is required'),
  description: z.string().min(1, 'Description is required'),
  phone: z.string().min(1, 'Phone is required'),
  phoneAlt: z.string(),
  whatsapp: z.string(),
  email: z.string().email('Enter a valid email address'),
  address: z.string().min(1, 'Address is required'),
  websiteUrl: z.string().url('Enter a valid URL').or(z.literal('')),
  whatsappUrl: z.string().url('Enter a valid URL').or(z.literal('')),
  telegramUrl: z.string().url('Enter a valid URL').or(z.literal('')),
  otherUrl: z.string().url('Enter a valid URL').or(z.literal('')),
})

type SiteSettingsValues = z.infer<typeof siteSettingsSchema>

export function SiteSettingsForm({ settings }: { settings: ISiteSettings }) {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const form = useForm<SiteSettingsValues>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: {
      companyName: settings.companyName,
      shortName: settings.shortName,
      since: settings.since,
      license: settings.license,
      description: settings.description,
      phone: settings.phone,
      phoneAlt: settings.phoneAlt ?? '',
      whatsapp: settings.whatsapp ?? '',
      email: settings.email,
      address: settings.address,
      websiteUrl: settings.websiteUrl ?? '',
      whatsappUrl: settings.whatsappUrl ?? '',
      telegramUrl: settings.telegramUrl ?? '',
      otherUrl: settings.otherUrl ?? '',
    },
  })

  async function onSubmit(values: SiteSettingsValues) {
    setError('')
    setSuccess(false)
    try {
      await updateSiteSettings(values)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Site Information</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">Company Info</h3>
              <FormField control={form.control} name="companyName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="shortName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Name</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField control={form.control} name="since" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Since (Year)</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="license" render={({ field }) => (
                  <FormItem>
                    <FormLabel>BMET License</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Footer Description</FormLabel>
                  <FormControl><Textarea rows={3} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">Contact Info</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="phoneAlt" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (Alt)</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField control={form.control} name="whatsapp" render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp Number</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl><Textarea rows={2} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">Social Links (optional — leave blank to hide the icon)</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField control={form.control} name="websiteUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website URL</FormLabel>
                    <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="whatsappUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp URL</FormLabel>
                    <FormControl><Input placeholder="https://wa.me/..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField control={form.control} name="telegramUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telegram URL</FormLabel>
                    <FormControl><Input placeholder="https://t.me/..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="otherUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Other Link</FormLabel>
                    <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-green-600">Site settings updated successfully.</p>}

            <Button type="submit" className="cursor-pointer" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Saving...' : 'Save Site Information'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
