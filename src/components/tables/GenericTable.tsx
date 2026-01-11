'use client';

import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";
import { useModal } from "@/hooks/useModal";
import { TableColumnConfig, TableRowData } from '@/types/table';
import { createRecord, deleteRecords, updateRecord } from '@/utils/actions';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, Download, FileSpreadsheet, FileUp, Plus, Trash2, Upload } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { AddModalForm } from "../modals/AddModalForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Pagination from "./Pagination";
import Button from "../ui/button/Button";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { OverflowTooltip } from "../modals/OverflowTooltip";

// 🚀 PROPS GENERICHE TYPE-SAFE
type SortDir = 'asc' | 'desc';

interface GenericTableProps<T extends TableRowData> {
  tableData: T[];
  tableName: string;  // Per delete e modal title
  selectedRows?: string[];
  onRowSelect?: (selectedIds: string[]) => void;
  allowMultiSelect?: boolean;
  serverSortKey: string;
  serverSortDirection: SortDir;
  schema?: TableColumnConfig[];
  lastRowData?: T; // Per copia ultimo record
  currentPage: number; // Per paginazione
  totalPages: number; // Per paginazione
}

// 🚀 FUNZIONE FORMAT GENERICA
function formatCellValue<T extends TableRowData>(
  row: T, 
  key: keyof T, 
  format: TableColumnConfig['format']
): string {
  const value = row[key];
  
  if (value === null || value === undefined) return '-';
  
  if (format === 'date') {
    return new Date(value as Date).toLocaleDateString('it-IT');
  }
  
  if (format === 'currency') {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(value as number);
  }
  
  if (typeof value === 'number') {
    return value.toLocaleString('it-IT', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  }
  
  return String(value);
}

export default function GenericTable<T extends TableRowData>({
  tableData, 
  tableName,
  selectedRows = [], 
  onRowSelect,
  allowMultiSelect = true, 
  serverSortKey, 
  serverSortDirection, 
  schema: propSchema,  // Schema opzionale da props
  currentPage,
  totalPages,
}: GenericTableProps<T>) {
  const [internalSelectedRows, setInternalSelectedRows] = useState<string[]>([]);
  const [editRowData, setEditRowData] = useState<T | null>(null);
  const finalSelectedRows = selectedRows.length > 0 ? selectedRows : internalSelectedRows;
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const addModal = useModal();
  const deleteModal = useModal();

  // 🚀 SCHEMA DA SUPABASE (se non fornito via props)
  const schema = useMemo(() => propSchema || [], [propSchema]); // Integrazione con get_table_schema

  /*console.log('🔍 DEBUG SCHEMA:', {
    propSchema: propSchema,
    schema: schema,
    schemaKeys: schema.map(s => s.key),
    hasId: schema.some(s => s.key === 'id'),
    tableDataLength: tableData.length,
    firstRowKeys: tableData[0] ? Object.keys(tableData[0]) : 'no data'
  });*/

  const handleModalConfirm = useCallback(async (formData: FormData) => {
    try {
      if (editRowData) {
        // UPDATE
        const result = await updateRecord(tableName, editRowData.id, formData, schema);
        if (!result.success) throw new Error(result.error || 'Update fallito');
      } else {
        // ADD
        const result = await createRecord(tableName, formData, schema);
        if (!result.success) throw new Error(result.error || 'Creazione fallita');
      }
      
      addModal.closeModal();
      setEditRowData(null);
    } catch (error) {
      console.error('❌ Errore:', error);
    }
  }, [editRowData, tableName, schema, addModal, setEditRowData]);

  const handleDoubleClick = useCallback((row: T) => {
    setEditRowData(row);
    addModal.openModal();
  }, [addModal]);

  const handleDeleteMultiple = () => {
    if (finalSelectedRows.length === 0) return;
    deleteModal.openModal();
  };

  const confirmDeleteMultiple = async () => {
    try {
      await deleteRecords(tableName, finalSelectedRows.map(id => id.toString()));
      
      // Reset selezione
      setInternalSelectedRows([]);
      onRowSelect?.([]);
      
      deleteModal.closeModal();
    } catch (error) {
      console.error(`Errore delete ${tableName}:`, error);
    }
  };

  const handleRowClick = (rowId: string) => {
    let newSelected: string[];
    
    if (!allowMultiSelect) {
      newSelected = finalSelectedRows.includes(rowId) ? [] : [rowId];
    } else {
      newSelected = finalSelectedRows.includes(rowId)
        ? finalSelectedRows.filter(id => id !== rowId)
        : [...finalSelectedRows, rowId];
    }
    
    if (selectedRows.length === 0) {
      setInternalSelectedRows(newSelected);
    }
    onRowSelect?.(newSelected);
  };

  const handleServerSortClick = (dbKey: string) => {
    const isSameColumn = serverSortKey === dbKey;
    const nextDir: SortDir = !isSameColumn ? 'asc' : serverSortDirection === 'asc' ? 'desc' : 'asc';

    const params = new URLSearchParams(searchParams.toString());
    params.set('sortBy', dbKey);
    params.set('sortDir', nextDir);
    params.set('page', '1');

    router.push(`${pathname}?${params.toString()}`);
  };

  const [isImportExportDropdownOpen, setIsImportExportDropdownOpen] = useState(false);

  const toggleImportExportDropdown = () => setIsImportExportDropdownOpen(!isImportExportDropdownOpen);
  const closeImportExportDropdown = () => setIsImportExportDropdownOpen(false);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="p-4 border-b border-gray-100 dark:border-white/[0.05] sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-2 lg:gap-3 xl:gap-4">
          {/* Import/Export - Custom Dropdown */}
          <div className="relative w-full sm:w-auto sm:flex-shrink-0">
            <Button
              size="sm"
              variant="outline"
              className="dropdown-toggle group w-full justify-between sm:w-auto inline-flex items-center gap-2 rounded-lg border border-brand-200 bg-white/70 px-3 py-2 text-sm font-medium text-brand-700 shadow-sm backdrop-blur transition-colors hover:bg-brand-50 hover:text-brand-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200/60 dark:border-brand-800/40 dark:bg-gray-900/40 dark:text-brand-300 dark:hover:bg-brand-500/10 dark:focus-visible:ring-brand-500/20"
              onClick={toggleImportExportDropdown}
            >
              <FileUp className="h-4 w-4 shrink-0" />
              Import/Export
              <ChevronDown className="h-3 w-3 shrink-0 transition-transform duration-200 group-data-[open=true]:rotate-180 group-aria-expanded:rotate-180" />
            </Button>

            <Dropdown isOpen={isImportExportDropdownOpen} onClose={closeImportExportDropdown}>
              <DropdownItem
                onItemClick={closeImportExportDropdown}
                className="menu-dropdown-item menu-dropdown-item-inactive flex items-center leading-none hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-500/10 dark:hover:text-brand-300"
              >
                <Upload className="h-4 w-4 flex-shrink-0 self-center" />
                Import CSV
              </DropdownItem>

              <DropdownItem
                onItemClick={closeImportExportDropdown}
                className="menu-dropdown-item menu-dropdown-item-inactive flex items-center leading-none hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-500/10 dark:hover:text-brand-300"
              >
                <Download className="h-4 w-4 flex-shrink-0 self-center" />
                Export CSV
              </DropdownItem>

              <DropdownItem
                onItemClick={closeImportExportDropdown}
                className="menu-dropdown-item menu-dropdown-item-inactive flex items-center leading-none hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-500/10 dark:hover:text-brand-300"
              >
                <FileSpreadsheet className="h-4 w-4 flex-shrink-0 self-center" />
                Export Excel
              </DropdownItem>
            </Dropdown>
          </div>
          
          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2 md:gap-3 lg:gap-3">
            <Button
              size="sm"
              variant="outline"
              startIcon={<Plus className="h-4 w-4" />}
              onClick={() => addModal.openModal()}
              className="w-full sm:w-auto flex-1 sm:flex-none text-green-600 hover:text-green-700 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-950/20"
            >
              Add
            </Button>
            <Button
              size="sm"
              variant="outline"
              startIcon={<Trash2 className="h-4 w-4" />}
              onClick={handleDeleteMultiple}
              disabled={finalSelectedRows.length === 0}
              className={`w-full sm:w-auto flex-1 sm:flex-none ${
                finalSelectedRows.length === 0 
                  ? "text-gray-400 cursor-not-allowed" 
                  : "text-red-500 hover:text-red-700 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950/20"
              }`}
            >
              {finalSelectedRows.length > 0 ? `Delete ${finalSelectedRows.length}` : "Delete"}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              {schema.map((column) => {
                const isSortable = column.sortable ?? true;
                const isSorted = serverSortKey === column.key;
                const direction = serverSortDirection;

                return (
                  <TableCell
                    key={String(column.key)}
                    isHeader
                    className={`px-5 py-3 font-medium text-gray-500 text-start text-theme-s dark:text-gray-400 whitespace-nowrap ${isSortable ? "cursor-pointer select-none" : ""}`}
                    onClick={isSortable ? () => handleServerSortClick(String(column.key)) : undefined}
                    role={isSortable ? "button" : undefined}
                    tabIndex={isSortable ? 0 : undefined}
                    onKeyDown={isSortable ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleServerSortClick(String(column.key));
                      }
                    } : undefined}
                  >
                    <div className="flex items-center gap-1">
                      <span>{column.label}</span>
                      {isSortable && (
                        <>
                          {!isSorted && <ArrowUpDown className="h-3 w-3 text-gray-400 dark:text-gray-500" />}
                          {isSorted && direction === 'asc' && <ArrowUp className="h-3 w-3 text-gray-500 dark:text-gray-300" />}
                          {isSorted && direction === 'desc' && <ArrowDown className="h-3 w-3 text-gray-500 dark:text-gray-300" />}
                        </>
                      )}
                    </div>
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.02]">
            {tableData.map((row) => {
              const isSelected = finalSelectedRows.includes(row.id);
              
              return (
                <TableRow 
                  key={row.id}
                  className={`cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.04] ${
                    isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500 dark:bg-blue-500/[0.08]' : ''
                  }`}
                  onClick={() => handleRowClick(row.id)}
                  onDoubleClick={() => handleDoubleClick(row)}
                >
                  {schema.map((column) => (
                    <TableCell 
                      key={String(column.key)}
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      <OverflowTooltip
                        text={formatCellValue(row, column.key, column.format)}
                        className="text-theme-sm text-gray-700 dark:text-gray-300"
                        maxWidthClassName="max-w-[260px]"
                      />
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 && (
      <div className="p-4 border-t border-gray-100 dark:border-white/[0.05] justify-center flex">
        <Pagination totalPages={totalPages} currentPage={currentPage} />
      </div>
      )}

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => deleteModal.closeModal()}
        onConfirm={confirmDeleteMultiple}
        count={finalSelectedRows.length}
      />

      <AddModalForm
        isOpen={addModal.isOpen}
        onClose={() => {
          addModal.closeModal();
          setEditRowData(null);
        }}
        onConfirm={handleModalConfirm}
        schema={schema}
        tableName={tableName}
        initialData={editRowData || undefined}
        isEditMode={!!editRowData}
        title={editRowData ? `Modifica Record` : `Nuovo Record`}
        lastRowData={tableData[0]}
      />
    </div>
  );
}
