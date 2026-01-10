/* eslint-disable @typescript-eslint/no-explicit-any */
// app/actions.ts
'use server';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { TableColumnConfig, castFormValue } from '@/types/table';

interface DeleteResult {
  success: boolean;
  deletedCount: number;
  error?: string;
}

export async function deleteRecords(tableName: string, ids: string[]): Promise<DeleteResult> {
  try {
    // ✅ Validazione input
    if (!tableName || typeof tableName !== 'string') {
      throw new Error('Nome tabella non valido');
    }
    
    if (!ids?.length || !ids.every(id => typeof id === 'string')) {
      throw new Error('ID non validi');
    }

    const supabase = await createClient();
    
    // ✅ Esegui delete con count
    const { data, error } = await supabase
      .from(tableName)
      .delete()
      .in('id', ids)
      .select('id'); // Per ottenere count reali

    if (error) {
      console.error('❌ Supabase Delete Error:', {
        tableName,
        ids,
        error: error.message,
        details: error.details,
        hint: error.hint
      });
      throw new Error(`Errore cancellazione: ${error.message}`);
    }

    console.log('✅ Delete Success:', { tableName, deleted: data?.length || 0 });

    // 🚀 Revalidate
    revalidatePath(`/manage-tables`);
    revalidatePath(`/manage-tables?*`);

    return {
      success: true,
      deletedCount: data?.length || 0
    };

  } catch (error) {
    console.error('💥 DeleteRecords CRASH:', error);
    return {
      success: false,
      deletedCount: 0,
      error: error instanceof Error ? error.message : 'Errore sconosciuto'
    };
  }
}

interface CreateResult {
  success: boolean;
  id?: string;
  error?: string;
}

export async function createRecord(
  tableName: string, 
  formData: FormData, 
  schema: TableColumnConfig[]  // ✅ Passa schema!
): Promise<CreateResult> {
  try {
    const supabase = await createClient();
    const rawData = Object.fromEntries(formData.entries());
    
    console.log('📤 Raw FormData:', rawData);

    // 🚀 CAST usando SCHEMA (ultra preciso!)
    const castedData: Record<string, any> = {};
    
    schema.forEach(col => {
      const rawValue = rawData[col.key];
      if (rawValue !== undefined) {
        castedData[col.key] = castFormValue(rawValue as string, col.format);
      }
    });

    console.log('🔮 Casted Data:', castedData);

    if (Object.keys(castedData).length === 0) {
      throw new Error('Nessun dato valido');
    }

    const { data: inserted, error } = await supabase
      .from(tableName)
      .insert(castedData)
      .select()
      .single();

    if (error) {
      console.error('❌ Insert Error:', error);
      throw new Error(error.message);
    }

    revalidatePath(`/manage-tables`);
    revalidatePath(`/manage-tables?*`);

    return { success: true, id: inserted?.id as string };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Errore sconosciuto'
    };
  }
}

// 🚀 FETCH DISTINCT VALUES (NUOVA!)
interface DistinctOptionsResult {
  success: boolean;
  options: Record<string, string[]>;
  error?: string;
}

export async function fetchDistinctOptions(
  tableName: string,
  columns: string[]
): Promise<DistinctOptionsResult> {
  try {
    if (!tableName || typeof tableName !== 'string') {
      throw new Error('Nome tabella non valido');
    }

    if (!columns?.length || !columns.every(col => typeof col === 'string')) {
      throw new Error('Colonne non valide');
    }

    const supabase = await createClient();
    const options: Record<string, string[]> = {};

    // 🚀 Query OTTIMIZZATA: usa rpc per performance estreme
    const promises = columns.map(async (column) => {
      // ✅ QUERY SUPABASE OTTIMIZZATA per grandi tabelle
      const { data, error } = await supabase
        .rpc('get_distinct_top_values', {
          p_table_name: tableName,
          p_column_name: column,
          p_limit: 20
        });

        console.log('📥 RPC Response RAW:', data);
      if (error) {
        console.warn(`⚠️ Distinct RPC failed for ${column}, fallback query:`, error.message);
        
        // ✅ FALLBACK con LIMIT e DISTINCT nativo
        const { data: fallbackData, error: fallbackError } = await supabase
          .from(tableName)
          .select(`${column}`)
          .not(column, 'is', null)
          .not(column, 'eq', '')
          .limit(10000) // Max per evitare timeout su tabelle enormi
          .order(column);

        if (fallbackError) {
          console.warn(`⚠️ Fallback failed for ${column}`);
          return;
        }

        // ✅ Distinct con limite 20 dal fallback
        const distinctValues = Array.from(
          new Set(fallbackData?.map((row: any) => row[column]).filter(Boolean) ?? [])
        )
          .sort()
          .slice(0, 20);

        options[column] = distinctValues;
        return;
      }

      // ✅ Filtra null/empty e limita a 20
      const distinctValues = (data || [])
        .map((row: any) => row.value)
        .filter(Boolean)
        .slice(0, 20);

      options[column] = distinctValues;
    });

    await Promise.all(promises);

    console.log('✅ Distinct Options Optimized:', { tableName, count: Object.values(options).reduce((sum, vals) => sum + vals.length, 0) });

    return {
      success: true,
      options
    };

  } catch (error) {
    console.error('💥 fetchDistinctOptions CRASH:', error);
    return {
      success: false,
      options: {},
      error: error instanceof Error ? error.message : 'Errore sconosciuto'
    };
  }
}

// 🚀 FUNZIONE FETCH GENERICA
export async function fetchTableDataGeneric(
  tableName: string,
  page: number = 1, 
  limit: number = 8, 
  sortBy: string = 'created_at', 
  sortDir: 'asc' | 'desc' = 'desc'
) {
  const supabase = await createClient();
  const from = (page - 1) * limit;
  
  const { data, error, count } = await supabase
    .from(tableName)
    .select("*", { count: 'estimated' })
    .order(sortBy, { ascending: sortDir === 'asc' })
    .range(from, from + limit - 1);

  if (error) throw error;

  const totalPages = Math.ceil((count || 0) / limit);
  
  return {
    data,
    totalPages,
    currentPage: page
  };
}