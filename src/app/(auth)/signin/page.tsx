import SignInForm from "@/components/auth/SignInForm"
import { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Sign In | Admin Dashboard",
}

export default async function SignInPage() {
  // ✅ REDIRECT SE GIA' LOGGATO (proxy + extra check)
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (session) {
    redirect('/admin')
  }

  return <SignInForm />
}
