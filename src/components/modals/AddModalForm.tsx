"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";

import Button from "../ui/button/Button";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import { TableColumnConfig, TableRowData, castFormValue } from "@/types/table";
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

  // Draggable refs/state
  const dragNodeRef = useRef<HTMLDivElement>(null);
  const [dragKey, setDragKey] = useState(0);
  const [defaultPos, setDefaultPos] = useState({ x: 24, y: 80 });

  // Stati esistenti
  const [dropdownStates, setDropdownStates] = useState<Record<string, boolean>>({});
  const [distinctOptions, setDistinctOptions] = useState<Record<string, string[]>>({});
  const [loadingOptions, setLoadingOptions] = useState<Record<string, boolean>>({});
  const [copyLastRow, setCopyLastRow] = useState(false);

  // Calcolo posizione iniziale “tipo finestra” (quando apri)
  useEffect(() => {
    if (!isOpen) return;

    setDragKey((k) => k + 1);

    // posizione iniziale circa centrata (senza misurare DOM)
    const maxW = 584;
    const viewportW = window.innerWidth || 1024;
    const modalW = Math.min(maxW, Math.max(320, viewportW - 32));
    const x = Math.max(16, Math.round((viewportW - modalW) / 2));
    const y = Math.max(24, Math.round((window.innerHeight || 800) * 0.10));
    setDefaultPos({ x, y });
  }, [isOpen]);

  // ESC per chiudere
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  // Reset stati quando chiudi
  useEffect(() => {
    if (!isOpen) {
      setDropdownStates({});
      setCopyLastRow(false);
    }
  }, [isOpen]);

  // Precompilazione form (edit) o copia ultima riga (add)
  useEffect(() => {
    if (!formRef.current || !isOpen) return;

    if (isEditMode && initialData) {
      schema.forEach(({ key, format }) => {
        const field = formRef.current?.querySelector(
          `[name="${key}"]`
        ) as HTMLInputElement | HTMLSelectElement | null;

        if (field && initialData[key] !== null && initialData[key] !== undefined) {
          let displayValue = String(initialData[key]);
          if (format === "date") {
            displayValue = new Date(initialData[key] as Date).toISOString().split("T")[0];
          }
          field.value = displayValue;
        }
      });
    } else if (!isEditMode && copyLastRow && lastRowData) {
      schema.forEach(({ key, format }) => {
        const field = formRef.current?.querySelector(
          `[name="${key}"]`
        ) as HTMLInputElement | HTMLSelectElement | null;

        if (field && lastRowData[key] !== null && lastRowData[key] !== undefined && key !== "id") {
          let displayValue = String(lastRowData[key]);
          if (format === "date") {
            displayValue = new Date(lastRowData[key] as Date).toISOString().split("T")[0];
          }
          field.value = displayValue;
        }
      });
    }
  }, [isOpen, initialData, isEditMode, copyLastRow, lastRowData, schema]);

  const handleCopyLastRowToggle = useCallback(() => {
    const newValue = !copyLastRow;
    setCopyLastRow(newValue);

    // Se disattivi: pulisci campi
    if (!newValue && formRef.current) {
      schema.forEach(({ key }) => {
        const field = formRef.current?.querySelector(
          `[name="${key}"]`
        ) as HTMLInputElement | HTMLSelectElement | null;

        if (field) field.value = "";
      });
      setDropdownStates({});
    }
  }, [copyLastRow, schema]);

  const fetchOptionsForColumn = useCallback(
    async (columnKey: string) => {
      if (!tableName || !isOpen) return;

      setLoadingOptions((prev) => ({ ...prev, [columnKey]: true }));
      try {
        const result = await fetchDistinctOptions(tableName, [columnKey]);
        if (result.success) {
          setDistinctOptions((prev) => ({
            ...prev,
            [columnKey]: result.options[columnKey] || [],
          }));
        }
      } catch (error) {
        console.error(`Errore fetch options per ${columnKey}:`, error);
      } finally {
        setLoadingOptions((prev) => ({ ...prev, [columnKey]: false }));
      }
    },
    [tableName, isOpen]
  );

  const toggleDropdown = useCallback(
    (key: string) => {
      setDropdownStates((prev) => {
        const newState = !prev[key];

        // Fetch solo se attivo e non già caricato
        if (newState && !distinctOptions[key] && !loadingOptions[key]) {
          fetchOptionsForColumn(key);
        }

        return { ...prev, [key]: newState };
      });
    },
    [distinctOptions, loadingOptions, fetchOptionsForColumn]
  );

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formRef.current) return;

    const formData = new FormData(formRef.current);

    let hasErrors = false;
    schema.forEach(({ key, label, required, format }) => {
      const rawValue = formData.get(key);
      const castedValue = castFormValue(rawValue as string, format);

      if (required && castedValue === null) {
        hasErrors = true;
        alert(`The field "${label}" (${key}) is mandatory!`);
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

  const getInputType = (
    format?: TableColumnConfig["format"]
  ): React.InputHTMLAttributes<HTMLInputElement>["type"] => {
    switch (format) {
      case "date":
        return "date";
      case "currency":
      case "number":
        return "number";
      case "boolean":
        return "checkbox";
      case "text":
      default:
        return "text";
    }
  };

  const getPlaceholder = (format?: TableColumnConfig["format"], label?: string): string => {
    switch (format) {
      case "currency":
        return "0,00 €";
      case "number":
        return "0";
      case "date":
        return new Date().toLocaleDateString("it-IT");
      case "boolean":
        return "Sì/No";
      default:
        return label ? `Inserisci ${label}` : "Inserisci valore";
    }
  };

  // Non renderizzare nulla se chiuso
  if (!isOpen) return null;

  // Portal target
  const portalTarget = typeof document !== "undefined" ? document.body : null;
  if (!portalTarget) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-transparent overflow-x-hidden"
      onClick={onClose} // click overlay => chiude
      role="dialog"
      aria-modal="true"
    >
      {/* contenitore bounds */}
      <div className="absolute inset-x-0 bottom-0 top-6 overflow-hidden">
        <Draggable
          key={dragKey}
          nodeRef={dragNodeRef}
          handle=".modal-titlebar"
          cancel='input,textarea,select,button,[data-nodrag="true"]'
          bounds="parent"
          defaultPosition={defaultPos}
          axis="x"
        >
          <div
            ref={dragNodeRef}
            className="
              box-border
              w-[min(584px,calc(100vw-2rem))]
              max-h-[85vh]
              overflow-y-auto overflow-x-hidden
              rounded-lg border border-gray-200 dark:border-gray-700
              bg-white/85 dark:bg-gray-900/75 backdrop-blur
              shadow-2xl
            "
            onClick={(e) => e.stopPropagation()} // click dentro => NON chiude
          >
            {/* Titlebar (drag handle) */}
            <div
              className="
                modal-titlebar select-none touch-none
                px-4 py-3
                border-b border-gray-200 dark:border-gray-700
                flex items-center justify-between gap-3 min-w-0
                cursor-grab active:cursor-grabbing
              "
            >
              <h4 className="text-lg font-medium text-gray-800 dark:text-white/90 min-w-0 truncate">
                {title}
              </h4>

              <button
                type="button"
                data-nodrag="true"
                onClick={onClose}
                className="px-2 py-1 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                aria-label="Chiudi"
              >
                ✕
              </button>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-10 space-y-4 sm:space-y-6">
              {/* SWITCH copia ultima riga */}
              {!isEditMode && lastRowData && (
                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-950/30 dark:border-blue-800">
                  <Label className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Fill with last row data
                  </Label>
                  <Switch defaultChecked={copyLastRow} onChange={handleCopyLastRowToggle} color="blue" />
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 sm:gap-x-4 sm:gap-y-5 md:grid-cols-2">
                {schema.map(({ key, label, format, required }) => (
                  <div key={key} className="w-full min-w-0">
                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                      <Label
                        htmlFor={key}
                        className={`block text-sm font-medium text-gray-700 dark:text-gray-300 flex-1 pr-3 ${
                          required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""
                        }`}
                      >
                        {label}
                      </Label>

                      {format === "text" && (
                        <Switch
                          defaultChecked={dropdownStates[key] || false}
                          onChange={() => toggleDropdown(key)}
                          color="blue"
                        />
                      )}
                    </div>

                    {format === "date" ? (
                      <DatePicker id={key} name={key} placeholder={getPlaceholder(format, label)} />
                    ) : format === "text" && dropdownStates[key] ? (
                      <select
                        id={key}
                        name={key}
                        className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                        defaultValue=""
                      >
                        <option value="">
                          {loadingOptions[key] ? "Caricamento..." : `Seleziona ${label}...`}
                        </option>
                        {(distinctOptions[key]?.length ? distinctOptions[key] : []).map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
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
                  {isEditMode ? "Aggiorna Record" : "Aggiungi Record"}
                </Button>
              </div>
            </form>
          </div>
        </Draggable>
      </div>
    </div>
  );
};
