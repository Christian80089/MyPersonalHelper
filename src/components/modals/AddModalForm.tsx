"use client";
import React, { useRef } from "react";
import Button from "../ui/button/Button";
import { Modal } from "../ui/modal";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import { TableColumnConfig, castFormValue } from '@/types/table';

interface AddModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (formData: FormData) => Promise<void>;
  schema: TableColumnConfig[];
  title?: string;
}

export const AddModalForm: React.FC<AddModalFormProps> = ({
  isOpen,
  onClose,
  onConfirm,
  schema,
  title = "Nuovo Record",
}) => {
  const formRef = useRef<HTMLFormElement>(null);

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
        alert(`Campo "${label}" (${key}) è obbligatorio!`);
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
      case 'currency': return '0,00 €';
      case 'number': return '0';
      case 'date': return '2026-01-01';
      case 'boolean': return 'Sì/No';
      default: return `Inserisci ${label}`;
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

        <div className="grid grid-cols-1 gap-3 sm:gap-x-4 sm:gap-y-5 md:grid-cols-2">
          {schema.map(({ key, label, format, required }) => (
            <div key={key} className="w-full">
              <Label 
                htmlFor={key}
                className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2 ${
                  required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""
                }`}
              >
                {label}
              </Label>
              <Input 
                id={key}
                name={key}
                type={getInputType(format)}
                className="w-full"
                placeholder={getPlaceholder(format, label)}
              />
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
            Aggiungi Record
          </Button>
        </div>
      </form>
    </Modal>
  );
};
