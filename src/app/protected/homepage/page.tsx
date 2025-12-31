import { redirect } from 'next/navigation'
import { LogoutButton } from '@/components/logout-button'
import { createClient } from '@/lib/supabase/server'
import { CustomTable } from '@/components/ui/custom-table'

export default async function ProtectedPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getClaims()
  if (error || !data?.claims) {
    redirect('/auth/login')
  }

  const { data: rows } = await supabase.from('TestTable').select('*').limit(100)
  console.log('ROWS:', rows)

  const columns = rows && rows.length > 0 
    ? Object.keys(rows[0]!) 
    : []
   console.log('Columns:', columns)

  return (
    <div className="flex h-svh w-full items-center justify-center gap-2">
      <div>
        <CustomTable
          data={rows}
          tableName="Test Table"
        />
      </div>
    </div>
  )
}
