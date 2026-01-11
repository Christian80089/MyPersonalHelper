/* eslint-disable @typescript-eslint/no-explicit-any */
import ComponentCard from "@/components/common/ComponentCard";
import GenericTable from "@/components/tables/GenericTable";
import TableSwitcher from "@/components/tables/TableSwitcher";
import { TableColumnConfig } from "@/types/table";
import { fetchPublicTables, fetchTableDataGeneric } from '@/utils/actions';
import get_table_schema from "@/utils/db";


// 🚀 GENERIC PAGE PROPS
interface GenericTablePageProps {
  searchParams: Promise<{ 
    table?: string;
    page?: string; 
    sortBy?: string; 
    sortDir?: 'asc' | 'desc' 
  }>;
}

// 🚀 PAGINA GENERICA PRINCIPALE
export default async function GenericTablePage({
  searchParams,
}: GenericTablePageProps) {
  const resolvedSearchParams = await searchParams;

  // 1) Lista tabelle (da RPC get_public_tables)
  const tablesResult = await fetchPublicTables();
  const tables = tablesResult.success ? tablesResult.tables : [];

  // 2) Table selezionata da querystring + fallback sicuro
  const requestedTable = resolvedSearchParams.table?.trim();
  const fallbackTable = tables[0];
  const tableName = requestedTable && tables.includes(requestedTable) ? requestedTable : fallbackTable;

  // 3) Paginazione / sort
  const page = Math.max(1, parseInt(resolvedSearchParams.page || "1"));
  const sortBy = resolvedSearchParams.sortBy || "created_at";
  const sortDir = (resolvedSearchParams.sortDir as "asc" | "desc" | undefined) || "desc";

  // 4) Fetch dati + schema
  const { data: tableData, totalPages, currentPage } = await fetchTableDataGeneric(
    tableName,
    page,
    10,
    sortBy,
    sortDir
  );
  
  const schema: TableColumnConfig[] = await get_table_schema(tableName);

  console.log(`📊 ${tableName}:`, { page, count: tableData.length, totalPages });

  return (
    <div>
      <div className="space-y-6">
        <ComponentCard 
          title={`Manage your data`}
          desc="Use the right dropdown to switch the table."
          headerRight={
          <TableSwitcher
              basePath="/manage-tables"
              tables={tables.length ? tables : [tableName]}
              currentTable={tableName}
              keepParams={{ sortBy, sortDir }}
          />
          }
        >
          <GenericTable<any>
            tableData={tableData}
            tableName={tableName}
            serverSortKey={sortBy}
            serverSortDirection={sortDir}
            schema={schema}
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </ComponentCard>    
      </div>
    </div>
  );
}

// 🚀 DYNAMIC METADATA
export async function generateMetadata() {
  return {
    title: `Manage Table | TailAdmin`,
    description: `Manage data`,
  };
}
