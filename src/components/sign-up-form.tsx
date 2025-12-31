'use client'

import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Mail, Lock, Shield } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function SignUpForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showRepeatPassword, setShowRepeatPassword] = useState(false)
  const DEBUG_MODE = process.env.NEXT_PUBLIC_DEBUG_MODE === 'false' ? false : true
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      if (DEBUG_MODE) {
        console.log('INIZIO SIGNUP - Email:', email)
        console.log('Password length:', password.length)
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/protected/admin`,
        },
      })

      if (DEBUG_MODE) {
        console.log('SUPABASE RESPONSE COMPLETA:')
        console.log('   - DATA:', data)
        console.log('   - ERROR:', error)
        console.log('   - ERROR.MESSAGE:', error?.message)
        console.log('   - ERROR.CODE:', error?.code)
        console.log('   - DATA.USER:', data?.user)
      }

      if (error) {
        if (DEBUG_MODE) {
          console.log('ERRORE RILEVATO - Analisi messaggio:', error.message)
        }
        
        throw error
      }

      if (DEBUG_MODE) {
        console.log('NESSUN ERRORE - Controllo data.user:', !!data?.user)
      }
      
      if (data?.user) {
        if (DEBUG_MODE) console.log('UTENTE CREATO - Redirect in corso...')
        router.push('/auth/sign-up-success')
      } else {
        if (DEBUG_MODE) console.log('Nessun utente creato ma nessun errore - strano!')
        setError('Registrazione completata. Controlla la tua email.')
      }
      
    } catch (err: unknown) {
      if (DEBUG_MODE) console.error('CATCH ERROR:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
      if (DEBUG_MODE) console.log('FINE SIGNUP')
    }
  }

  return (
    <div className={cn(
      // ✅ IDENTICO AL LOGIN
      "w-full h-full bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 relative overflow-hidden",
      "flex flex-col lg:flex-row",
      "items-center justify-center",
      "gap-4 md:gap-6 lg:gap-12 xl:gap-16",
      "px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-8 md:py-12 lg:py-16",
      className
    )} {...props}>
      
      {/* ✅ BACKGROUND BLUR IDENTICO */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-20 -right-20 w-32 h-32 xs:w-40 xs:h-40 sm:w-48 sm:h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 xl:w-[500px] xl:h-[500px] bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-indigo-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -left-20 w-32 h-32 xs:w-40 xs:h-40 sm:w-48 sm:h-48 md:w-64 md:h-64 lg:w-72 lg:h-72 xl:w-[400px] xl:h-[400px] bg-gradient-to-r from-emerald-500/15 to-cyan-500/15 rounded-full blur-3xl animation-delay-1000" />
      </div>

      {/* ✅ FORM - IDENTICO CON 3 CAMPI */}
      <div className="w-full flex-1 flex items-center justify-center p-4 md:p-6 lg:p-8 xl:p-12 order-1 lg:order-none">
        <div className="w-full max-w-sm sm:max-w-md md:max-w-md lg:max-w-md xl:max-w-lg">
          <Card className="border-0 bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardHeader className="text-center pb-6 md:pb-8 px-4 sm:px-6 md:px-8">
              <CardTitle className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold mb-3 leading-tight">
                Create Account
              </CardTitle>
              <CardDescription className="text-sm sm:text-base md:text-base">
                Join us today - it&apos;s free
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-6 sm:p-7 md:p-8 lg:p-10 space-y-4 sm:space-y-5 md:space-y-6">
              <form onSubmit={handleSignUp} className="space-y-3 sm:space-y-4 md:space-y-5">
                
                {/* EMAIL CON MAIL ICON */}
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-sm font-semibold">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 opacity-70" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@company.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 pl-11 pr-4 bg-white/10 backdrop-blur-sm border border-white/20 placeholder-slate-400 focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:border-white/50 transition-all duration-300 hover:border-white/40 rounded-xl"
                    />
                  </div>
                </div>

                {/* PASSWORD CON LOCK + EYE */}
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-semibold">
                      Password
                    </Label>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 opacity-70" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 pl-11 pr-11 bg-white/10 backdrop-blur-sm border border-white/20 placeholder-slate-400 focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:border-white/50 transition-all duration-300 hover:border-white/40 rounded-xl"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-white/20 hover:backdrop-blur-sm active:bg-white/30 transition-all duration-200 rounded-lg cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* REPEAT PASSWORD CON LOCK + EYE */}
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="repeat-password" className="text-sm font-semibold">
                      Repeat Password
                    </Label>
                  </div>
                  <div className="relative">
                    <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 opacity-70" />
                    <Input
                      id="repeat-password"
                      type={showRepeatPassword ? "text" : "password"}
                      required
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                      className="h-12 pl-11 pr-11 bg-white/10 backdrop-blur-sm border border-white/20 placeholder-slate-400 focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:border-white/50 transition-all duration-300 hover:border-white/40 rounded-xl"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-white/20 hover:backdrop-blur-sm active:bg-white/30 transition-all duration-200 rounded-lg cursor-pointer"
                      onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                    >
                      {showRepeatPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3 backdrop-blur-sm">
                    {error}
                  </p>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-white text-slate-900 hover:bg-white/90 font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 text-sm sm:text-base md:text-lg rounded-xl border-0 cursor-pointer"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-white/10 text-center">
                <p className="text-xs sm:text-sm">
                  Already have an account?{' '}
                  <Link 
                    href="/auth/login" 
                    className="font-semibold hover:text-blue-800 transition-colors underline underline-offset-2 cursor-pointer"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  )
}
