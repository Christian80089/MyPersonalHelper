import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

import { UUID } from "crypto";

interface Salary {
  id: UUID;
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
}

interface SalaryTableProps {
  tableData: Salary[];
}

const SALARY_TABLE_CONFIG: ColumnConfig[] = [
  { key: 'data_busta_paga', label: 'Data Busta', format: 'date' },
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
export default function SalaryTable({ tableData }: SalaryTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                {/* Header generato automaticamente */}
                {SALARY_TABLE_CONFIG.map((column) => (
                  <TableCell
                    key={column.key}
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.02]">
              {tableData.map((salary) => (
                <TableRow key={salary.id}>
                  {SALARY_TABLE_CONFIG.map((column) => (
                    <TableCell key={column.key} className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      {formatCellValue(salary, column.key, column.format)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
    </div>
  );
}
