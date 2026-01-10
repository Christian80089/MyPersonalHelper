// components/AdminLayout.tsx
'use client'

import { User } from '@supabase/supabase-js'  // ✅ TypeScript User
import { useSidebar } from "@/context/SidebarContext"
import AppHeader from "@/layout/AppHeader"
import AppSidebar from "@/layout/AppSidebar"
import Backdrop from "@/layout/Backdrop"

interface Props {
  children: React.ReactNode
  initialUser: User | null  // ✅ Type-safe (no any)
}

export default function AdminLayout({ 
  children, 
  initialUser 
}: Props) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar()

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]"

  return (
    <div className="h-screen flex flex-col xl:flex-row overflow-hidden">
      {/* Passa user ai sub-componenti */}
      <AppSidebar />
      <Backdrop />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${mainContentMargin} overflow-hidden h-full`}>
        <AppHeader />
        
        <main className="flex-1 overflow-y-auto custom-scrollbar pt-4 px-4 md:px-6 lg:px-8 w-full max-w-9xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
