import ComponentCard from "@/components/common/ComponentCard";
import Pagination from "@/components/tables/Pagination";
import SalaryTable from "@/components/tables/SalaryTable";
import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Next.js Basic Table | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Basic Table  page for TailAdmin  Tailwind CSS Admin Dashboard Template",
  // other metadata
};

interface SalaryPageProps {
  searchParams: Promise<{ page?: string }>;
}

async function fetchData(page: number = 1, limit: number = 10) {
  const supabase = await createClient();
  
  const from = (page - 1) * limit;
  
  const { data, error, count } = await supabase
    .from("Salary")
    .select("*", { count: 'exact' })
    .order('data_busta_paga', { ascending: false })
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

  console.log('🔥 SERVER:', { 
    searchParams: resolvedSearchParams, 
    page 
  });

  const { data: tableData, totalPages, currentPage } = await fetchData(page);

  console.log('📊 DATI:', { 
    page, 
    count: tableData.length, 
    totalPages 
  });

  return (
    <div>
      <div className="space-y-6">
        <ComponentCard title="Salary Table">
          <SalaryTable tableData={tableData || []} />
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
