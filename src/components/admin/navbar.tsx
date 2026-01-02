'use client'

import { 
  Bell, 
  ChevronDown,
  CreditCard 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
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
      <div className="mx-auto flex h-14 sm:h-16 items-center px-3 sm:px-4 lg:px-8">
        
        {/* SIDEBAR TRIGGER - SEMPRE A SINISTRA */}
        <div className="flex-shrink-0">
          <SidebarTrigger />
        </div>

        {/* SPACER CENTRALE - PRENDE TUTTO LO SPAZIO DISPONIBILE */}
        <div className="flex-1 min-w-0" />

        {/* ACCOUNT ACTIONS - SEMPRE A DESTRA */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          
          {/* CreditCard - Visibile da xs */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-9 w-9 p-0 hidden xs:flex hover:bg-accent/50 transition-colors"
          >
            <CreditCard className="h-4 w-4" />
            <span className="sr-only">Fatturazione</span>
          </Button>
          
          {/* Bell - Sempre visibile */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-9 w-9 p-0 hover:bg-accent/50 transition-colors"
          >
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notifiche</span>
          </Button>

          {/* PROFILE - TESTO SEMPRE VISIBILE + Icona a SINISTRA */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="group h-9 sm:h-10 w-44 sm:w-48 lg:w-52 xl:w-56 rounded-full border border-border/50 bg-muted/50 hover:bg-accent hover:border-primary/75 transition-all duration-200 shadow-sm hover:shadow-md justify-start px-3 sm:px-4 gap-2 sm:gap-3"
              >
                {/* Avatar SEMPRE A SINISTRA */}
                <Avatar className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 ring-1 ring-border/50 group-hover:ring-primary/50 transition-all">
                  <AvatarImage src="/avatar.jpg" />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-sm font-semibold border-2 border-white/20">
                    CD
                  </AvatarFallback>
                </Avatar>

                {/* TESTO SEMPRE VISIBILE - NO TRUNCATE su schermi normali */}
                <div className="flex flex-col min-w-0 flex-1 text-left sm:ml-1">
                  <p className="font-semibold text-xs sm:text-sm truncate leading-tight">
                    Christian Del Prete
                  </p>
                  <p className="text-xs text-muted-foreground leading-tight hidden xs:block">
                    Super Admin
                  </p>
                </div>

                {/* Chevron ALLINEATO A DESTRA */}
                <ChevronDown className="h-4 w-4 shrink-0 opacity-60 group-hover:opacity-100 transition-all ml-1 sm:ml-2" />
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent 
              sideOffset={8} 
              align="end" 
              className="w-64 border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl p-1"
            >
              <DropdownMenuLabel className="font-normal px-3 py-3">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold">Christian Del Prete</p>
                  <p className="text-xs text-muted-foreground">admin@example.com</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/30" />
              <DropdownMenuItem asChild className="px-3 py-2.5">
                <Link href="/protected/admin/settings" className="w-full">Impostazioni</Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="px-3 py-2.5">Profilo</DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/30" />
              <DropdownMenuItem className="text-destructive focus:text-destructive px-3 py-2.5">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

