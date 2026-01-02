'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { 
  Search, Plus, Edit, Trash2, RefreshCw, ChevronLeft, ChevronRight 
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface TableData { [key: string]: any }

export default function TablesPage() {
  // Stati principali
  const [tables, setTables] = useState<{id: string, label: string}[]>([])
  const [selectedTable, setSelectedTable] = useState('')
  const [tableData, setTableData] = useState<TableData[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingTables, setLoadingTables] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [pageSize] = useState(25)
  const supabase = createClient()

  // 1. RECUPERA TABELLE AUTOMATICAMENTE
  const loadTables = useCallback(async () => {
    setLoadingTables(true)
    try {
      const { data, error } = await supabase.rpc('get_public_tables')
      if (error) throw error
      
      const tableList = data.map((t: any) => ({
        id: t.table_name,
        label: `${getTableIcon(t.table_name)} ${formatTableName(t.table_name)}`
      }))
      setTables(tableList)
      
      if (tableList.length > 0 && !selectedTable) {
        setSelectedTable(tableList[0].id)
      }
    } catch (error) {
      console.error('Errore caricamento tabelle:', error)
      setTables([{ id: 'users', label: '👥 Utenti (Fallback)' }])
    } finally {
      setLoadingTables(false)
    }
  }, [selectedTable])

  // 2. PAGINAZIONE + RICERCA PERFORMANTE
    const loadTableData = useCallback(async () => {
    if (!selectedTable) return
    
    setLoading(true)
    console.log('🚀 Caricando:', selectedTable, 'Pag:', page)
    
    try {
      const { data: simpleData, error: simpleError, count } = await supabase
        .from(selectedTable)
        .select(`*`)
        .range((page - 1) * pageSize, page * pageSize - 1)
      
      if (simpleError) {
        console.error('❌ SIMPLE ERROR:', simpleError.message)
        throw simpleError
      }
      
      console.log('✅ Data:', simpleData?.length, 'Total:', count)
      
      setTableData(simpleData || [])
      setTotalCount(count || 0)
      
      // ✅ TUTTE le colonne (max 15)
      if (simpleData?.length) {
        const allCols = Object.keys(simpleData[0])
          .filter(col => !col.startsWith('private_') && col !== 'password')
          .slice(0, 15)
        setColumns(allCols)
        console.log('✅ Colonne:', allCols.length, allCols)
      }
      
    } catch (error: any) {
      console.error('💥 Error:', error.message)
      alert(`Errore ${selectedTable}: ${error.message}\nProva a disabilitare RLS temporaneamente`)
      setTableData([])
    } finally {
      setLoading(false)
    }
  }, [selectedTable, page, pageSize])

  // Effects
  useEffect(() => {
    loadTables()
  }, [])

  useEffect(() => {
    if (selectedTable) {
      setPage(1)
      loadTableData()
    }
  }, [selectedTable, loadTableData])

  useEffect(() => {
    loadTableData()
  }, [page, loadTableData])

  // Utils
  const getTableIcon = (name: string) => {
    const icons: Record<string, string> = {
      users: '👥', profiles: '👤', orders: '📦', products: '🛍️',
      payments: '💳', invoices: '📄', categories: '📂', logs: '📊'
    }
    return icons[name] || '📋'
  }

  const formatTableName = (name: string) => 
    name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

  const filteredData = tableData // Già filtrato server-side

  // Pagination
  const totalPages = Math.ceil(totalCount / pageSize)
  const canPrev = page > 1
  const canNext = page < totalPages

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
            Gestore Tabelle Supabase
          </h1>
          <p className="text-gray-400 text-lg">
            {tables.length} tabelle scoperte automaticamente
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={loadTables} variant="outline">
            <RefreshCw className={cn("w-4 h-4 mr-2", loadingTables && "animate-spin")} />
            Refresh
          </Button>
          {selectedTable && (
            <Button asChild>
              <Link href={`/admin/tables/${selectedTable}/new`}>
                <Plus className="w-4 h-4 mr-2" />
                Nuovo {formatTableName(selectedTable)}
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Controls */}
      <Card className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-xl border-gray-700">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            {/* Table Selector */}
            <div className="flex items-center gap-3 flex-1">
              <span className="text-gray-400 font-medium min-w-[70px]">Tabella:</span>
              <Select 
                value={selectedTable} 
                onValueChange={setSelectedTable}
                disabled={loadingTables}
              >
                <SelectTrigger className="w-full lg:w-64 border-gray-600 bg-gray-900/50">
                  <SelectValue placeholder={loadingTables ? "Caricamento..." : "Seleziona tabella"} />
                </SelectTrigger>
                <SelectContent className="max-h-96">
                  {tables.map(table => (
                    <SelectItem key={table.id} value={table.id}>
                      <span className="mr-3 w-6 text-center">{table.label.split(' ')[0]}</span>
                      {table.label.split(' ').slice(1).join(' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search + Pagination */}
            <div className="flex gap-3 items-center flex-1 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Cerca records..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setPage(1)
                  }}
                  className="pl-10 bg-gray-900/50 border-gray-600"
                />
              </div>
              
              {totalCount > 0 && (
                <div className="flex items-center gap-1 text-sm text-gray-400">
                  <span>Pag. {page} di {totalPages}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPage(p => p - 1)}
                    disabled={!canPrev}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPage(p => p + 1)}
                    disabled={!canNext}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Table */}
      <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border-gray-700 flex-1">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">
                {selectedTable ? formatTableName(selectedTable) : 'Nessuna tabella'}
              </CardTitle>
              <CardDescription className="text-gray-400">
                {loading ? 'Caricamento...' : `${totalCount} total records | Pag. ${page}`}
              </CardDescription>
            </div>
            {selectedTable && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/tables/${selectedTable}`}>
                  CRUD Completo →
                </Link>
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {loadingTables ? (
            <div className="p-16 text-center text-gray-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
              Scoperta tabelle Supabase...
            </div>
          ) : loading ? (
            <div className="p-16 text-center text-gray-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
              Caricamento pagina {page}...
            </div>
          ) : !selectedTable ? (
            <div className="p-16 text-center text-gray-400">
              Seleziona una tabella per iniziare
            </div>
          ) : columns.length === 0 ? (
            <div className="p-16 text-center text-gray-400">
              Tabella vuota
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[70vh]">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700 hover:bg-gray-800/30 sticky top-0 bg-gray-900/50 backdrop-blur-sm z-10">
                    {columns.slice(0, 10).map((col, i) => (
                      <TableHead key={i} className="text-gray-300 font-medium max-w-[200px] truncate">
                        {formatColumnName(col)}
                      </TableHead>
                    ))}
                    <TableHead className="text-right text-gray-300 font-medium w-24">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((row, idx) => (
                    <TableRow key={`${row.id}-${idx}`} className="border-gray-700 hover:bg-gray-800/50">
                      {columns.slice(0, 10).map((col, colIdx) => (
                        <TableCell key={colIdx} className="text-sm max-w-[200px] truncate">
                          <span className="text-gray-200">{row[col] ?? '-'}</span>
                        </TableCell>
                      ))}
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button size="sm" variant="ghost" className="h-8 w-8 hover:bg-blue-500/20">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 hover:bg-red-500/20">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function formatColumnName(name: string) {
  return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).slice(0, 20)
}
