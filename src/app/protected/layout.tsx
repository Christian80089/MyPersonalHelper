'use client'

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/admin/sidebar'
import { Navbar } from '@/components/admin/navbar'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth/login')
        return
      }
    }
    checkAuth()
  }, [router])

  return (
    // ✅ GLOBAL: h-dvh + overflow-hidden + NO scrollbar orizzontale MAI
    <div className="h-dvh w-screen max-w-screen overflow-x-hidden overflow-y-auto">
      <SidebarProvider className="h-full">
        <AppSidebar />
        {/* ✅ SidebarInset: max-w-full forza contenitore compresso */}
        <SidebarInset className="w-full max-w-full flex flex-col h-full overflow-hidden">
          <Navbar />
          <main 
            className={cn(
              "flex-1 overflow-hidden p-0 transition-all duration-300 ease-out",
              // ✅ NO overflow-x, solo y se serve
              "overflow-x-hidden overflow-y-auto"
            )}
          >
            <div 
              className={cn(
                "min-h-full flex flex-col w-full max-w-full h-full",
                // Padding responsive MENO aggressivo per evitare overflow
                "px-1 xs:px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10",
                "py-1 sm:py-2 md:py-4 space-y-4"
              )}
            >
              {children}
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
      <Sonner toastOptions={{
        classNames: {
          toast: "group bg-background border-border/50 shadow-xl",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
        },
      }} />
    </div>
  )
}
