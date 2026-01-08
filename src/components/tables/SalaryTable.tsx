'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ArrowUpDown, ArrowUp, ArrowDown, Trash2, Plus } from "lucide-react";
import Button from "../ui/button/Button"
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal"
import { useModal } from "@/hooks/useModal";

interface Salary {
  id: string;
  created_at: Date;
  data_busta_paga: Date;
  livello_contratto: string;
  retribuzione_base_lorda: number;
  totale_competenze_lorde: number;
  irpef_lorda: number;
  totale_trattenute: number;
  netto_busta_paga: number;
  quota_tfr_lorda: number;
  ferie_residue: number;
  permessi_residui: number;
  ore_ordinarie: number;
  ore_straordinario: number;
  straordinario_pagato_lordo: number;
}

interface ColumnConfig {
  key: keyof Salary;
  label: string;
  format?: 'date' | 'currency';
  sortable?: boolean;
  required?: boolean;
}

type SortDir = 'asc' | 'desc';

interface SalaryTableProps {
  tableData: Salary[];
  selectedRows?: string[];
  onRowSelect?: (selectedIds: string[]) => void;
  allowMultiSelect?: boolean;
  serverSortKey: string;
  serverSortDirection: SortDir;
  onDeleteMultiple?: (ids: string[]) => Promise<void>;
}

const SALARY_TABLE_CONFIG: ColumnConfig[] = [
  { key: 'data_busta_paga', label: 'Data Busta', format: 'date', required: true },
  { key: 'livello_contratto', label: 'Livello Contratto' },
  { key: 'retribuzione_base_lorda', label: 'Retrib. Base Lorda', format: 'currency' },
  { key: 'totale_competenze_lorde', label: 'Competenze Lorde', format: 'currency' },
  { key: 'irpef_lorda', label: 'IRPEF Lorda', format: 'currency' },
  { key: 'totale_trattenute', label: 'Totale Trattenute', format: 'currency' },
  { key: 'netto_busta_paga', label: 'Netto Busta', format: 'currency' },
  { key: 'quota_tfr_lorda', label: 'Quota TFR Lorda', format: 'currency' },
  { key: 'ferie_residue', label: 'Ferie Residue' },
  { key: 'permessi_residui', label: 'Permessi Residui' },
  { key: 'ore_ordinarie', label: 'Ore Ordinarie' },
  { key: 'ore_straordinario', label: 'Ore Straordinarie' },
  { key: 'straordinario_pagato_lordo', label: 'Straord. Pagato', format: 'currency' },
];


function formatCellValue(salary: Salary, key: keyof Salary, format?: string) {
  const value = (salary as Salary)[key];
  
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
  
  // Numeri con 2 decimali
  if (typeof value === 'number') {
    return value.toLocaleString('it-IT', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  }
  
  // Stringhe e altro
  return String(value);
}
export default function SalaryTable({ tableData, selectedRows = [], onRowSelect, allowMultiSelect = true, serverSortKey, serverSortDirection, onDeleteMultiple}: SalaryTableProps) {
  const [internalSelectedRows, setInternalSelectedRows] = useState<string[]>([]); 
  const finalSelectedRows = selectedRows.length > 0 ? selectedRows : internalSelectedRows;
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const addModal = useModal();
  const deleteModal = useModal();
  const changeModal = useModal();

  const handleDeleteMultiple = () => {
    if (finalSelectedRows.length === 0) return
    deleteModal.openModal()
  }

  const confirmDeleteMultiple = () => {
    onDeleteMultiple?.(finalSelectedRows.map(id => id.toString()))
    deleteModal.closeModal()
  }

  const handleRowClick = (rowId: string) => {
    let newSelected: string[];
    
    if (!allowMultiSelect) {
      // Selezione singola: toggle on/off
      newSelected = finalSelectedRows.includes(rowId) 
        ? [] // deseleziona
        : [rowId]; // seleziona solo questa
    } else {
      // Selezione multipla: toggle
      newSelected = finalSelectedRows.includes(rowId)
        ? finalSelectedRows.filter(id => id !== rowId) // rimuovi
        : [...finalSelectedRows, rowId]; // aggiungi
    }
    
    // Aggiorna stato interno O chiama callback
    if (selectedRows.length === 0) {
      setInternalSelectedRows(newSelected);
    }
    onRowSelect?.(newSelected);
  };

  const handleServerSortClick = (dbKey: string) => {
    const isSameColumn = serverSortKey === dbKey;
    const nextDir: SortDir =
      !isSameColumn
        ? 'asc'
        : serverSortDirection === 'asc'
        ? 'desc'
        : 'asc';

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
            {/* NUOVO: Bottone Add */}
            <Button
              size="sm"
              variant="outline"
              startIcon={<Plus className="h-4 w-4" />}
              onClick={() => addModal.openModal()}
              className="text-green-600 hover:text-green-700 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-950/20"
            >
              Add
            </Button>
            {/* Delete esistente */}
            <Button
              size="sm"
              variant="outline"
              startIcon={<Trash2 className="h-4 w-4" />}
              onClick={handleDeleteMultiple}
              className="text-red-500 hover:text-red-700 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950/20"
            >
              {`Delete${finalSelectedRows.length > 0 ? ` ${finalSelectedRows.length} selected`: ''}`}
            </Button>
          </div>
        </div>
      </div>
      <div className="max-w-full overflow-x-auto">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                {SALARY_TABLE_CONFIG.map((column) => {
                  const isSortable = column.sortable ?? true;
                  const isSorted = serverSortKey === column.key;
                  const direction = serverSortDirection;

                  return (
                    <TableCell
                      key={column.key}
                      isHeader
                      className={
                        "px-5 py-3 font-medium text-gray-500 text-start text-theme-s dark:text-gray-400 whitespace-nowrap" +
                        (isSortable ? " cursor-pointer select-none" : "")
                      }
                      onClick={
                        isSortable ? () => handleServerSortClick(column.key) : undefined
                      }
                      role={isSortable ? "button" : undefined}
                      tabIndex={isSortable ? 0 : undefined}
                      onKeyDown={
                        isSortable
                          ? (e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                handleServerSortClick(column.key);
                              }
                            }
                          : undefined
                      }
                    >
                      <div className="flex items-center gap-1">
                        <span>{column.label}</span>
                        {isSortable && (
                          <>
                            {!isSorted && (
                              <ArrowUpDown className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                            )}
                            {isSorted && direction === 'asc' && (
                              <ArrowUp className="h-3 w-3 text-gray-500 dark:text-gray-300" />
                            )}
                            {isSorted && direction === 'desc' && (
                              <ArrowDown className="h-3 w-3 text-gray-500 dark:text-gray-300" />
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.02]">
              {tableData.map((salary) => {
                const isSelected = finalSelectedRows.includes(salary.id);
                
                return (
                  <TableRow 
                    key={salary.id}
                    // ← AGGIUNTA CLASSE SELEZIONATA
                    className={`cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.04] ${
                      isSelected 
                        ? 'bg-blue-50 border-l-4 border-l-blue-500 dark:bg-blue-500/[0.08]' 
                        : ''
                    }`}
                    // ← AGGIUNTO EVENTO CLICK
                    onClick={() => handleRowClick(salary.id)}
                  >
                    {SALARY_TABLE_CONFIG.map((column) => (
                      <TableCell 
                        key={column.key} 
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                      >
                        {formatCellValue(salary, column.key, column.format)}
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
    </div>
  );
}
