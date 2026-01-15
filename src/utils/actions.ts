/* eslint-disable @typescript-eslint/no-explicit-any */
// app/actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { TableColumnConfig, castFormValue } from '@/types/table';

/**
 * =====================================================================
 * INTERFACCE E TIPI
 * =====================================================================
 */

/** Risultato fetch tabelle pubbliche */
interface FetchPublicTablesResult {
  success: boolean;
  tables: string[];
  error?: string;
}

/** Riga RPC per tabelle pubbliche (supporta vari formati) */
type PublicTablesRpcRow =
  | string
  | { table_name?: string; tablename?: string; name?: string };

/** Risultato operazione update record */
interface UpdateResult {
  success: boolean;
  id: string;
  error?: string;
}

/** Risultato operazione delete record */
interface DeleteResult {
  success: boolean;
  deletedCount: number;
  error?: string;
}

/** Risultato operazione create record */
interface CreateResult {
  success: boolean;
  id?: string;
  error?: string;
}

/** Risultato fetch valori distinti per colonne */
interface DistinctOptionsResult {
  success: boolean;
  options: Record<string, string[]>;
  error?: string;
}

/**
 * =====================================================================
 * 1. FETCH TABELLE PUBBLICHE
 * =====================================================================
 * Recupera elenco tabelle pubbliche tramite RPC Postgres
 */
export async function fetchPublicTables(): Promise<FetchPublicTablesResult> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_public_tables");

    if (error) {
      throw new Error(error.message);
    }

    const rows = (data ?? []) as PublicTablesRpcRow[];

    // Normalizza vari formati di risposta RPC
    const tables = rows
      .map((row) => {
        if (typeof row === "string") return row;
        return row.table_name ?? row.tablename ?? row.name ?? "";
      })
      .map((t) => t.trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    return { success: true, tables };
  } catch (e) {
    return {
      success: false,
      tables: [],
      error: e instanceof Error ? e.message : "Errore sconosciuto",
    };
  }
}

/**
 * =====================================================================
 * 2. UPDATE RECORD
 * =====================================================================
 * Aggiorna un record esistente usando schema per validazione/casting
 */
export async function updateRecord(
  tableName: string,
  recordId: string,
  formData: FormData,
  schema: TableColumnConfig[]
): Promise<UpdateResult> {
  try {
    // Validazione input base
    if (!tableName || typeof tableName !== 'string') {
      throw new Error('Nome tabella non valido');
    }
    if (!recordId || typeof recordId !== 'string') {
      throw new Error('ID record non valido');
    }

    const supabase = await createClient();
    const rawData = Object.fromEntries(formData.entries());
    console.log('📤 Raw FormData UPDATE:', { tableName, recordId, rawData });

    // 1. Verifica record esistente
    const { data: existingRecord, error: fetchError } = await supabase
      .from(tableName)
      .select('id')
      .eq('id', recordId.trim());

    if (fetchError || !existingRecord?.length) {
      console.error('❌ Record non trovato:', { tableName, recordId, fetchError });
      throw new Error(`Record con ID ${recordId} non trovato`);
    }

    // 2. Casting dati usando schema (esclude ID)
    const castedData: Record<string, any> = {};
    schema.forEach(col => {
      if (col.key === 'id') return; // ID non modificabile
      
      const rawValue = rawData[col.key];
      if (rawValue !== undefined) {
        castedData[col.key] = castFormValue(rawValue as string, col.format);
      }
    });

    console.log('🔮 Casted Update Data:', castedData);
    if (Object.keys(castedData).length === 0) {
      throw new Error('Nessun campo modificato');
    }

    // 3. Esegui update
    const { data: updated, error: updateError } = await supabase
      .from(tableName)
      .update(castedData)
      .eq('id', recordId.trim())
      .select('id');

    if (updateError) {
      console.error('❌ Update Error:', {
        tableName,
        recordId,
        error: updateError.message,
        details: updateError.details,
        hint: updateError.hint
      });
      throw new Error(`Errore update: ${updateError.message}`);
    }

    console.log('✅ Update Success:', { tableName, recordId, updated });

    // 4. Revalidate paths
    revalidatePath(`/manage-tables`);
    revalidatePath(`/manage-tables?*`);

    return { success: true, id: recordId };

  } catch (error) {
    console.error('💥 UpdateRecord CRASH:', error);
    return {
      success: false,
      id: recordId,
      error: error instanceof Error ? error.message : 'Errore sconosciuto'
    };
  }
}

/**
 * =====================================================================
 * 3. DELETE RECORD MULTIPLI
 * =====================================================================
 * Elimina record multipli tramite ID con count di conferma
 */
export async function deleteRecords(tableName: string, ids: string[]): Promise<DeleteResult> {
  try {
    // Validazione input
    if (!tableName || typeof tableName !== 'string') {
      throw new Error('Nome tabella non valido');
    }
    if (!ids?.length || !ids.every(id => typeof id === 'string')) {
      throw new Error('ID non validi');
    }

    const supabase = await createClient();

    // Esegui delete con count
    const { data, error } = await supabase
      .from(tableName)
      .delete()
      .in('id', ids)
      .select('id');

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

    // Revalidate paths
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

/**
 * =====================================================================
 * 4. CREATE RECORD
 * =====================================================================
 * Crea nuovo record con validazione/casting tramite schema
 */
export async function createRecord(
  tableName: string, 
  formData: FormData, 
  schema: TableColumnConfig[]
): Promise<CreateResult> {
  try {
    const supabase = await createClient();
    const rawData = Object.fromEntries(formData.entries());
    
    console.log('📤 Raw FormData:', rawData);

    // Casting dati usando schema
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

    // Revalidate paths
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

/**
 * =====================================================================
 * 5. FETCH VALORI DISTINTI (OTTONI)
 * =====================================================================
 * Recupera valori unici per colonne (con RPC + fallback)
 */
export async function fetchDistinctOptions(
  tableName: string,
  columns: string[]
): Promise<DistinctOptionsResult> {
  try {
    // Validazione input
    if (!tableName || typeof tableName !== 'string') {
      throw new Error('Nome tabella non valido');
    }
    if (!columns?.length || !columns.every(col => typeof col === 'string')) {
      throw new Error('Colonne non valide');
    }

    const supabase = await createClient();
    const options: Record<string, string[]> = {};

    // Esegui query parallele per ogni colonna
    const promises = columns.map(async (column) => {
      // Prova RPC ottimizzata prima
      const { data, error } = await supabase
        .rpc('get_distinct_top_values', {
          p_table_name: tableName,
          p_column_name: column,
          p_limit: 20
        });

      console.log('📥 RPC Response RAW:', data);
      
      if (error) {
        console.warn(`⚠️ Distinct RPC failed for ${column}, fallback query:`, error.message);
        
        // Fallback con query nativa
        const { data: fallbackData, error: fallbackError } = await supabase
          .from(tableName)
          .select(`${column}`)
          .not(column, 'is', null)
          .not(column, 'eq', '')
          .limit(10000)
          .order(column);

        if (fallbackError) {
          console.warn(`⚠️ Fallback failed for ${column}`);
          return;
        }

        // Estrai distinct dal fallback
        const distinctValues = Array.from(
          new Set(fallbackData?.map((row: any) => row[column]).filter(Boolean) ?? [])
        )
          .sort()
          .slice(0, 20);

        options[column] = distinctValues;
        return;
      }

      // Processa RPC response
      const distinctValues = (data || [])
        .map((row: any) => row.value)
        .filter(Boolean)
        .slice(0, 20);

      options[column] = distinctValues;
    });

    await Promise.all(promises);
    console.log('✅ Distinct Options Optimized:', { 
      tableName, 
      count: Object.values(options).reduce((sum, vals) => sum + vals.length, 0) 
    });

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

/**
 * =====================================================================
 * 6. FETCH DATI TABELLA GENERICO (PAGINATO)
 * =====================================================================
 * Fetch dati con paginazione, ordinamento e conteggio totale
 */
export async function fetchTableDataGeneric(
  tableName: string,
  page: number = 1, 
  limit: number = 8, 
  sortBy: string = 'created_at', 
  sortDir: 'asc' | 'desc' = 'desc'
) {
  const supabase = await createClient();
  const from = (page - 1) * limit;
  const traceId = `trace-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  
  console.log(`🔍 Supabase CALL START [${traceId}] table=${tableName} page=${page}`);
  
  const { data, error, count } = await supabase
    .from(tableName)
    .select("*", { count: 'estimated' })
    .order(sortBy, { ascending: sortDir === 'asc' })
    .range(from, from + limit - 1);

  console.log(`🔍 Supabase CALL END [${traceId}] count=${count} rows=${data?.length}`);
  
  if (error) throw error;

  const totalPages = Math.ceil((count || 0) / limit);
  
  return {
    data,
    totalPages,
    currentPage: page
  };
}