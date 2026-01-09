import ComponentCard from "@/components/common/ComponentCard";
import Pagination from "@/components/tables/Pagination";
import SalaryTable, { Salary } from "@/components/tables/SalaryTable";
import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: "Next.js Basic Table | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Basic Table  page for TailAdmin  Tailwind CSS Admin Dashboard Template",
  // other metadata
};

type SortDir = 'asc' | 'desc';

interface SalaryPageProps {
  searchParams: Promise<{ page?: string; sortBy?: string; sortDir?: SortDir }>;
}

// 🚀 NUOVA ACTION PER CREARE RECORD
async function handleCreateRecord(formData: FormData) {
  'use server'
  const supabase = await createClient();
  
  // ✅ Converte FormData → Object
  const data = Object.fromEntries(formData.entries());
  
  // ✅ Converte tipi corretti per Supabase
  const payload: Partial<Salary> = {
    data_busta_paga: data.data_busta_paga ? new Date(data.data_busta_paga as string) : undefined,
    livello_contratto: data.livello_contratto as string,
    retribuzione_base_lorda: parseFloat(data.retribuzione_base_lorda as string) || 0,
    totale_competenze_lorde: parseFloat(data.totale_competenze_lorde as string) || 0,
    irpef_lorda: parseFloat(data.irpef_lorda as string) || 0,
    totale_trattenute: parseFloat(data.totale_trattenute as string) || 0,
    netto_busta_paga: parseFloat(data.netto_busta_paga as string) || 0,
    quota_tfr_lorda: parseFloat(data.quota_tfr_lorda as string) || 0,
    ferie_residue: parseInt(data.ferie_residue as string) || 0,
    permessi_residui: parseInt(data.permessi_residui as string) || 0,
    ore_ordinarie: parseFloat(data.ore_ordinarie as string) || 0,
    ore_straordinario: parseFloat(data.ore_straordinario as string) || 0,
    straordinario_pagato_lordo: parseFloat(data.straordinario_pagato_lordo as string) || 0,
  };

  const { error } = await supabase
    .from('Salary')
    .insert(payload);

  if (error) {
    console.error('❌ Create error:', error);
    throw error;
  }

  console.log('✅ CREATO record Salary');
  redirect('/basic-tables?page=1'); 
}

async function handleDeleteMultiple(ids: string[]) { 
  'use server'
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('Salary')
    .delete()
    .in('id', ids)

  if (error) {
    console.error('❌ Delete error:', error)
    throw error
  }
  
  console.log('✅ Deleted:', ids.length, 'rows')
  redirect('/basic-tables?page=1')  // Refresh pagina
}

async function fetchData(page: number = 1, limit: number = 8, sortBy: string = 'data_busta_paga', sortDir: SortDir = 'desc') {
  const supabase = await createClient();
  
  const from = (page - 1) * limit;
  
  const { data, error, count } = await supabase
    .from("Salary")
    .select("*", { count: 'estimated' })
    .order(sortBy, { ascending: sortDir === 'asc' })
    .range(from, from + limit - 1);

  if (error) throw error;

  const totalPages = Math.ceil((count || 0) / limit);
  
  return {
    data: data || [],
    totalPages,
    currentPage: page
  };
}

export default async function DataTables({ searchParams }: SalaryPageProps) {

  const resolvedSearchParams = await searchParams;
  const page = Math.max(1, parseInt(resolvedSearchParams.page || '1'));
  const sortByParam = resolvedSearchParams.sortBy;
  const sortDirParam = (resolvedSearchParams.sortDir as SortDir | undefined) || 'desc';

  const sortBy = sortByParam || 'data_busta_paga'; // default colonna TODO change with first column date
  const sortDir: SortDir = sortDirParam;

  console.log('🔥 SERVER:', { 
    searchParams: resolvedSearchParams, 
    page 
  });

  const { data: tableData, totalPages, currentPage } = await fetchData(page, 8, sortBy, sortDir,);

  console.log('📊 DATI:', { 
    page, 
    count: tableData.length, 
    totalPages 
  });

  return (
    <div>
      <div className="space-y-6">
        <ComponentCard title="Salary Table">
          <SalaryTable 
            tableData={tableData || []} 
            serverSortKey={sortBy} 
            serverSortDirection={sortDir}
            onDeleteMultiple={handleDeleteMultiple}
            onAdd={handleCreateRecord}
            />
        </ComponentCard>
        {totalPages > 1 && (
        <div className="flex justify-center pt-8 border-t border-gray-200">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </div>
      )}
      </div>
    </div>
  );
}
