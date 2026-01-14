import DashboardBuilder from "@/components/admin/DashboardBuilder";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Next.js E-commerce Dashboard | TailAdmin - Next.js Dashboard Template",
  description: "This is Next.js Home for TailAdmin Dashboard Template",
};

export default async function Ecommerce() {
  
  return (
    <div className="-mx-4 md:-mx-6 lg:-mx-8 overflow-x-hidden">
      <DashboardBuilder editable />
    </div>
  );
}
