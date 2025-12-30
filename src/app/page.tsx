"use client"
import { createBrowserClient } from '@supabase/ssr'
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User } from '@supabase/supabase-js'

type AuthMode = 'login' | 'signup'

export default function Home() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!
  )
  
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authMode, setAuthMode] = useState<AuthMode>('login')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleAuth = async () => {
    if (authMode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) alert(error.message)
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) alert(error.message)
      else alert('Check your email for confirmation!')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  if (user) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-slate-50 to-slate-100">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">🚀 MyPersonalHelper</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <p className="text-xl">✅ Benvenuto {user.email}!</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-blue-600">23</div>
                  <p className="text-sm text-slate-600 mt-1">Active Tenants</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-green-600">€1,247</div>
                  <p className="text-sm text-slate-600 mt-1">Monthly Revenue</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-purple-600">1.2k</div>
                  <p className="text-sm text-slate-600 mt-1">Data Records</p>
                </CardContent>
              </Card>
            </div>
            <Button onClick={handleLogout} className="w-full">Logout</Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-slate-50 to-slate-100">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">🚀 MyPersonalHelper</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email"
              type="email"
              placeholder="tuo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setAuthMode('login')}
              variant={authMode === 'login' ? 'default' : 'outline'}
              className="flex-1"
            >
              Login
            </Button>
            <Button 
              onClick={() => setAuthMode('signup')}
              variant={authMode === 'signup' ? 'default' : 'outline'}
              className="flex-1"
            >
              Sign Up
            </Button>
          </div>
          <Button onClick={handleAuth} className="w-full" disabled={!email || !password}>
            {authMode === 'login' ? 'Login' : 'Sign Up'}
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
