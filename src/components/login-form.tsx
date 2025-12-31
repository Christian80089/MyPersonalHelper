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
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { 
  BarChart3, 
  Database, 
  Shield, 
  TrendingUp,
  LayoutDashboard 
} from 'lucide-react'

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const DEBUG_MODE = process.env.NEXT_PUBLIC_DEBUG_MODE === 'false' ? false : true
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      if (DEBUG_MODE) {
        console.log('INIZIO LOGIN - Email:', email)
        console.log('Password length:', password.length)
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (DEBUG_MODE) {
      console.log('SUPABASE LOGIN RESPONSE:')
      console.log('   - DATA:', data)
      console.log('   - ERROR:', error)
      console.log('   - DATA.USER:', data?.user)
      console.log('   - DATA.SESSION:', data?.session)
      } 

      if (error) {
        if (DEBUG_MODE) {
          console.log('ERRORE LOGIN:', error.message)
        }
        throw error
      }

      if (DEBUG_MODE) {
        console.log('LOGIN OK - Redirect homepage...')
      }
      router.push('/protected/admin')
    } catch (error: unknown) {
      if (DEBUG_MODE) {
        console.error('CATCH LOGIN ERROR:', error)
      }
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
      if (DEBUG_MODE) {
        console.log('FINE LOGIN')
      }
    }
  }

  return (
    <div className={cn(
      // ✅ CONTAINER RESPONSIVE PERFETTO
      "w-full h-full bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 relative overflow-hidden",
      "flex flex-col lg:flex-row",
      "items-center justify-center",
      "gap-4 md:gap-6 lg:gap-12 xl:gap-16",
      "px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-8 md:py-12 lg:py-16",
      className
    )} {...props}>
      
      {/* ✅ BACKGROUND BLUR RESPONSIVE */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-20 -right-20 w-32 h-32 xs:w-40 xs:h-40 sm:w-48 sm:h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 xl:w-[500px] xl:h-[500px] bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-indigo-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -left-20 w-32 h-32 xs:w-40 xs:h-40 sm:w-48 sm:h-48 md:w-64 md:h-64 lg:w-72 lg:h-72 xl:w-[400px] xl:h-[400px] bg-gradient-to-r from-emerald-500/15 to-cyan-500/15 rounded-full blur-3xl animation-delay-1000" />
      </div>

      {/* ✅ FORM - SEMPRE PRIMO E CENTRATO */}
      <div className="w-full flex-1 flex items-center justify-center p-4 md:p-6 lg:p-8 xl:p-12 order-1 lg:order-none">
        <div className="w-full max-w-sm sm:max-w-md md:max-w-md lg:max-w-md xl:max-w-lg">
          <Card className="border-0 bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardHeader className="text-center pb-6 md:pb-8 px-4 sm:px-6 md:px-8">
              <CardTitle className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold mb-3 leading-tight">
                Sign in
              </CardTitle>
              <CardDescription className="text-sm sm:text-base md:text-base">
                Access your account
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-6 sm:p-7 md:p-8 lg:p-10 space-y-4 sm:space-y-5 md:space-y-6">
              <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4 md:space-y-5">
                
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

                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-semibold">
                      Password
                    </Label>
                    <Link
                      href="/auth/forgot-password"
                      className="text-xs sm:text-sm font-medium transition-colors hover:underline underline-offset-2"
                    >
                      Forgot password?
                    </Link>
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
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-slate-400/50 dark:hover:bg-white/20 hover:backdrop-blur-sm active:bg-slate-600/60 dark:active:bg-white/40 transition-all duration-200 rounded-lg cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-white/10 text-center">
                <p className="text-xs sm:text-sm">
                  Don&apos;t have an account?{' '}
                  <Link 
                    href="/auth/sign-up" 
                    className="font-semibold hover:text-blue-800 transition-colors underline underline-offset-2"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ✅ SIDEBAR - SOLO DESKTOP GRANDI (lg+) */}
      <div className="hidden lg:flex lg:w-1/2 lg:max-w-xl xl:max-w-2xl flex-col h-full items-start justify-center gap-6 px-6 lg:px-8 xl:px-12 2xl:px-16 order-2">
        <div className="flex items-center gap-3 mb-6 lg:mb-8 w-full max-w-md">
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl flex-shrink-0">
            <LayoutDashboard className="h-5 w-5 lg:h-6 lg:w-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg lg:text-2xl xl:text-3xl font-bold leading-tight truncate">
              My Personal Helper
            </h1>
            <p className="text-xs lg:text-sm font-medium">Analytics Platform</p>
          </div>
        </div>

        <div className="space-y-2 lg:space-y-3 w-full max-w-md lg:max-w-lg xl:max-w-xl">
          {[
            { icon: BarChart3, title: "Interactive Dashboards", desc: "Visualizza dati in tempo reale" },
            { icon: Database, title: "Centralized Data", desc: "Tutti i tuoi dati in un unico posto" },
            { icon: TrendingUp, title: "Advanced Analytics", desc: "Insight potenti per il business" },
            { icon: Shield, title: "Secure Storage", desc: "Dati protetti con crittografia" }
          ].map(({ icon: Icon, title, desc }, i) => (
            <div key={i} className="group flex items-start gap-3 p-3 lg:p-4 hover:bg-white/5 rounded-xl lg:rounded-2xl transition-all duration-300 hover:pl-2 lg:hover:pl-4 hover:shadow-xl border border-white/10 w-full">
              <div className="w-9 h-9 lg:w-10 lg:h-10 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg lg:rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-300 mt-0.5">
                <Icon className="h-4 w-4 lg:h-5 lg:w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm lg:text-base line-clamp-1 group-hover:text-blue-800">{title}</h3>
                <p className="text-xs lg:text-sm mt-0.5 line-clamp-2">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
