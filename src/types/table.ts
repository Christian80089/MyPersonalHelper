/* eslint-disable @typescript-eslint/no-explicit-any */
// types/table.ts
export interface TableRowData {
  id: string;
  [key: string]: string | number | Date | null;
}

// ✅ INTERFACE UNICO PER ENTRAMBI
export interface TableColumnConfig {
  key: string;                    // Sempre string per form
  label: string;
  format: 'date' | 'currency' | 'number' | 'text' | 'boolean';
  sortable?: boolean;
  required?: boolean;
  type?: string;
}

export const FORMAT_TO_SUPABASE_TYPE: Record<TableColumnConfig['format'], string[]> = {
  date: ['date', 'timestamp without time zone', 'timestamp with time zone'],
  currency: ['numeric', 'double precision', 'real'],
  number: ['numeric', 'integer', 'bigint', 'double precision', 'real'],
  text: ['text', 'varchar', 'character varying', 'character'],
  boolean: ['boolean']
};

export function castFormValue(
  value: string | null | undefined, 
  format: TableColumnConfig['format']
): any {
  if (!value || value.trim() === '') return null;
  
  const trimmed = value.trim();
  
  switch (format) {
    case 'currency':
    case 'number':
      const num = parseFloat(trimmed.replace(',', '.'));
      return isNaN(num) ? null : num;
      
    case 'date':
      if (!trimmed) return null;
      const date = new Date(trimmed);  // Ora sempre ISO!
      return date.toISOString().split('T')[0];  // Ridondante ma safe
      
    case 'boolean':
      return trimmed.toLowerCase() === 'true' || trimmed === '1' || trimmed === 'yes';
      
    case 'text':
    default:
      return trimmed;
  }
}