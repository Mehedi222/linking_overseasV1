'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, User, Lock, ShieldCheck, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { authClient } from '@/lib/auth-client'
import { COMPANY } from '@/lib/constants'

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})

type LoginValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '', rememberMe: false },
  })

  async function onSubmit(values: LoginValues) {
    setError('')
    try {
      const { error: signInError } = await authClient.signIn.username({
        username: values.username,
        password: values.password,
        rememberMe: values.rememberMe,
      })

      if (signInError) {
        setError(signInError.message ?? 'Invalid username or password.')
        return
      }

      router.push('/admin/candidates')
      router.refresh()
    } catch (err) {
      console.error('[LoginForm]', err)
      setError('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 shadow-2xl backdrop-blur">
      <div className="flex items-center gap-3 bg-gradient-to-r from-indigo-600/40 to-purple-600/40 px-6 py-6">
        <span className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
          <ShieldCheck className="size-6" />
        </span>
        <div>
          <h1 className="text-lg font-bold text-white">Staff Portal</h1>
          <p className="text-sm text-slate-400">Sign in to continue</p>
        </div>
      </div>

      <div className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField control={form.control} name="username" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-300">Username</FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                    <Input
                      placeholder="Enter your username"
                      className="border-white/10 bg-white/5 pl-9 text-white placeholder:text-slate-500"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-300">Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className="border-white/10 bg-white/5 pl-9 pr-9 text-white placeholder:text-slate-500"
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-slate-500 hover:text-slate-300"
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="flex items-center justify-between text-sm">
              <FormField control={form.control} name="rememberMe" render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="cursor-pointer border-white/20"
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer font-normal text-slate-400">
                      Remember me
                    </FormLabel>
                  </div>
                </FormItem>
              )} />
              <span className="text-slate-500">Forgot password?</span>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <Button
              type="submit"
              className="w-full cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90"
              disabled={form.formState.isSubmitting}
            >
              <LogIn className="size-4" />
              {form.formState.isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </Form>

        <div className="mt-6 border-t border-white/10 pt-4 text-center text-xs text-slate-500">
          {COMPANY.name}
        </div>
      </div>
    </div>
  )
}
