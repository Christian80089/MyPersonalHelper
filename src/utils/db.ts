/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/lib/supabase/client";
import { TableColumnConfig } from '@/types/table';

/**
 * =====================================================================
 * INTERFACCE E TIPI
 * =====================================================================
 */

/** Informazioni colonna da Supabase RPC */
interface SupabaseColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: boolean;
  column_default: string | null;
  character_maximum_length: number | null;
  udt_name: string;
}

/**
 * =====================================================================
 * FUNZIONI UTILITY
 * =====================================================================
 */

/**
 * Mappa tipi Supabase/Postgres a formati frontend
 * @param dataType - Tipo colonna dal database
 * @returns Formato per TableColumnConfig
 */
function mapSupabaseTypeToFormat(dataType: string): 'date' | 'currency' | 'number' | 'text' {
  const typeMap: Record<string, 'date' | 'currency' | 'number' | 'text'> = {
    // 📅 Date/Time types
    'timestamp without time zone': 'date',
    'timestamp with time zone': 'date',
    'date': 'date',
    
    // 🔢 Numeric types
    'numeric': 'number',
    'decimal': 'number',
    'double precision': 'number',
    'real': 'number',
    'bigint': 'number',
    'integer': 'number',
    'smallint': 'number',
    
    // 📝 Text types
    'character varying': 'text',
    'text': 'text',
    'character': 'text',
    'varchar': 'text',
    
    // 🆔 UUID
    'uuid': 'text',
  };
  
  return typeMap[dataType] || 'text';
}

/**
 * =====================================================================
 * FUNZIONE PRINCIPALE - RECUPERO SCHEMA TABELLA
 * =====================================================================
 * 
 * 1. Chiama RPC Supabase per info colonne
 * 2. Filtra colonne sensibili/sistematiche  
 * 3. Mappa a formato TableColumnConfig
 * 4. Formatta label human-readable
 */
export default async function get_table_schema(
  tableName: string
): Promise<TableColumnConfig[]> {
  try {
    const supabase = await createClient();
    
    // 🚀 1. Chiama RPC per schema colonna
    const { data, error } = await supabase.rpc('get_table_schema', { 
      table_name: tableName 
    }) as { data: SupabaseColumnInfo[] | null; error: any };

    if (error || !data) {
      console.error(`❌ Errore schema ${tableName}:`, error);
      return [];
    }

    console.log(`📋 Schema trovato per ${tableName}: ${data.length} colonne`);

    // 🚀 2. FILTRA colonne non desiderate
    const filteredColumns = data.filter(col => 
      col.column_name !== 'id' && 
      !col.column_name.startsWith('private_') &&
      !['password', 'created_at', 'updated_at', 'user_id'].includes(col.column_name)
    );

    console.log(`✅ Colonne filtrate: ${filteredColumns.length}/${data.length}`);

    // 🚀 3. MAPPA a TableColumnConfig
    return filteredColumns.map((col): TableColumnConfig => {
      const key = col.column_name;
      
      // 🔤 Formatta label human-readable
      const label = key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());

      return {
        key,
        label,
        format: mapSupabaseTypeToFormat(col.data_type),
        required: !col.is_nullable,
        sortable: true,
      };
    });

  } catch (error) {
    console.error(`💥 CRASH get_table_schema ${tableName}:`, error);
    return [];
  }
}
