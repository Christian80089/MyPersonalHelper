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