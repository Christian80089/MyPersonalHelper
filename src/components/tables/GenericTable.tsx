'use client';

import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";
import { useModal } from "@/hooks/useModal";
import { TableColumnConfig, TableRowData } from '@/types/table';
import { createRecord, deleteRecords, updateRecord } from '@/utils/actions';
import { ArrowDown, ArrowUp, ArrowUpDown, Plus, Trash2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { AddModalForm } from "../modals/AddModalForm";
import Button from "../ui/button/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

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

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="p-4 border-b border-gray-100 dark:border-white/0.03">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {finalSelectedRows.length} selected
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              startIcon={<Plus className="h-4 w-4" />}
              onClick={() => addModal.openModal()}
              className="text-green-600 hover:text-green-700 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-950/20"
            >
              Add
            </Button>
            <Button
              size="sm"
              variant="outline"
              startIcon={<Trash2 className="h-4 w-4" />}
              onClick={handleDeleteMultiple}
              disabled={finalSelectedRows.length === 0}
              className={`${
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
                      {formatCellValue(row, column.key, column.format)}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

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
      />
    </div>
  );
}
