// app/(protected)/layout.tsx
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import AdminLayout from "@/components/auth/AdminLayout"  // Client component

export default async function ProtectedLayout({  // ← Nome diverso
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()  // No await (tuo server.ts)
  const { data: { user }, error } = await supabase.auth.getUser()

  // ✅ REDIRECT se no auth
  if (error || !user) {
    redirect('/signin')
  }

  return (
    <AdminLayout initialUser={user}>
      {children}
    </AdminLayout>
  )
}
