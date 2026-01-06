"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <div className="h-screen flex flex-col xl:flex-row overflow-hidden">
      {/* Sidebar */}
      <AppSidebar />
      <Backdrop />
      
      {/* Right Panel */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${mainContentMargin} overflow-hidden h-full`}>
        {/* Header */}
        <AppHeader />
        
        {/* Content - NO CONTAINER, padding diretto */}
        <main className="flex-1 overflow-y-auto custom-scrollbar pt-4 px-4 md:px-6 lg:px-8 w-full max-w-9xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
