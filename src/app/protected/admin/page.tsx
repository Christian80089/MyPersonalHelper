'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, BarChart3, Package, Shield, TrendingUp, DollarSign, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-400 text-lg">Panoramica completa del sistema</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
            Esporta dati
          </Button>
          <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
            Nuovo Utente
          </Button>
        </div>
      </div>

      {/* Stats Cards - ROW 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:shadow-2xl transition-all duration-300 border hover:border-blue-500/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Utenti Totali</CardTitle>
            <Users className="h-6 w-6 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">1,234</div>
            <p className="text-xs text-green-400 font-medium mt-1">+12% dal mese scorso</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:shadow-2xl transition-all duration-300 border hover:border-green-500/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Ricavi</CardTitle>
            <DollarSign className="h-6 w-6 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">€35,928</div>
            <p className="text-xs text-green-400 font-medium mt-1">+18% dal mese scorso</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:shadow-2xl transition-all duration-300 border hover:border-purple-500/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Profili Attivi</CardTitle>
            <Shield className="h-6 w-6 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">1,156</div>
            <p className="text-xs text-gray-400 font-medium mt-1">87 completati</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:shadow-2xl transition-all duration-300 border hover:border-orange-500/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Vendite Mese</CardTitle>
            <TrendingUp className="h-6 w-6 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">539</div>
            <p className="text-xs text-orange-400 font-medium mt-1">Target 75.5%</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content - ROW 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* Recent Users Table */}
        <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border-gray-700 col-span-1 xl:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Utenti Recenti</CardTitle>
              <Link href="/protected/admin/users" className="text-sm text-blue-400 hover:text-blue-300 font-medium">
                Vedi tutti →
              </Link>
            </div>
            <CardDescription className="text-gray-400">Ultimi 5 utenti registrati</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              {/* ✅ TableHeader OBPLIATORIO */}
              <TableHeader>
                <TableRow className="border-gray-700 hover:bg-gray-800/50">
                  <TableHead className="text-gray-300 font-medium">Nome</TableHead>
                  <TableHead className="text-gray-300 font-medium">Email</TableHead>
                  <TableHead className="text-gray-300 font-medium">Stato</TableHead>
                  <TableHead className="text-gray-300 font-medium text-right">Registrato</TableHead>
                </TableRow>
              </TableHeader>
              
              <TableBody>
                {[
                  { name: 'Christian D.', email: 'chris@email.com', status: 'active', date: '2025-12-31' },
                  { name: 'Mario R.', email: 'mario@email.com', status: 'pending', date: '2025-12-30' },
                ].map((user, i) => (
                  <TableRow key={i} className="border-gray-700 hover:bg-gray-800/50">
                    <TableCell className="font-medium text-white">{user.name}</TableCell>
                    <TableCell className="text-gray-300">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'active' ? 'default' : 'secondary'} className="bg-green-500/20 text-green-400 border-green-500/30">
                        {user.status === 'active' ? 'Attivo' : 'In attesa'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-gray-400 text-sm">{user.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Charts Section */}
        <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border-gray-700 col-span-1 xl:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Vendite Mensili</CardTitle>
                <CardDescription className="text-gray-400">Trend ultimi 6 mesi</CardDescription>
              </div>
              <Activity className="h-5 w-5 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {/* Chart Placeholder */}
            <div className="h-64 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center border border-gray-700/50 backdrop-blur-sm">
              <div className="text-center text-gray-400">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Grafico interattivo</p>
                <p className="text-sm">Verrà implementato nel prossimo step</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
