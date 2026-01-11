"use client";

import { useMemo, useState } from "react";
import Button from "@/components/ui/button/Button";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { ChevronDown } from "lucide-react";

type KeepParams = {
  sortBy?: string;
  sortDir?: "asc" | "desc";
};

interface TableSwitcherProps {
  basePath: string;           // es: "/manage-tables"
  tables: string[];
  currentTable: string;
  keepParams?: KeepParams;    // per preservare sortBy/sortDir nello switch
}

export default function TableSwitcher({
  basePath,
  tables,
  currentTable,
  keepParams,
}: TableSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  const items = useMemo(() => {
    const unique = Array.from(new Set(tables)).filter(Boolean);
    return unique.sort((a, b) => a.localeCompare(b));
  }, [tables]);

  const buildHref = (tableName: string) => {
    const params = new URLSearchParams();

    params.set("table", tableName);
    params.set("page", "1"); // best practice: cambio tabella => reset pagina

    if (keepParams?.sortBy) params.set("sortBy", keepParams.sortBy);
    if (keepParams?.sortDir) params.set("sortDir", keepParams.sortDir);

    return `${basePath}?${params.toString()}`;
  };

  return (
    <div className="relative inline-flex w-full sm:w-auto">
        <Button
        size="sm"
        variant="outline"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((v) => !v)}
        className="group inline-flex w-full items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-theme-sm font-medium text-gray-700 shadow-theme-xs transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200/60 dark:border-white/[0.10] dark:bg-white/[0.03] dark:text-gray-200 dark:hover:bg-white/[0.06] sm:w-auto"
        >
        <span className="max-w-[18rem] truncate capitalize">{currentTable} Table</span>
        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-aria-expanded:rotate-180" />
        </Button>

        <Dropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="z-50 min-w-[220px]"
        >
        <div className="max-h-72 overflow-auto py-1 custom-scrollbar">
            {items.map((t) => (
            <DropdownItem
                key={t}
                tag="a"
                href={buildHref(t)}
                onItemClick={() => setIsOpen(false)}
                className={
                t === currentTable
                    ? "bg-gray-100 font-medium text-gray-900 dark:bg-white/[0.06] dark:text-white"
                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/[0.04]"
                }
            >
                <span className="block max-w-[22rem] truncate">{t}</span>
            </DropdownItem>
            ))}
        </div>
        </Dropdown>
    </div>
);
}
