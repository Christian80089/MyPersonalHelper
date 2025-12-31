'use client'

import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/admin/sidebar'
import { Navbar } from '@/components/admin/navbar'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(true)
  const router = useRouter()

  // ✅ Auth check all'avvio
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/auth/login')
      }
    }
    checkAuth()
  }, [router])

  return (
    <>
      <SidebarProvider>
        {/* ✅ NAVBAR SUPERIORE */}
        <div className="flex min-h-screen w-full flex-col bg-background/95 backdrop-blur">
          <Navbar />
          
          {/* ✅ MAIN CONTENT */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <main className="flex-1 p-1 sm:p-2 md:p-4 lg:p-8 transition-all duration-200">
              <div className={cn(
                "container mx-auto max-w-7xl space-y-6"
              )}>
                {children}
              </div>
            </main>
          </div>
        </div>
        
        {/* ✅ SIDEBAR LATERALE */}
        <AppSidebar />
      </SidebarProvider>

      {/* ✅ TOASTER NOTIFICHE GLOBALI */}
      <Sonner />
    </>
  )
}
