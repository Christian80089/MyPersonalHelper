'use client'

import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarFooter 
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { 
  Home, 
  Users, 
  User, 
  BarChart3, 
  Package, 
  Settings, 
  Shield, 
  Database, 
  FileText, 
  LogOut 
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { title: "Dashboard", url: "/protected/admin", icon: Home },
  { title: "Utenti", url: "/protected/admin/users", icon: Users },
  { title: "Profili", url: "/protected/admin/profiles", icon: User },
  { 
    title: "Analytics", 
    url: "/protected/admin/analytics", 
    icon: BarChart3,
    children: [
      { title: "Report", url: "/protected/admin/analytics/reports" }
    ]
  },
  { title: "Ordini", url: "/protected/admin/orders", icon: Package },
  { title: "Settings", url: "/protected/admin/settings", icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="border-r bg-background/95 backdrop-blur">
      {/* Header */}
      <SidebarHeader className="p-4 border-b bg-gradient-to-b from-background/50 to-transparent">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-accent/50">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
              Admin Panel
            </h2>
            <p className="text-xs text-muted-foreground font-medium">v2.0</p>
          </div>
        </div>
      </SidebarHeader>

      {/* Menu Principale */}
      <SidebarContent className="p-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.url || 
                          (item.children && item.children.some(child => pathname === child.url))
          
          return (
            <SidebarGroup key={item.title}>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    className={cn(
                      "justify-start gap-3 p-3 rounded-2xl mb-1",
                      isActive 
                        ? "bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 text-primary shadow-lg" 
                        : "hover:bg-accent/50 hover:text-foreground"
                    )}
                  >
                    <Link href={item.url}>
                      <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          )
        })}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-3 mt-auto border-t bg-accent/20">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="justify-start gap-3 p-3 rounded-2xl hover:bg-destructive/20 text-destructive hover:text-destructive-foreground">
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
