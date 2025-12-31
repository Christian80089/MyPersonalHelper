"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp, Maximize2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, Edit, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

interface CustomTableProps {
  data: any[] | null
  tableName: string
  pageSize?: number
  resizable?: boolean
  reorderable?: boolean
  className?: string
}

export function CustomTable({
  data,
  tableName,
  pageSize = 15,
  resizable = false,
  reorderable = false,
  className
}: CustomTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState("")
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const columns = data && data.length > 0 ? Object.keys(data[0]) : []
  const pageCount = Math.ceil((data?.length || 0) / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = data?.slice(startIndex, endIndex) || []

  const toggleRowSelection = (rowIndex: number) => {
    const id = data?.[rowIndex + (currentPage - 1) * pageSize]?._id || rowIndex.toString()
    const newSelection = new Set(selectedRows)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    setSelectedRows(newSelection)
  }

  const toggleAllSelection = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set())
    } else {
      const allIds = paginatedData.map((row, i) => row._id || i.toString())
      setSelectedRows(new Set(allIds))
    }
  }

  return (
    <div className={className}>
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6 pb-4 border-b">
        <div className="flex items-center gap-3 flex-wrap">
          <Checkbox 
            checked={selectedRows.size > 0 && selectedRows.size === paginatedData.length}
            onCheckedChange={toggleAllSelection}
            className="data-[state=checked]:bg-primary"
          />
          <div className="text-lg font-bold">
            {tableName} ({data?.length || 0} totali)
          </div>
          {selectedRows.size > 0 && (
            <Badge variant="secondary" className="text-sm">
              {selectedRows.size} selezionati
            </Badge>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Cerca..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select onValueChange={() => {
            setCurrentPage(1)
            // pageSize change handled by parent
          }}>
            <SelectTrigger className="w-24 h-10">
              <SelectValue placeholder={`${pageSize}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15</SelectItem>
              <SelectItem value="30">30</SelectItem>
              <SelectItem value="45">45</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabella Responsive */}
      <div className="overflow-x-auto rounded-2xl border bg-card shadow-xl">
        <Table>
          <TableHeader className="sticky top-0 z-20 bg-gradient-to-r from-muted/60 to-muted/30">
            <TableRow className="border-b-2 border-border hover:bg-transparent">
              <TableHead className="w-12">
                <Checkbox 
                  checked={selectedRows.size > 0 && selectedRows.size === paginatedData.length}
                  onCheckedChange={toggleAllSelection}
                />
              </TableHead>
              
              {columns.map((col) => (
                <TableHead
                  key={col}
                  className={`px-4 py-4 font-bold text-sm uppercase tracking-wide text-foreground whitespace-nowrap cursor-pointer hover:bg-muted/50 transition-colors ${
                    sortColumn === col ? 'bg-primary/20' : ''
                  } ${resizable ? 'resize-x' : ''}`}
                  onClick={() => {
                    if (sortColumn === col) {
                      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
                    } else {
                      setSortColumn(col)
                      setSortDirection('asc')
                    }
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span className="truncate">{col.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    {sortColumn === col && (
                      sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </div>
                </TableHead>
              ))}
              
              <TableHead className="w-32 text-center font-bold text-destructive">
                Azioni
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedData.map((row, i) => {
              const rowIndex = startIndex + i
              const rowId = row._id || rowIndex.toString()
              return (
                <TableRow key={rowId} className="group hover:bg-muted/50 border-b hover:border-b-primary/20 transition-all">
                  <TableCell className="w-12">
                    <Checkbox 
                      checked={selectedRows.has(rowId)}
                      onCheckedChange={() => toggleRowSelection(rowIndex)}
                    />
                  </TableCell>
                  
                  {columns.map((col) => (
                    <TableCell key={col} className="px-4 py-3 font-mono text-sm max-w-xs truncate">
                      <Badge 
                        variant={
                          col === 'status' 
                            ? 'default' 
                            : col.includes('amount') || col.includes('cost') || col.includes('total')
                            ? 'secondary'
                            : 'outline'
                        }
                        className="text-xs px-2 py-0.5"
                      >
                        {row[col]?.toString() || '-'}
                      </Badge>
                    </TableCell>
                  ))}
                  
                  <TableCell className="px-4 py-3">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      {reorderable && (
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Maximize2 className="h-3 w-3" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:bg-red-500/10 hover:text-red-600">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
            
            {paginatedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length + 2} className="h-64 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="h-12 w-12 text-muted-foreground/50" />
                    <div>Nessun dato trovato</div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex items-center justify-between mt-6 px-2">
          <div className="text-sm text-muted-foreground">
            Righe {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, data?.length || 0)} di {data?.length || 0}
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="h-9 w-9 p-0"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="h-9 w-9 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(p + 1, pageCount))}
              disabled={currentPage === pageCount}
              className="h-9 w-9 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(pageCount)}
              disabled={currentPage === pageCount}
              className="h-9 w-9 p-0"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}