'use client'

import { 
  Search, 
  Bell, 
  ChevronDown, 
  Menu, 
  Sun, 
  Moon,
  CreditCard 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarTrigger } from '@/components/ui/sidebar'
import Link from 'next/link'

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/20 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 lg:px-8">
        {/* Mobile Menu */}
        <div className="flex items-center lg:hidden mr-4">
          <SidebarTrigger />
        </div>

        {/* Search */}
        <div className="flex-1 flex lg:max-w-2xl mx-4 lg:mx-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cerca utenti, ordini, report..."
              className="h-10 pl-10 pr-4 bg-muted/50 border-border/50 focus-visible:ring-primary/30 w-full"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
            <CreditCard className="h-4 w-4" />
            <span className="sr-only">Fatturazione</span>
          </Button>
          
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notifiche</span>
          </Button>

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-9 w-44 rounded-xl border border-border/50 bg-muted/50 hover:bg-accent justify-start gap-3 px-3 hover:border-primary/50 transition-all duration-200"
              >
                <Avatar className="h-7 w-7">
                  <AvatarImage src="/avatar.jpg" />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                    CD
                  </AvatarFallback>
                </Avatar>
                <div className="text-left flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">Christian Del Prete</p>
                  <p className="text-xs text-muted-foreground truncate">Super Admin</p>
                </div>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              sideOffset={8} 
              align="end" 
              className="w-56 border-border/50 bg-background/95 backdrop-blur-xl"
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Christian Del Prete</p>
                  <p className="text-xs text-muted-foreground">admin@example.com</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/50" />
              <DropdownMenuItem asChild>
                <Link href="/protected/admin/settings">Impostazioni</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>Profilo</DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/50" />
              <DropdownMenuItem className="text-destructive focus:text-destructive">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
