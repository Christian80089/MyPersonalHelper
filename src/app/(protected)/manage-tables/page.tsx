/* eslint-disable @typescript-eslint/no-explicit-any */
import ComponentCard from "@/components/common/ComponentCard";
import GenericTable from "@/components/tables/GenericTable";
import Pagination from "@/components/tables/Pagination";
import { TableColumnConfig } from "@/types/table";
import { fetchTableDataGeneric } from '@/utils/actions';
import get_table_schema from "@/utils/db";


// 🚀 GENERIC PAGE PROPS
interface GenericTablePageProps {
  searchParams: Promise<{ 
    page?: string; 
    sortBy?: string; 
    sortDir?: 'asc' | 'desc' 
  }>;
}

// 🚀 PAGINA GENERICA PRINCIPALE
export default async function GenericTablePage({
  searchParams,
}: GenericTablePageProps) {
  const tableName = "Salary";  // "Salary", "Users", etc.
  const resolvedSearchParams = await searchParams;
  
  const page = Math.max(1, parseInt(resolvedSearchParams.page || '1'));
  const sortBy = resolvedSearchParams.sortBy || 'created_at';
  const sortDir = (resolvedSearchParams.sortDir as 'asc' | 'desc' | undefined) || 'desc';

  // 🚀 FETCH + SCHEMA AUTO
  const { data: tableData, totalPages, currentPage } = await fetchTableDataGeneric(
    tableName, page, 10, sortBy, sortDir
  );
  
  const schema: TableColumnConfig[] = await get_table_schema(tableName);  // any per genericità

  console.log(`📊 ${tableName}:`, { page, count: tableData.length, totalPages });

  return (
    <div>
      <div className="space-y-6">
        <ComponentCard title={`Table`}>
          <GenericTable<any>  // ✅ any = funziona con tutto
            tableData={tableData}
            tableName={tableName}
            serverSortKey={sortBy}
            serverSortDirection={sortDir}
            schema={schema}
          />
        </ComponentCard>
        
        {totalPages > 1 && (
          <div className="flex justify-center pt-8 border-t border-gray-200">
            <Pagination currentPage={currentPage} totalPages={totalPages} />
          </div>
        )}
      </div>
    </div>
  );
}

// 🚀 DYNAMIC METADATA
export async function generateMetadata({ params }: { params: { table: string } }) {
  return {
    title: `Manage Table | TailAdmin`,
    description: `Manage data`,
  };
}
