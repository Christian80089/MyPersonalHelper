"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Button from "../ui/button/Button";
import { Modal } from "../ui/modal";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import { TableColumnConfig, TableRowData, castFormValue } from '@/types/table';
import { fetchDistinctOptions } from "@/utils/actions";
import Switch from "../form/switch/Switch";
import DatePicker from "../form/date-picker";

interface AddModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (formData: FormData) => Promise<void>;
  schema: TableColumnConfig[];
  title?: string;
  tableName?: string;
  initialData?: TableRowData;
  isEditMode?: boolean;
  lastRowData?: TableRowData;
}

export const AddModalForm: React.FC<AddModalFormProps> = ({
  isOpen,
  onClose,
  onConfirm,
  schema,
  title = "Nuovo Record",
  tableName,
  initialData,
  isEditMode = false,
  lastRowData,
}) => {
  const formRef = useRef<HTMLFormElement>(null);
  // ✅ NUOVI STATI
  const [dropdownStates, setDropdownStates] = useState<{[key: string]: boolean}>({});
  const [distinctOptions, setDistinctOptions] = useState<{[key: string]: string[]}>({});
  const [loadingOptions, setLoadingOptions] = useState<{[key: string]: boolean}>({});
  const [copyLastRow, setCopyLastRow] = useState(false);

  useEffect(() => {
    if (!formRef.current || !isOpen) {
    // ✅ MODAL CHIUSO → Reset switch (mantiene dati last record)
    if (!isOpen) {
      setDropdownStates({});
    }
    return;
  }

    if (isEditMode && initialData) {
      // EDIT MODE: precompila dati riga
      schema.forEach(({ key, format }) => {
        const field = formRef.current?.querySelector(`[name="${key}"]`) as HTMLInputElement | HTMLSelectElement;
        if (field && initialData[key] !== null && initialData[key] !== undefined) {
          let displayValue = String(initialData[key]);
          if (format === 'date') {
            displayValue = new Date(initialData[key] as Date).toISOString().split('T')[0];
          }
          field.value = displayValue;
          
        }
      });
    } else if (!isEditMode && copyLastRow && lastRowData) {
      // ADD MODE + Switch ON: copia ultima riga
      schema.forEach(({ key, format }) => {
        const field = formRef.current?.querySelector(`[name="${key}"]`) as HTMLInputElement | HTMLSelectElement;
        if (field && lastRowData[key] !== null && lastRowData[key] !== undefined && key !== 'id') {
          let displayValue = String(lastRowData[key]);
          if (format === 'date') {
            displayValue = new Date(lastRowData[key] as Date).toISOString().split('T')[0];
          }
          field.value = displayValue;
        
        }
      });
    }
  }, [isOpen, initialData, isEditMode, copyLastRow, lastRowData, schema]);

  const handleCopyLastRowToggle = useCallback(() => {
    const newValue = !copyLastRow;
    setCopyLastRow(newValue);
    
    // ✅ SE DISATTIVI → PULISCI TUTTI I CAMPI
    if (!newValue && formRef.current) {
      schema.forEach(({ key }) => {
        const field = formRef.current?.querySelector(`[name="${key}"]`) as HTMLInputElement | HTMLSelectElement;
        if (field) {
          field.value = '';
        }
      });
      // Reset dropdown states
      setDropdownStates({});
    }
  }, [copyLastRow, schema]);
  
  // ✅ FETCH DISTINCT quando modal apre
  const fetchOptionsForColumn = useCallback(async (columnKey: string) => {
    if (!tableName || !isOpen) return;

    setLoadingOptions(prev => ({ ...prev, [columnKey]: true }));
    
    try {
      const result = await fetchDistinctOptions(tableName, [columnKey]);
      if (result.success) {
        setDistinctOptions(prev => ({ ...prev, [columnKey]: result.options[columnKey] || [] }));
      }
    } catch (error) {
      console.error(`Errore fetch options per ${columnKey}:`, error);
    } finally {
      setLoadingOptions(prev => ({ ...prev, [columnKey]: false }));
    }
  }, [tableName, isOpen]);

  const toggleDropdown = useCallback((key: string) => {
    const newState = !dropdownStates[key];
    setDropdownStates(prev => ({ ...prev, [key]: newState }));
    
    // ✅ Fetch solo se switch attivato e non già caricato
    if (newState && !distinctOptions[key] && !loadingOptions[key]) {
      fetchOptionsForColumn(key);
    }
  }, [dropdownStates, distinctOptions, loadingOptions, fetchOptionsForColumn]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!formRef.current) return;
    
    const formData = new FormData(formRef.current);
    
    // 🚀 VALIDAZIONE AVANZATA con castFormValue
    let hasErrors = false;
    schema.forEach(({ key, label, required, format }) => {
      const rawValue = formData.get(key);
      const castedValue = castFormValue(rawValue as string, format);
      
      if (required && castedValue === null) {
        hasErrors = true;
        alert(`The field "${label}" (${key}) is mandatory!`);
        return;
      }
    });

    if (hasErrors) return;

    try {
      await onConfirm(formData);
      onClose();
    } catch (error) {
      console.error("Errore submit:", error);
    }
  };

  const getInputType = (format?: TableColumnConfig['format']): React.InputHTMLAttributes<HTMLInputElement>['type'] => {
    switch (format) {
      case 'date': return 'date';
      case 'currency': 
      case 'number': return 'number';
      case 'boolean': return 'checkbox';
      case 'text': 
      default: return 'text';
    }
  };

 const getPlaceholder = (format?: TableColumnConfig['format'], label?: string): string => {
  switch (format) {
    case 'currency':
      return '0,00 €';
    case 'number':
      return '0';
    case 'date':
      return new Date().toLocaleDateString('it-IT');
    case 'boolean':
      return 'Sì/No';
    default:
      return label ? `Inserisci ${label}` : 'Inserisci valore';
  }
};

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      className="w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-[584px] p-4 sm:p-6 lg:p-10 max-h-[90vh] overflow-y-auto"
    >
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <h4 className="mb-4 sm:mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
          {title}
        </h4>

        {/* ✅ SWITCH "COPIA ULTIMA RIGA" - SOLO ADD MODE */}
        {!isEditMode && lastRowData && (
          <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-950/30 dark:border-blue-800">
            <Label className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Fill with last row data
            </Label>
            <Switch
              defaultChecked={copyLastRow}
              onChange={handleCopyLastRowToggle}
              color="blue"
            />
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:gap-x-4 sm:gap-y-5 md:grid-cols-2">
          {schema.map(({ key, label, format, required }) => (
            <div key={key} className="w-full">
              {/* ✅ HEADER CON CHECKBOX */}
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <Label 
                  htmlFor={key}
                  className={`block text-sm font-medium text-gray-700 dark:text-gray-300 flex-1 pr-3 ${
                    required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""
                  }`}
                >
                  {label}
                </Label>
                
                {/* ✅ IL TUO SWITCH COMPONENT */}
                {format === 'text' && (
                  <Switch
                    defaultChecked={dropdownStates[key] || false}  // Controllato dallo stato
                    onChange={() => toggleDropdown(key)}  // Callback
                    color="blue"
                  />
                )}
              </div>

              {/* ✅ INPUT CONDIZIONALE COMPLETO */}
              {format === 'date' ? (
                /* ✅ DATEPICKER */
                <DatePicker
                  id={key}
                  name={key}
                  placeholder={getPlaceholder(format, label)}
                />
              ) : format === 'text' && dropdownStates[key] ? (
                /* DROPDOWN */
                <select
                  id={key}
                  name={key}
                  className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  defaultValue=""
                >
                  <option value="">
                    {loadingOptions[key] ? 'Caricamento...' : `Seleziona ${label}...`}
                  </option>
                  {(distinctOptions[key]?.length ? distinctOptions[key] : []).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                /* INPUT NORMALE */
                <Input 
                  id={key}
                  name={key}
                  type={getInputType(format)}
                  className="w-full"
                  placeholder={getPlaceholder(format, label)}
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-end w-full gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onClose}
            className="w-full sm:w-auto flex-1 sm:flex-none min-w-[100px] sm:min-w-[90px]"
          >
            Annulla
          </Button>
          <Button 
            size="sm" 
            onClick={handleSubmit}
            className="w-full sm:w-auto flex-1 sm:flex-none min-w-[120px] sm:min-w-[110px]"
          >
             {isEditMode ? 'Aggiorna Record' : 'Aggiungi Record'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
