/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useCallback, useState } from 'react'

type TableData = Record<string, any>

interface ColumnSchema {
  column_name: string
  data_type: string
  is_nullable: boolean
  column_default: string | null
  character_maximum_length?: number
  udt_name: string
}

export default function TablesPage() {
  const DEBUG_MODE = process.env.NEXT_PUBLIC_DEBUG_MODE === 'false' ? false : true
  const [columnsSchema, setColumnsSchema] = useState<ColumnSchema[]>([])
  const supabase = createClient()

  function formatName(name: string): string {
    return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const loadSchema = useCallback(async (tableName: string) => {
    const { data, error } = await supabase.rpc('get_table_schema', { 
      table_name: tableName 
    })
    if (error) {
      console.error('Schema error:', error)
      return
    }
    setColumnsSchema(data || [])
    if (DEBUG_MODE)
    console.log('Schema loaded:', data?.map((c: ColumnSchema) => `${c.column_name}:${c.data_type}`))
  }, [DEBUG_MODE, supabase])

  return (
      <Card className="h-full flex flex-col overflow-hidden">
        <div className="flex-1 p-6 overflow-y-auto">
      <h1 className="text-3xl font-bold text-white mb-6">Database Tablesddddddddddddddddddddddddddddddddddddddddddddddddddd</h1>
      <h1 className="text-3xl font-bold text-white mb-6">Database Tables</h1>
      <h1 className="text-3xl font-bold text-white mb-6">Database Tables</h1>
      <h1 className="text-3xl font-bold text-white mb-6">Database Tables</h1>
      <h1 className="text-3xl font-bold text-white mb-6">Database Tables</h1>
      <h1 className="text-3xl font-bold text-white mb-6">Database Tables</h1>
      <h1 className="text-3xl font-bold text-white mb-6">Database Tables</h1>
      <h1 className="text-3xl font-bold text-white mb-6">Database Tables</h1>
      <h1 className="text-3xl font-bold text-white mb-6">Database Tables</h1>
      <h1 className="text-3xl font-bold text-white mb-6">Database Tables</h1>
      <h1 className="text-3xl font-bold text-white mb-6">Database Tables</h1>
      <h1 className="text-3xl font-bold text-white mb-6">Database Tables</h1>
      <h1 className="text-3xl font-bold text-white mb-6">Database Tables</h1>
      <h1 className="text-3xl font-bold text-white mb-6">Database Tables</h1>
      <h1 className="text-3xl font-bold text-white mb-6">Database Tables</h1>
      <h1 className="text-3xl font-bold text-white mb-6">Database Tables</h1>
      <h1 className="text-3xl font-bold text-white mb-6">Database Tables</h1>
      <h1 className="text-3xl font-bold text-white mb-6">Database Tables</h1>
      <h1 className="text-3xl font-bold text-white mb-6">Database Tables</h1>
      <h1 className="text-3xl font-bold text-white mb-6">Database Tables</h1>
      <h1 className="text-3xl font-bold text-white mb-6">Database Tables</h1>
      <h1 className="text-3xl font-bold text-white mb-6">Database Tables</h1>
      <h1 className="text-3xl font-bold text-white mb-6">Database Tables</h1>
      <h1 className="text-3xl font-bold text-white mb-6">Database Tables</h1>
      <h1 className="text-3xl font-bold text-white mb-6">Database Tables</h1>
      <h1 className="text-3xl font-bold text-white mb-6">Database Tables</h1>
      <h1 className="text-3xl font-bold text-white mb-6">Database Tables</h1>
      <h1 className="text-3xl font-bold text-white mb-6">Database Tables</h1>
      <h1 className="text-3xl font-bold text-white mb-6">Database Tables</h1>
      <h1 className="text-3xl font-bold text-white mb-6">Database Tables</h1>
      </div>
      </Card>
  );

}
