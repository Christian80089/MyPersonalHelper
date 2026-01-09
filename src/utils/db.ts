/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/lib/supabase/client";
import { TableColumnConfig } from '@/types/table';

interface SupabaseColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: boolean;
  column_default: string | null;
  character_maximum_length: number | null;
  udt_name: string;
}

function mapSupabaseTypeToFormat(dataType: string): 'date' | 'currency' | 'number' | 'text' {
  const typeMap: Record<string, 'date' | 'currency' | 'number' | 'text'> = {
    // Date/Time
    'timestamp without time zone': 'date',
    'timestamp with time zone': 'date',
    'date': 'date',
    
    // Numbers
    'numeric': 'number',
    'decimal': 'number',
    'double precision': 'number',
    'real': 'number',
    'bigint': 'number',
    'integer': 'number',
    'smallint': 'number',
    
    // Text
    'character varying': 'text',
    'text': 'text',
    'character': 'text',
    'varchar': 'text',
    
    // UUID
    'uuid': 'text',
  };
  
  return typeMap[dataType] || 'text';
}

export default async function get_table_schema(
  tableName: string
): Promise<TableColumnConfig[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase.rpc('get_table_schema', { 
    table_name: tableName 
  }) as { data: SupabaseColumnInfo[] | null; error: any };

  if (error || !data) {
    console.error(`Errore schema ${tableName}:`, error);
    return [];
  }

  return data
    .filter(col => 
      col.column_name !== 'id' && 
      !col.column_name.startsWith('private_') &&
      !['password', 'created_at', 'updated_at', 'user_id'].includes(col.column_name)
    )
    .map((col): TableColumnConfig => {
      const key = col.column_name as string;
      
      return {
        key,
        label: col.column_name
          .replace(/_/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase()),
        format: mapSupabaseTypeToFormat(col.data_type),
        required: !col.is_nullable,
        sortable: true,
      };
    });
}
